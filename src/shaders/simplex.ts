// 3D simplex noise, ported from @vgpu/wgsl-std/noise/simplex: gradients come
// from pcg3d over the integer cell, so every backend picks the same one.
// abs(simplex3d(p)) stays under 0.98854.
import { d, std } from "typegpu";

import { pcg3d } from "./hash";

const F3 = 1 / 3;
const G3 = 1 / 6;

function gradIndex3(cell: d.v3i): number {
  "use gpu";
  return pcg3d(d.vec3u(cell)).x % 12;
}

// Perlin's 12 cube-edge gradients: index / 4 picks the component pair
// (xy, xz, yz), bits 0 and 1 the signs.
function gradDot3(index: number, offset: d.v3f): number {
  "use gpu";
  const pair = index >>> 2;
  const a = std.select(offset.x, offset.y, pair === 2);
  const b = std.select(std.select(offset.y, offset.z, pair === 1), offset.z, pair === 2);
  const sa = std.select(a, -a, (index & 1) !== 0);
  const sb = std.select(b, -b, (index & 2) !== 0);
  return sa + sb;
}

// Radius^2 is 0.5, not the folklore 0.6: at 0.5 the corner the traversal
// drops contributes exactly 0, so the field has no cracks.
function simplexKernel3(cell: d.v3i, offset: d.v3f): number {
  "use gpu";
  const t = 0.5 - std.dot(offset, offset);
  if (t <= 0) {
    return 0;
  }
  const t2 = t * t;
  return t2 * t2 * gradDot3(gradIndex3(cell), offset);
}

export function simplex3d(position: d.v3f): number {
  "use gpu";
  const skew = (position.x + position.y + position.z) * F3;
  const base = std.floor(position.add(skew));
  const cell = d.vec3i(base);
  const unskew = (base.x + base.y + base.z) * G3;
  const d0 = position.sub(base.sub(unskew));

  // The six orderings of d0's components pick which two middle corners of
  // the tetrahedron to visit. Collapsing this into arithmetic swaps a corner.
  let o1 = d.vec3f(0);
  let o2 = d.vec3f(0);
  if (d0.x >= d0.y) {
    if (d0.y >= d0.z) {
      o1 = d.vec3f(1, 0, 0);
      o2 = d.vec3f(1, 1, 0);
    } else if (d0.x >= d0.z) {
      o1 = d.vec3f(1, 0, 0);
      o2 = d.vec3f(1, 0, 1);
    } else {
      o1 = d.vec3f(0, 0, 1);
      o2 = d.vec3f(1, 0, 1);
    }
  } else {
    if (d0.y < d0.z) {
      o1 = d.vec3f(0, 0, 1);
      o2 = d.vec3f(0, 1, 1);
    } else if (d0.x < d0.z) {
      o1 = d.vec3f(0, 1, 0);
      o2 = d.vec3f(0, 1, 1);
    } else {
      o1 = d.vec3f(0, 1, 0);
      o2 = d.vec3f(1, 1, 0);
    }
  }

  const d1 = d0.sub(o1).add(G3);
  const d2 = d0.sub(o2).add(G3 * 2);
  const d3 = d0.sub(1).add(G3 * 3);
  let total = simplexKernel3(cell, d0);
  total = total + simplexKernel3(cell.add(d.vec3i(o1)), d1);
  total = total + simplexKernel3(cell.add(d.vec3i(o2)), d2);
  total = total + simplexKernel3(cell.add(d.vec3i(1, 1, 1)), d3);
  return 76 * total;
}
