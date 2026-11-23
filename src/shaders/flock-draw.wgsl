// Draws every bird into the density buffer, one texel per grain cell.
// Blending adds birds up, so the flock's dense parts pile into solid
// ground and the grain pass turns it all into specks.
//
// Shapes (view.shape): 0 a soft speck, 1 a flapping bird, 2 a streak.

struct View {
  aspect: f32,
  // Bird half-size at middle depth, in cells.
  radius: f32,
  // Density buffer size, in cells.
  grid: vec2f,
  // Density one bird adds at full coverage.
  strength: f32,
  time: f32,
  shape: f32,
  // How strongly depth changes a bird's size.
  depthSize: f32,
}

@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var<storage, read> birds: array<vec4f>;
@group(0) @binding(2) var<storage, read> extra: array<vec4f>;

struct BirdOut {
  @builtin(position) position: vec4f,
  // Quad-local coordinates: x along the heading, y across it, both -1..1.
  @location(0) local: vec2f,
  @location(1) @interpolate(flat) flap: f32,
  @location(2) @interpolate(flat) speed: f32,
}

@vertex fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> BirdOut {
  let corners = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  );
  let corner = corners[vi];
  let bird = birds[ii];
  let more = extra[ii];
  let speed = length(bird.zw);
  let heading = select(vec2f(1.0, 0.0), bird.zw / speed, speed > 1e-5);
  let side = vec2f(-heading.y, heading.x);

  let depth = pow(max(more.x, 0.1), view.depthSize);
  let size = view.radius * depth / view.grid.y;
  // Streaks lengthen with speed; the other shapes stay square.
  let stretch = select(1.0, 1.0 + min(speed * 6.0, 3.0), view.shape > 1.5);
  let p = bird.xy + (heading * corner.x * stretch + side * corner.y) * size;

  var out: BirdOut;
  out.position = vec4f(p.x / view.aspect * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  out.local = corner;
  out.flap = sin(view.time * 9.0 + more.y);
  out.speed = speed;
  return out;
}

fn birdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

@fragment fn fs_main(in: BirdOut) -> @location(0) vec4f {
  var w = 0.0;
  if (view.shape < 0.5) {
    w = exp(-dot(in.local, in.local) * 3.0);
  } else if (view.shape < 1.5) {
    // Seen from below: a body and two swept wings that beat up and down,
    // which from here shows as the span opening and closing.
    let span = mix(0.35, 0.95, 0.5 + 0.5 * in.flap);
    let sweep = mix(-0.15, -0.55, 0.5 + 0.5 * in.flap);
    let p = vec2f(in.local.x, abs(in.local.y));
    let wing = birdSegment(p, vec2f(0.3, 0.0), vec2f(sweep, span));
    let body = birdSegment(in.local, vec2f(0.55, 0.0), vec2f(-0.45, 0.0));
    let d = min(wing, body * 1.3);
    w = 1.0 - smoothstep(0.12, 0.24, d);
  } else {
    // A streak, bright at the head and fading along the tail.
    let d = birdSegment(in.local, vec2f(-0.9, 0.0), vec2f(0.75, 0.0));
    let tail = smoothstep(-1.0, 0.75, in.local.x);
    w = (1.0 - smoothstep(0.1, 0.3, d)) * tail;
  }
  let v = w * view.strength;
  return vec4f(v, v, v, v);
}
