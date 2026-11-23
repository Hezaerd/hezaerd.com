// Turns the flock's density into stochastic grain on true black.
//
// Each cell has a fixed random threshold, so a lone bird is a few loose
// specks and the dense core of the flock reads as solid, grainy white.

import { pcg2d, unitFloat } from "@vgpu/wgsl-std/hash";

struct Grain {
  // Canvas size in device pixels.
  res: vec2f,
  // Density buffer size in cells.
  grid: vec2f,
  // Text box to keep quiet: centre and half size, in uv (y down).
  clear: vec4f,
  // Cell size in device pixels.
  cell: f32,
  gain: f32,
  fadeBottom: f32,
  pad: f32,
}

@group(0) @binding(0) var<uniform> grain: Grain;
@group(0) @binding(1) var density: texture_2d<f32>;

fn grainClear(uv: vec2f) -> f32 {
  let aspect = grain.res.x / grain.res.y;
  let d = (abs(uv - grain.clear.xy) - grain.clear.zw) * vec2f(aspect, 1.0);
  let dist = length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
  return mix(0.08, 1.0, smoothstep(0.0, 0.1, dist));
}

@fragment fn fs_main(@builtin(position) frag: vec4f) -> @location(0) vec4f {
  let cellIndex = floor(frag.xy / grain.cell);
  let uv = (cellIndex + 0.5) * grain.cell / grain.res;
  let texel = clamp(vec2i(cellIndex), vec2i(0), vec2i(grain.grid) - vec2i(1));
  let d = textureLoad(density, texel, 0).r;

  var tone = 1.0 - exp(-d * grain.gain);
  tone *= grainClear(uv);
  tone *= smoothstep(0.0, grain.fadeBottom, 1.0 - uv.y);

  let bits = pcg2d(bitcast<vec2u>(vec2i(cellIndex)) + vec2u(7919u, 104729u));
  let threshold = unitFloat(bits.x);
  let shade = mix(0.6, 1.0, unitFloat(bits.y));
  let on = step(threshold, tone) * step(0.002, tone);
  let level = on * shade * mix(0.72, 1.0, tone);
  return vec4f(vec3f(level), 1.0);
}
