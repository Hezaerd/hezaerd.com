// Moves the flock one step.
//
// Every bird owns a point on a sheet in 3D. The sheet waves, bends and
// turns, and is projected flat: where it folds or turns edge-on, birds
// pile into dense bands, the way a murmuration darkens as it banks.
// Birds steer towards their projected point through a light curling wind,
// so they lag, overshoot and stream rather than sit on a grid.

import { simplex3d } from "@vgpu/wgsl-std/noise/simplex";

struct Sim {
  // Flock centre and pointer lean, in world units (height = 1, y down).
  centre: vec2f,
  aim: vec2f,
  time: f32,
  dt: f32,
  count: f32,
  // Flock size, in world units.
  scale: f32,
  // The pointer, in world units, and how present it is (0 gone, 1 here).
  cursor: vec2f,
  cursorOn: f32,
  // Radius birds keep clear of the pointer, in world units.
  avoidRadius: f32,
}

@group(0) @binding(0) var<uniform> sim: Sim;
// xy position, zw velocity.
@group(0) @binding(1) var<storage, read_write> birds: array<vec4f>;
// xy point on the sheet, z drift, w agility.
@group(0) @binding(2) var<storage, read> seeds: array<vec4f>;
// x depth (perspective scale), y flap phase.
@group(0) @binding(3) var<storage, read_write> extra: array<vec4f>;

fn flockCurl(p: vec2f, t: f32) -> vec2f {
  let e = 0.02;
  let up = simplex3d(vec3f(p.x, p.y + e, t));
  let down = simplex3d(vec3f(p.x, p.y - e, t));
  let right = simplex3d(vec3f(p.x + e, p.y, t));
  let left = simplex3d(vec3f(p.x - e, p.y, t));
  return vec2f(up - down, -(right - left)) / (2.0 * e);
}

// The sheet point for (u, v) at time t, projected: xy on screen, z the
// perspective scale (bigger is nearer).
fn flockSheet(uv: vec2f, drift: f32, t: f32) -> vec3f {
  let u = uv.x + 0.04 * sin(t * 0.3 + drift * 6.2831);
  let v = uv.y;
  var p = vec3f(
    u,
    v * 0.42 + 0.22 * sin(u * 1.7 + t * 0.27),
    0.32 * sin(u * 2.1 + t * 0.33) + 0.18 * sin(v * 3.0 - u * 1.3 + t * 0.47),
  );

  // Bank: a slow yaw that sometimes turns the sheet nearly edge-on.
  let yaw = t * 0.1 + 1.25 * sin(t * 0.071);
  let cy = cos(yaw);
  let sy = sin(yaw);
  p = vec3f(p.x * cy - p.z * sy, p.y, p.x * sy + p.z * cy);

  let pitch = 0.45 * sin(t * 0.093 + 0.8);
  let cp = cos(pitch);
  let sp = sin(pitch);
  p = vec3f(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);

  let focal = 2.4;
  let s = focal / (focal + p.z);
  return vec3f(p.xy * s, s);
}

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (f32(i) >= sim.count) {
    return;
  }
  let seed = seeds[i];
  var bird = birds[i];
  var pos = bird.xy;
  var vel = bird.zw;
  let t = sim.time;

  let sheet = flockSheet(seed.xy, seed.z, t);
  let goal = sim.centre + sim.aim + sheet.xy * sim.scale;
  let wind = flockCurl(pos * 2.4 + vec2f(0.0, t * 0.04), t * 0.1);
  let agility = 0.75 + 0.5 * seed.w;
  var accel = (goal - pos) * 3.2 * agility + wind * 0.04 - vel * 1.7;

  // Scatter from the pointer: the closer it is, the harder they break away,
  // with a sideways swerve so they part around it instead of only fleeing.
  // Each bird has its own comfort distance, so the gap has a ragged edge.
  let reach = sim.avoidRadius * (0.6 + 0.8 * seed.w) * (0.55 + 0.45 * sim.cursorOn);
  let away = pos - sim.cursor;
  let gap = length(away);
  if (sim.cursorOn > 0.0 && gap < reach && gap > 1e-5) {
    let dir = away / gap;
    let near = smoothstep(0.0, 1.0, 1.0 - gap / reach);
    let side = vec2f(-dir.y, dir.x);
    let swerve = side * select(-1.0, 1.0, dot(side, vel) >= 0.0);
    accel += (dir * 0.7 + swerve * 0.5) * near * 6.0 * sim.cursorOn;
  }
  vel += accel * sim.dt;

  let speed = length(vel);
  let cap = 1.0;
  if (speed > cap) {
    vel *= cap / speed;
  }
  pos += vel * sim.dt;
  birds[i] = vec4f(pos, vel);
  extra[i] = vec4f(sheet.z, seed.z * 6.2831 + seed.w * 3.0, 0.0, 0.0);
}
