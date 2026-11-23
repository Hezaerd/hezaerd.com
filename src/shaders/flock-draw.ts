// Draws every bird into the density buffer, one texel per grain cell.
// Blending adds birds up, so the flock's dense parts pile into solid
// ground and the grain pass turns it all into specks.
//
// Shapes (view.shape): 0 a soft speck, 1 a flapping bird, 2 a streak.
import { d, std, tgpu } from "typegpu";

const View = d.struct({
  aspect: d.f32,
  // Bird half-size at middle depth, in cells.
  radius: d.f32,
  // Density buffer size, in cells.
  grid: d.vec2f,
  // Density one bird adds at full coverage.
  strength: d.f32,
  time: d.f32,
  shape: d.f32,
  // How strongly depth changes a bird's size.
  depthSize: d.f32,
});

const birdArray = (count: number) => d.arrayOf(d.vec4f, count);

const layout = tgpu.bindGroupLayout({
  view: { uniform: View },
  birds: { storage: birdArray },
  extra: { storage: birdArray },
});

const BirdOut = {
  position: d.builtin.position,
  // Quad-local coordinates: x along the heading, y across it, both -1..1.
  local: d.vec2f,
  flap: d.interpolate("flat", d.f32),
  speed: d.interpolate("flat", d.f32),
};

const vertex = tgpu.vertexFn({
  in: { vi: d.builtin.vertexIndex, ii: d.builtin.instanceIndex },
  out: BirdOut,
})(({ vi, ii }) => {
  "use gpu";
  const params = layout.$.view;
  const corners = [d.vec2f(-1, -1), d.vec2f(1, -1), d.vec2f(-1, 1), d.vec2f(-1, 1), d.vec2f(1, -1), d.vec2f(1, 1)];
  const corner = corners[vi];
  const bird = layout.$.birds[ii];
  const more = layout.$.extra[ii];
  const speed = std.length(bird.zw);
  const heading = std.select(d.vec2f(1, 0), bird.zw.div(speed), speed > 1e-5);
  const side = d.vec2f(-heading.y, heading.x);

  const depth = std.pow(std.max(more.x, 0.1), params.depthSize);
  const size = ((params.radius * depth) / params.grid.y) * more.z;
  // Streaks lengthen with speed; the other shapes stay square.
  const stretch = std.select(1, 1 + std.min(speed * 6, 3), params.shape > 1.5);
  const p = bird.xy.add(heading.mul(corner.x).mul(stretch).add(side.mul(corner.y)).mul(size));

  return {
    position: d.vec4f((p.x / params.aspect) * 2 - 1, 1 - p.y * 2, 0, 1),
    local: corner,
    flap: std.sin(params.time * 9 + more.y),
    speed,
  };
});

function birdSegment(p: d.v2f, a: d.v2f, b: d.v2f): number {
  "use gpu";
  const pa = p.sub(a);
  const ba = b.sub(a);
  const h = std.clamp(std.dot(pa, ba) / std.dot(ba, ba), 0, 1);
  return std.length(pa.sub(ba.mul(h)));
}

const fragment = tgpu.fragmentFn({ in: BirdOut, out: d.vec4f })((bird) => {
  "use gpu";
  const params = layout.$.view;
  let w = d.f32(0);
  if (params.shape < 0.5) {
    w = std.exp(-std.dot(bird.local, bird.local) * 3);
  } else if (params.shape < 1.5) {
    // Seen from below: a body and two swept wings that beat up and down,
    // which from here shows as the span opening and closing.
    const span = std.mix(0.35, 0.95, 0.5 + 0.5 * bird.flap);
    const sweep = std.mix(-0.15, -0.55, 0.5 + 0.5 * bird.flap);
    const p = d.vec2f(bird.local.x, std.abs(bird.local.y));
    const wing = birdSegment(p, d.vec2f(0.3, 0), d.vec2f(sweep, span));
    const body = birdSegment(bird.local, d.vec2f(0.55, 0), d.vec2f(-0.45, 0));
    const dist = std.min(wing, body * 1.3);
    w = 1 - std.smoothstep(0.12, 0.24, dist);
  } else {
    // A streak, bright at the head and fading along the tail.
    const dist = birdSegment(bird.local, d.vec2f(-0.9, 0), d.vec2f(0.75, 0));
    const tail = std.smoothstep(-1, 0.75, bird.local.x);
    w = (1 - std.smoothstep(0.1, 0.3, dist)) * tail;
  }
  const v = w * params.strength;
  return d.vec4f(v, v, v, v);
});

export default tgpu.resolve([vertex, fragment]);
