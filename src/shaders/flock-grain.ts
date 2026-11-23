// Turns the flock's density into stochastic grain on true black.
//
// Each cell has a fixed random threshold, so a lone bird is a few loose
// specks and the dense core of the flock reads as solid, grainy white.
import { d, std, tgpu } from "typegpu";

import { pcg2d, unitFloat } from "./hash";

const Grain = d.struct({
  // Canvas size in device pixels.
  res: d.vec2f,
  // Density buffer size in cells.
  grid: d.vec2f,
  // Text box to keep quiet: centre and half size, in uv (y down).
  clear: d.vec4f,
  // How much the text box quiets the flock: 0 not at all, 1 fully.
  quiet: d.f32,
  // Cell size in device pixels.
  cell: d.f32,
  gain: d.f32,
  fadeBottom: d.f32,
});

const layout = tgpu.bindGroupLayout({
  grain: { uniform: Grain },
  density: { texture: d.texture2d(d.f32) },
});

function grainClear(uv: d.v2f): number {
  "use gpu";
  const params = layout.$.grain;
  const aspect = params.res.x / params.res.y;
  const edge = std.abs(uv.sub(params.clear.xy)).sub(params.clear.zw).mul(d.vec2f(aspect, 1));
  const dist = std.length(std.max(edge, d.vec2f(0))) + std.min(std.max(edge.x, edge.y), 0);
  return std.mix(1, std.mix(0.08, 1, std.smoothstep(0, 0.1, dist)), params.quiet);
}

const fragment = tgpu.fragmentFn({ in: { frag: d.builtin.position }, out: d.vec4f })(({ frag }) => {
  "use gpu";
  const params = layout.$.grain;
  const cellIndex = std.floor(frag.xy.div(params.cell));
  const texel = std.clamp(d.vec2i(cellIndex), d.vec2i(0), d.vec2i(params.grid).sub(1));
  const coverage = std.textureLoad(layout.$.density, texel, 0).x;
  const emptyCell = coverage <= 0;
  const black = d.vec4f(0, 0, 0, 1);
  if (emptyCell) {
    return black;
  }

  const uv = cellIndex.add(0.5).mul(params.cell).div(params.res);
  let tone = 1 - std.exp(-coverage * params.gain);
  tone *= grainClear(uv);
  tone *= std.smoothstep(0, params.fadeBottom, 1 - uv.y);

  const bits = pcg2d(d.vec2u(d.vec2i(cellIndex)).add(d.vec2u(7919, 104729)));
  const threshold = unitFloat(bits.x);
  const shade = std.mix(0.6, 1, unitFloat(bits.y));
  const on = std.step(threshold, tone) * std.step(0.002, tone);
  const level = on * shade * std.mix(0.72, 1, tone);
  return d.vec4f(d.vec3f(level), 1);
});

export default tgpu.resolve([fragment]);
