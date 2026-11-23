// Moves the flock one step.
//
// Every bird owns a point on a sheet in 3D. The sheet waves, bends and
// turns, and is projected flat: where it folds or turns edge-on, birds
// pile into dense bands, the way a murmuration darkens as it banks.
// Birds steer towards their projected point through a light curling wind,
// so they lag, overshoot and stream rather than sit on a grid.
import { d, std, tgpu } from "typegpu";

import { simplex3d } from "./simplex";

const Sim = d.struct({
  // Flock centre and pointer lean, in world units (height = 1, y down).
  centre: d.vec2f,
  aim: d.vec2f,
  time: d.f32,
  dt: d.f32,
  count: d.f32,
  // Flock size, in world units.
  scale: d.f32,
  // The pointer, in world units, and how present it is (0 gone, 1 here).
  cursor: d.vec2f,
  cursorOn: d.f32,
  // Radius birds keep clear of the pointer, in world units.
  avoidRadius: d.f32,
  kindA: d.f32,
  kindB: d.f32,
  turnA: d.vec2f,
  turnB: d.vec2f,
  // How far a grabbed formation turned since the last step; birds ride it.
  carryA: d.vec2f,
  carryB: d.vec2f,
  blend: d.f32,
});

const birdArray = (count: number) => d.arrayOf(d.vec4f, count);

const layout = tgpu.bindGroupLayout({
  sim: { uniform: Sim },
  // xy position, zw velocity.
  birds: { storage: birdArray, access: "mutable" },
  // xy point on the sheet, z drift, w agility.
  seeds: { storage: birdArray },
  // x perspective scale, y flap phase, z visibility.
  extra: { storage: birdArray, access: "mutable" },
  formA: { storage: birdArray },
  formB: { storage: birdArray },
});

function flockCurl(p: d.v2f, t: number): d.v2f {
  "use gpu";
  const e = 0.02;
  const up = simplex3d(d.vec3f(p.x, p.y + e, t));
  const down = simplex3d(d.vec3f(p.x, p.y - e, t));
  const right = simplex3d(d.vec3f(p.x + e, p.y, t));
  const left = simplex3d(d.vec3f(p.x - e, p.y, t));
  return d.vec2f(up - down, -(right - left)).div(2 * e);
}

// The sheet point for (u, v) at time t, projected: xy on screen, z the
// perspective scale (bigger is nearer).
function flockSheet(uv: d.v2f, drift: number, t: number): d.v3f {
  "use gpu";
  const u = uv.x + 0.04 * std.sin(t * 0.3 + drift * 6.2831);
  const v = uv.y;
  const p = d.vec3f(
    u,
    v * 0.42 + 0.22 * std.sin(u * 1.7 + t * 0.27),
    0.32 * std.sin(u * 2.1 + t * 0.33) + 0.18 * std.sin(v * 3 - u * 1.3 + t * 0.47),
  );

  // Bank: a slow yaw that sometimes turns the sheet nearly edge-on.
  const yaw = t * 0.1 + 1.25 * std.sin(t * 0.071);
  const pitch = 0.45 * std.sin(t * 0.093 + 0.8);
  return projectPoint(rotatePoint(p, d.vec2f(yaw, pitch)));
}

function rotatePoint(point: d.v3f, turn: d.v2f): d.v3f {
  "use gpu";
  const cy = std.cos(turn.x);
  const sy = std.sin(turn.x);
  const cp = std.cos(turn.y);
  const sp = std.sin(turn.y);
  const p = d.vec3f(point.x * cy - point.z * sy, point.y, point.x * sy + point.z * cy);
  return d.vec3f(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);
}

function projectPoint(p: d.v3f): d.v3f {
  "use gpu";
  const focal = 2.4;
  const s = focal / (focal + p.z);
  return d.vec3f(p.xy.mul(s), s);
}

function flockShape(seed: d.v4f, point: d.v4f, kind: number, turn: d.v2f, t: number): d.v4f {
  "use gpu";
  if (kind === 0) return d.vec4f(flockSheet(seed.xy, seed.z, t), 1);
  if (point.w === 1) return d.vec4f(projectPoint(point.xyz), 1);
  const rotated = rotatePoint(point.xyz, turn);
  return d.vec4f(projectPoint(rotated), 1 - std.smoothstep(0.02, 0.15, rotated.z));
}

// Where the turn since the last step moved this bird's point on screen, so
// birds ride a dragged globe instead of chasing it through their springs.
function flockCarry(point: d.v4f, kind: number, turn: d.v2f, carry: d.v2f): d.v2f {
  "use gpu";
  if (kind === 0 || point.w === 1) return d.vec2f(0, 0);
  const now = projectPoint(rotatePoint(point.xyz, turn));
  const before = projectPoint(rotatePoint(point.xyz, turn.sub(carry)));
  return now.xy.sub(before.xy);
}

const simulate = tgpu.computeFn({ in: { id: d.builtin.globalInvocationId }, workgroupSize: [64] })(({ id }) => {
  "use gpu";
  const params = layout.$.sim;
  const i = id.x;
  if (d.f32(i) >= params.count) {
    return;
  }
  const seed = layout.$.seeds[i];
  const bird = layout.$.birds[i];
  let pos = bird.xy;
  let vel = bird.zw;
  const t = params.time;

  let shape = flockShape(seed, layout.$.formA[i], params.kindA, params.turnA, t);
  if (params.blend > 0) {
    const next = flockShape(seed, layout.$.formB[i], params.kindB, params.turnB, t);
    shape = std.mix(shape, next, params.blend);
  }
  const goal = params.centre.add(params.aim).add(shape.xy.mul(params.scale));
  // Formations hold their outline: the wind drops to a breath while one is up,
  // and birds pull into place about 1.4x faster than they drift in the sheet.
  const form = std.mix(params.kindA, params.kindB, params.blend);
  const calm = std.mix(1, 0.15, form);
  const pull = std.mix(1, 1.41, form);
  const wind = flockCurl(pos.mul(2.4).add(d.vec2f(0, t * 0.04)), t * 0.1).mul(calm);
  const agility = 0.75 + 0.5 * seed.w;
  let accel = goal.sub(pos).mul(3.2 * pull * pull).mul(agility).add(wind.mul(0.04)).sub(vel.mul(1.7 * pull));

  // Scatter from the pointer: the closer it is, the harder they break away,
  // with a sideways swerve so they part around it instead of only fleeing.
  // Each bird has its own comfort distance, so the gap has a ragged edge.
  const reach = params.avoidRadius * (0.6 + 0.8 * seed.w) * (0.55 + 0.45 * params.cursorOn);
  const away = pos.sub(params.cursor);
  const gap = std.length(away);
  if (params.cursorOn > 0 && gap < reach && gap > 1e-5) {
    const dir = away.div(gap);
    const near = std.smoothstep(0, 1, 1 - gap / reach);
    const side = d.vec2f(-dir.y, dir.x);
    const swerve = side.mul(std.select(d.f32(-1), d.f32(1), std.dot(side, vel) >= 0));
    accel = accel.add(dir.mul(0.7).add(swerve.mul(0.5)).mul(near).mul(6).mul(params.cursorOn));
  }
  vel = vel.add(accel.mul(params.dt));

  const speed = std.length(vel);
  const cap = pull;
  if (speed > cap) {
    vel = vel.mul(cap / speed);
  }
  pos = pos.add(vel.mul(params.dt));
  const carryA = flockCarry(layout.$.formA[i], params.kindA, params.turnA, params.carryA);
  const carryB = flockCarry(layout.$.formB[i], params.kindB, params.turnB, params.carryB);
  pos = pos.add(std.mix(carryA, carryB, params.blend).mul(params.scale));
  layout.$.birds[i] = d.vec4f(pos, vel);
  layout.$.extra[i] = d.vec4f(shape.z, seed.z * 6.2831 + seed.w * 3, shape.w, 0);
});

export default tgpu.resolve([simulate]);
