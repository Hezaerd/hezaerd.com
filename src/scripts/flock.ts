import { clock, compute, draw, effect, frame, frameLoop, init, storage, surface, target } from "vgpu";

import { assignPoints, type Formation } from "@/scripts/formations";
import drawShader from "@/shaders/flock-draw.ts?wgsl";
import grainShader from "@/shaders/flock-grain.ts?wgsl";
import simShader from "@/shaders/flock-sim.ts?wgsl";

export type BirdShape = "speck" | "bird" | "streak";

export interface FlockScene {
  form: Formation;
  /** Flock centre in uv (y down); `narrow` applies under 768px wide. */
  centre: { wide: [number, number]; narrow: [number, number] };
  scale: number;
  turn?: (time: number) => [yaw: number, pitch: number];
  grab?: boolean;
  /** Also flies the reserve birds, which hide in the murmuration, for formations that need more birds than it has. */
  reserve?: boolean;
}

interface Spin {
  yaw: number;
  pitch: number;
  yawSpeed: number;
  pitchSpeed: number;
  /** Yaw and pitch the birds were last carried to. */
  carried: [number, number];
}

interface FlockOptions {
  scenes: readonly [FlockScene, ...FlockScene[]];
  progress: () => number;
  signal: AbortSignal;
  shape?: BirdShape;
  /** Grain cell in CSS pixels. */
  cell?: number;
  /** Text boxes the flock keeps quiet behind, in scene order; null lets it fly over the text. */
  clear: readonly (HTMLElement | null)[];
  /** How far the flock leans towards the pointer, in world units. */
  follow?: number;
  /** Multiplies the bird size, for exploring. */
  size?: number;
}

/** Per-shape tuning: how many birds, how big, how much each adds. */
const SHAPES: Record<
  BirdShape,
  { wide: number; narrow: number; radius: number; strength: number; gain: number; shape: number }
> = {
  speck: { wide: 9000, narrow: 4500, radius: 1.2, strength: 0.55, gain: 2, shape: 0 },
  bird: { wide: 1100, narrow: 550, radius: 3.8, strength: 1.2, gain: 3.5, shape: 1 },
  streak: { wide: 4100, narrow: 2100, radius: 1.4, strength: 0.8, gain: 2, shape: 2 },
};

const WORKGROUP = 64;
const STEP = 1 / 30;
/** Seconds the flock takes to fly in from off screen. */
const ARRIVAL = 3.2;

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
const mix = (a: number, b: number, blend: number) => a + (b - a) * blend;
const shareClosed = (sharePerSixtieth: number, seconds: number) => 1 - Math.pow(1 - sharePerSixtieth, seconds * 60);
const clampPitch = (pitch: number) => Math.max(-1.2, Math.min(1.2, pitch));

export function smoothstep(low: number, high: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return x * x * (3 - 2 * x);
}

/**
 * Each bird's point on the sheet: spread fairly evenly inside a ragged,
 * lens-shaped outline, so the flock has crisp edges and its density comes
 * from folds and banking rather than from a blurry centre.
 */
function makeSeeds(count: number): Float32Array<ArrayBuffer> {
  const seeds = new Float32Array(count * 4);
  const lobes = [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28];
  for (let i = 0; i < count; i++) {
    let u = 0;
    let v = 0;
    for (let tries = 0; tries < 20; tries++) {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;
      const a = Math.atan2(v, u);
      const edge =
        0.82 + 0.1 * Math.sin(a * 3 + lobes[0]) + 0.06 * Math.sin(a * 5 + lobes[1]) + 0.04 * Math.sin(a * 9 + lobes[2]);
      if (Math.hypot(u, v * 1.15) < edge) break;
    }
    seeds.set([u, v, Math.random(), Math.random()], i * 4);
  }
  return seeds;
}

/**
 * Draws the flock into `canvas`. Resolves to false when WebGPU is
 * unavailable, so the caller keeps its still fallback on screen.
 */
export async function mountFlock(canvas: HTMLCanvasElement, options: FlockOptions): Promise<boolean> {
  const { scenes, progress, signal } = options;
  let gpu: Awaited<ReturnType<typeof init>>;
  try {
    gpu = await init();
  } catch {
    return false;
  }
  if (signal.aborted) {
    gpu.dispose();
    return false;
  }
  signal.addEventListener("abort", () => gpu.dispose(), { once: true });

  const look = SHAPES[options.shape ?? "streak"];
  const wide = window.matchMedia("(min-width: 48rem)");
  const flock = wide.matches ? look.wide : look.narrow;
  const count = flock * 2;
  const cellCss = options.cell ?? 1.5;
  const seedData = makeSeeds(count);
  const forms = await Promise.all(
    scenes.map(async ({ form, reserve }) => (form === "sheet" ? null : assignPoints(seedData, await form(reserve ? count : flock)))),
  );
  if (signal.aborted) return false;

  const screen = surface(gpu, canvas, { dpr: [1, 2], clearColor: [0, 0, 0, 1] });
  const cellPx = () => Math.max(1, Math.round(cellCss * screen.dpr));
  const gridFor = (w: number, h: number): [number, number] => [
    Math.max(1, Math.ceil(w / cellPx())),
    Math.max(1, Math.ceil(h / cellPx())),
  ];

  let res: [number, number] = [Math.max(1, canvas.width), Math.max(1, canvas.height)];
  let grid = gridFor(...res);
  const aspect = () => res[0] / res[1];

  const density = target(gpu, { size: grid, format: "r16float", label: "flock-density" });
  density.clearColor = [0, 0, 0, 0];

  const placeCentre = ({ centre }: FlockScene): [number, number] => {
    const [u, v] = wide.matches ? centre.wide : centre.narrow;
    return [u * aspect(), v];
  };
  const flockScale = () => 0.5 * Math.min(1, aspect() / 1.3);
  // Where the flock forms before it flies in: past the right edge, a little high.
  const offstage = (): [number, number] => [aspect() + flockScale() * 2.2, placeCentre(scenes[0])[1] - 0.25];

  const start = offstage();
  const birdData = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    birdData.set([start[0] + (Math.random() - 0.5) * 0.4, start[1] + (Math.random() - 0.5) * 0.3, 0, 0], i * 4);
  }
  const birds = storage(gpu, birdData.byteLength, "read-write");
  birds.write(birdData);
  const seeds = storage(gpu, seedData.byteLength, "read");
  seeds.write(seedData);
  const extra = storage(gpu, count * 16, "read-write");
  const formA = storage(gpu, seedData.byteLength, "read");
  const formB = storage(gpu, seedData.byteLength, "read");
  const noTurn: [number, number] = [0, 0];

  const simParams = {
    centre: start,
    aim: [0, 0] as [number, number],
    time: 30,
    dt: STEP,
    count,
    flock,
    scale: flockScale(),
    cursor: [-10, -10] as [number, number],
    cursorOn: 0,
    avoidRadius: 0.1,
    kindA: 0,
    kindB: 0,
    turnA: noTurn,
    turnB: noTurn,
    carryA: noTurn,
    carryB: noTurn,
    blend: 0,
  };
  const viewParams = {
    aspect: aspect(),
    radius: look.radius * (options.size ?? 1),
    grid,
    strength: look.strength,
    time: 0,
    shape: look.shape,
    depthSize: 2.2,
  };
  const grainParams = {
    res,
    grid,
    clear: [0, 0, 0, 0] as [number, number, number, number],
    quiet: 0,
    cell: cellPx(),
    gain: look.gain,
    fadeBottom: 0.2,
  };

  const sim = compute(gpu, simShader, { label: "flock-sim", set: { sim: simParams, birds, seeds, extra, formA, formB } });
  const splat = draw(gpu, {
    shader: drawShader,
    label: "flock-draw",
    vertices: 6,
    instances: count,
    blend: "additive",
    set: { view: viewParams, birds, extra },
  });
  const grain = effect(gpu, grainShader, { label: "flock-grain", set: { grain: grainParams, density } });

  type Rect = [number, number, number, number];
  let clearRects: (Rect | null)[] = [];
  const measureClear = () => {
    const c = canvas.getBoundingClientRect();
    if (c.width === 0 || c.height === 0) return;
    clearRects = options.clear.map((el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [
        (r.left - c.left + r.width / 2) / c.width,
        (r.top - c.top + r.height / 2) / c.height,
        (r.width / 2 + 24) / c.width,
        (r.height / 2 + 24) / c.height,
      ];
    });
  };

  let segment = -1;
  const lastScene = scenes.length - 1;
  const spins = scenes.map<Spin | null>(({ grab }) => (grab ? { yaw: 0, pitch: 0, yawSpeed: 0, pitchSpeed: 0, carried: [0, 0] } : null));
  const sceneTurn = (i: number, time: number): [number, number] => {
    const turn = scenes[i].turn?.(time) ?? noTurn;
    const spin = spins[i];
    return spin ? [turn[0] + spin.yaw, turn[1] + spin.pitch] : turn;
  };
  const sceneCarry = (i: number): [number, number] => {
    const spin = spins[i];
    return spin ? [spin.yaw - spin.carried[0], spin.pitch - spin.carried[1]] : noTurn;
  };
  const updateScene = (p: number, time: number, wander = 0) => {
    const i = Math.floor(p);
    const j = Math.min(i + 1, lastScene);
    const a = scenes[i];
    const b = scenes[j];
    if (segment !== i) {
      const pointsA = forms[i];
      const pointsB = forms[j];
      if (pointsA) formA.write(pointsA);
      if (pointsB) formB.write(pointsB);
      simParams.kindA = pointsA ? 1 : 0;
      simParams.kindB = pointsB ? 1 : 0;
      segment = i;
    }
    const blend = smoothstep(0.2, 0.8, p - i);
    simParams.blend = blend;
    simParams.turnA = sceneTurn(i, time);
    simParams.turnB = sceneTurn(j, time);
    simParams.carryA = sceneCarry(i);
    simParams.carryB = sceneCarry(j);
    simParams.scale = flockScale() * mix(a.scale, b.scale, blend);

    const [ax, ay] = placeCentre(a);
    const [bx, by] = placeCentre(b);
    const drift = wander * (1 - mix(simParams.kindA, simParams.kindB, blend));
    simParams.centre = [
      mix(ax, bx, blend) + drift * (0.1 * Math.min(1, aspect()) * Math.sin(time * 0.13)),
      mix(ay, by, blend) + drift * (0.06 * Math.sin(time * 0.17 + 1)),
    ];

    // A scene without a box fades the other scene's box out in place, rather than sliding it away.
    const clearA = clearRects[i] ?? null;
    const clearB = clearRects[j] ?? null;
    const rectA: Rect = clearA ?? clearB ?? [0, 0, 0, 0];
    const rectB: Rect = clearB ?? rectA;
    grainParams.quiet = mix(clearA ? 1 : 0, clearB ? 1 : 0, blend);
    grainParams.clear = [
      mix(rectA[0], rectB[0], blend),
      mix(rectA[1], rectB[1], blend),
      mix(rectA[2], rectB[2], blend),
      mix(rectA[3], rectB[3], blend),
    ];
  };
  const readProgress = () => Math.max(0, Math.min(lastScene, progress()));

  const step = (f: ReturnType<typeof frame>) => {
    sim.set({ sim: simParams });
    f.computePass((pass) => pass.dispatch(sim, Math.ceil(count / WORKGROUP)));
  };
  const render = (f: ReturnType<typeof frame>) => {
    splat.set({ view: viewParams });
    grain.set({ grain: grainParams });
    f.pass({ target: density, clear: [0, 0, 0, 0] }, splat);
    f.pass(screen, grain);
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let staticScene = -1;
  const settleScene = (scene: number) => {
    staticScene = scene;
    updateScene(scene, 0);
    simParams.dt = STEP;
    for (let i = 0; i < 240; i++) {
      frame(gpu, step);
      simParams.time += STEP;
    }
    frame(gpu, render);
  };

  let resizePending = false;
  screen.onResize(({ width, height }) => {
    res = [width, height];
    grid = gridFor(width, height);
    if (resizePending) return;
    resizePending = true;
    // Resize events can arrive while a frame is open: apply them next tick.
    setTimeout(() => {
      if (signal.aborted) return;
      resizePending = false;
      density.resize(grid);
      viewParams.aspect = aspect();
      viewParams.grid = grid;
      grainParams.res = res;
      grainParams.grid = grid;
      grainParams.cell = cellPx();
      measureClear();
      if (reducedMotion) settleScene(Math.round(readProgress()));
    });
  });
  const clearObserver = new ResizeObserver(() => {
    measureClear();
    if (reducedMotion && staticScene >= 0) {
      updateScene(staticScene, 0);
      frame(gpu, render);
    }
  });
  for (const el of options.clear) if (el) clearObserver.observe(el);
  signal.addEventListener("abort", () => clearObserver.disconnect(), { once: true });
  measureClear();

  // Let the flock take its shape off stage before anyone sees it.
  updateScene(0, 0);
  simParams.centre = start;
  for (let i = 0; i < 150; i++) {
    frame(gpu, step);
    simParams.time += STEP;
  }

  if (reducedMotion) {
    settleScene(Math.round(readProgress()));
    const updateStatic = () => {
      if (signal.aborted) return;
      const scene = Math.round(readProgress());
      if (scene !== staticScene) settleScene(scene);
      requestAnimationFrame(updateStatic);
    };
    requestAnimationFrame(updateStatic);
    canvas.dataset.state = "static";
    return true;
  }

  let drag: { id: number; spin: Spin; x: number; y: number; time: number } | null = null;
  let hover: PointerEvent | null = null;
  const hitsDisc = ({ clientX, clientY }: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const [x, y] = simParams.centre;
    const dx = clientX - r.left - (x + simParams.aim[0]) * (r.width / aspect());
    const dy = clientY - r.top - (y + simParams.aim[1]) * r.height;
    return Math.hypot(dx, dy) < simParams.scale * r.height;
  };
  const endDrag = (event?: PointerEvent) => {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const { id, spin, time } = drag;
    drag = null;
    if (event?.type !== "pointerup" || event.timeStamp - time > 80) {
      spin.yawSpeed = 0;
      spin.pitchSpeed = 0;
    }
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  };
  canvas.addEventListener("pointerdown", (event) => {
    const spin = spins[Math.round(readProgress())];
    if (!spin || drag || !event.isPrimary || event.button !== 0 || !hitsDisc(event)) return;
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    spin.yawSpeed = 0;
    spin.pitchSpeed = 0;
    drag = { id: event.pointerId, spin, x: event.clientX, y: event.clientY, time: event.timeStamp };
    canvas.style.cursor = "grabbing";
  }, { signal });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") hover = event;
    if (!drag || drag.id !== event.pointerId) return;
    const { spin, x, y, time } = drag;
    const radius = simParams.scale * canvas.getBoundingClientRect().height;
    if (!radius) return;
    const yaw = (event.clientX - x) / radius;
    const pitch = clampPitch(spin.pitch + (event.clientY - y) / radius);
    const dt = Math.max((event.timeStamp - time) / 1000, 0.016);
    spin.yawSpeed = yaw / dt;
    spin.pitchSpeed = (pitch - spin.pitch) / dt;
    spin.yaw += yaw;
    spin.pitch = pitch;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.time = event.timeStamp;
  }, { signal });
  canvas.addEventListener("pointerleave", () => (hover = null), { signal });
  canvas.addEventListener("pointerup", endDrag, { signal });
  canvas.addEventListener("pointercancel", endDrag, { signal });
  canvas.addEventListener("lostpointercapture", endDrag, { signal });

  // The flock drifts towards the pointer, and birds near it scatter.
  const follow = options.follow ?? 0;
  const aim: [number, number] = [0, 0];
  let pointerHere = false;
  // How fast the pointer has moved lately, in world units per second.
  let pointerSpeed = 0;
  let lastMove = { x: 0, y: 0, t: 0 };
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        const r = canvas.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width;
        const y = (event.clientY - r.top) / r.height;
        pointerHere = x >= 0 && x <= 1 && y >= 0 && y <= 1;
        if (!pointerHere) return;
        const now = performance.now();
        const wx = x * aspect();
        const dt = Math.max((now - lastMove.t) / 1000, 1e-3);
        if (dt < 0.2) pointerSpeed = Math.max(pointerSpeed, Math.hypot(wx - lastMove.x, y - lastMove.y) / dt);
        lastMove = { x: wx, y, t: now };
        simParams.cursor = [wx, y];
        aim[0] = (x - 0.5) * follow * aspect();
        aim[1] = (y - 0.5) * follow;
      },
      { passive: true, signal },
    );
    document.documentElement.addEventListener("pointerleave", () => (pointerHere = false), { signal });
  }

  let visible = true;
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersection.observe(canvas);
  signal.addEventListener("abort", () => intersection.disconnect(), { once: true });

  const time = clock(gpu);
  let last = time.time;
  let alive = 0;
  frameLoop(gpu, (f) => {
    const now = time.time;
    const delta = Math.min(now - last, 0.1);
    last = now;
    if (!visible || document.hidden) return;
    alive += delta;
    simParams.time += delta;
    simParams.dt = Math.min(delta, STEP * 1.5);
    viewParams.time = simParams.time;
    const lean = shareClosed(0.025, delta);
    simParams.aim[0] += (aim[0] - simParams.aim[0]) * lean;
    simParams.aim[1] += (aim[1] - simParams.aim[1]) * lean;
    const p = readProgress();
    const activeSpin = spins[Math.round(p)];
    if (drag && drag.spin !== activeSpin) endDrag();
    const damping = Math.exp(-delta * 2.5);
    for (const spin of spins) {
      if (!spin || spin === drag?.spin) continue;
      const travel = (1 - damping) / 2.5;
      spin.yaw += spin.yawSpeed * travel;
      spin.pitch = clampPitch(spin.pitch + spin.pitchSpeed * travel);
      spin.yawSpeed *= damping;
      spin.pitchSpeed *= damping;
    }
    // A moving pointer scares the birds; a resting one they get used to.
    pointerSpeed *= damping;
    const alarm = pointerHere && !activeSpin ? 0.4 + 0.6 * Math.min(1, pointerSpeed / 0.6) : 0;
    simParams.cursorOn += (alarm - simParams.cursorOn) * shareClosed(0.12, delta);

    // Fly in from off stage, then wander a little around home.
    updateScene(p, simParams.time, 1);
    for (const spin of spins) if (spin) spin.carried = [spin.yaw, spin.pitch];
    const home = simParams.centre;
    const from = offstage();
    const k = easeOut(alive / ARRIVAL);
    simParams.centre = [mix(from[0], home[0], k), mix(from[1], home[1], k)];
    const cursor = drag ? "grabbing" : activeSpin && hover && hitsDisc(hover) ? "grab" : "";
    if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;
    step(f);
    render(f);
  });
  canvas.dataset.state = "running";
  return true;
}
