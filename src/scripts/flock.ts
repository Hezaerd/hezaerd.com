import { clock, compute, draw, effect, frame, frameLoop, init, storage, surface, target } from "vgpu";

import drawShader from "@/shaders/flock-draw.wgsl";
import grainShader from "@/shaders/flock-grain.wgsl";
import simShader from "@/shaders/flock-sim.wgsl";

export type BirdShape = "speck" | "bird" | "streak";

interface FlockOptions {
  /** Flock centre in uv (y down); `narrow` applies under 768px wide. */
  centre: { wide: [number, number]; narrow: [number, number] };
  shape?: BirdShape;
  /** Grain cell in CSS pixels. */
  cell?: number;
  /** Element whose box the flock keeps quiet behind. */
  clear?: HTMLElement | null;
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

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

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
  let gpu: Awaited<ReturnType<typeof init>>;
  try {
    gpu = await init();
  } catch {
    return false;
  }

  const look = SHAPES[options.shape ?? "streak"];
  const narrow = () => canvas.clientWidth < 768;
  const count = narrow() ? look.narrow : look.wide;
  const cellCss = options.cell ?? 1.5;

  const screen = surface(gpu, canvas, { dpr: [1, 2], clearColor: [0, 0, 0, 1] });
  const cellPx = () => Math.max(1, Math.round(cellCss * screen.dpr));
  const gridFor = (w: number, h: number): [number, number] => [
    Math.max(1, Math.ceil(w / cellPx())),
    Math.max(1, Math.ceil(h / cellPx())),
  ];

  let res: [number, number] = [Math.max(1, canvas.width), Math.max(1, canvas.height)];
  let grid = gridFor(...res);
  const aspect = () => res[0] / res[1];

  const density = target(gpu, { size: grid, format: "rgba16float", label: "flock-density" });
  density.clearColor = [0, 0, 0, 0];

  const placeCentre = (): [number, number] => {
    const [u, v] = narrow() ? options.centre.narrow : options.centre.wide;
    return [u * aspect(), v];
  };
  const flockScale = () => 0.5 * Math.min(1, aspect() / 1.3);
  // Where the flock forms before it flies in: past the right edge, a little high.
  const offstage = (): [number, number] => [aspect() + flockScale() * 2.2, placeCentre()[1] - 0.25];

  const start = offstage();
  const birdData = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    birdData.set([start[0] + (Math.random() - 0.5) * 0.4, start[1] + (Math.random() - 0.5) * 0.3, 0, 0], i * 4);
  }
  const birds = storage(gpu, birdData.byteLength, "read-write");
  birds.write(birdData);
  const seedData = makeSeeds(count);
  const seeds = storage(gpu, seedData.byteLength, "read");
  seeds.write(seedData);
  const extra = storage(gpu, count * 16, "read-write");

  const simParams = {
    centre: start,
    aim: [0, 0] as [number, number],
    time: 30,
    dt: STEP,
    count,
    scale: flockScale(),
    cursor: [-10, -10] as [number, number],
    cursorOn: 0,
    avoidRadius: 0.1,
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
    cell: cellPx(),
    gain: look.gain,
    fadeBottom: 0.2,
    pad: 0,
  };

  const sim = compute(gpu, simShader, { label: "flock-sim", set: { sim: simParams, birds, seeds, extra } });
  const splat = draw(gpu, {
    shader: drawShader,
    label: "flock-draw",
    vertices: 6,
    instances: count,
    blend: "additive",
    set: { view: viewParams, birds, extra },
  });
  const grain = effect(gpu, grainShader, { label: "flock-grain", set: { grain: grainParams, density } });

  const measureClear = () => {
    const el = options.clear;
    if (!el) return;
    const c = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (c.width === 0 || c.height === 0) return;
    grainParams.clear = [
      (r.left - c.left + r.width / 2) / c.width,
      (r.top - c.top + r.height / 2) / c.height,
      (r.width / 2 + 24) / c.width,
      (r.height / 2 + 24) / c.height,
    ];
    grain.set({ grain: grainParams });
  };

  const step = (f: ReturnType<typeof frame>) => {
    sim.set({ sim: simParams });
    f.computePass((pass) => pass.dispatch(sim, Math.ceil(count / WORKGROUP)));
  };
  const render = (f: ReturnType<typeof frame>) => {
    splat.set({ view: viewParams });
    f.pass({ target: density, clear: [0, 0, 0, 0] }, splat);
    f.pass(screen, grain);
  };

  let resizePending = false;
  screen.onResize(({ width, height }) => {
    res = [width, height];
    grid = gridFor(width, height);
    if (resizePending) return;
    resizePending = true;
    // Resize events can arrive while a frame is open: apply them next tick.
    setTimeout(() => {
      resizePending = false;
      density.resize(grid);
      simParams.scale = flockScale();
      viewParams.aspect = aspect();
      viewParams.grid = grid;
      grainParams.res = res;
      grainParams.grid = grid;
      grainParams.cell = cellPx();
      grain.set({ grain: grainParams });
      measureClear();
      if (reducedMotion()) frame(gpu, render);
    });
  });
  if (options.clear) new ResizeObserver(measureClear).observe(options.clear);
  measureClear();

  // Let the flock take its shape off stage before anyone sees it.
  for (let i = 0; i < 150; i++) {
    frame(gpu, step);
    simParams.time += STEP;
  }

  if (reducedMotion()) {
    simParams.centre = placeCentre();
    for (let i = 0; i < 240; i++) {
      frame(gpu, step);
      simParams.time += STEP;
    }
    frame(gpu, render);
    canvas.dataset.state = "static";
    return true;
  }

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
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      pointerHere = false;
    });
  }

  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(canvas);

  const time = clock(gpu);
  let last = time.time;
  let alive = 0;
  frameLoop(
    gpu,
    (f) => {
      const now = time.time;
      const delta = Math.min(now - last, 0.1);
      last = now;
      if (!visible || document.hidden) return;
      alive += delta;
      simParams.time += delta;
      simParams.dt = Math.min(delta, STEP * 1.5);
      viewParams.time = simParams.time;
      simParams.aim[0] += (aim[0] - simParams.aim[0]) * 0.025;
      simParams.aim[1] += (aim[1] - simParams.aim[1]) * 0.025;
      // A moving pointer scares the birds; a resting one they get used to.
      pointerSpeed *= Math.exp(-delta * 2.5);
      const alarm = pointerHere ? 0.4 + 0.6 * Math.min(1, pointerSpeed / 0.6) : 0;
      simParams.cursorOn += (alarm - simParams.cursorOn) * 0.12;

      // Fly in from off stage, then wander a little around home.
      const home = placeCentre();
      const wander: [number, number] = [
        0.1 * Math.min(1, aspect()) * Math.sin(simParams.time * 0.13),
        0.06 * Math.sin(simParams.time * 0.17 + 1),
      ];
      const from = offstage();
      const k = easeOut(alive / ARRIVAL);
      simParams.centre = [
        from[0] + (home[0] + wander[0] - from[0]) * k,
        from[1] + (home[1] + wander[1] - from[1]) * k,
      ];
      step(f);
      render(f);
    },
    { fps: 60 },
  );
  canvas.dataset.state = "running";
  return true;
}
