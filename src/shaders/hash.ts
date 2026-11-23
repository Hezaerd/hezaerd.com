// PCG integer hashes, ported from @vgpu/wgsl-std/hash so the grain and the
// noise keep their exact bit patterns.
import { d } from "typegpu";

export function pcg2d(value: d.v2u): d.v2u {
  "use gpu";
  const hashed = value.mul(1664525).add(1013904223);
  hashed.x = hashed.x + hashed.y * 1664525;
  hashed.y = hashed.y + hashed.x * 1664525;
  hashed.x = hashed.x ^ (hashed.x >>> 16);
  hashed.y = hashed.y ^ (hashed.y >>> 16);
  hashed.x = hashed.x + hashed.y * 1664525;
  hashed.y = hashed.y + hashed.x * 1664525;
  hashed.x = hashed.x ^ (hashed.x >>> 16);
  hashed.y = hashed.y ^ (hashed.y >>> 16);
  return hashed;
}

export function pcg3d(value: d.v3u): d.v3u {
  "use gpu";
  const hashed = value.mul(1664525).add(1013904223);
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed.x = hashed.x ^ (hashed.x >>> 16);
  hashed.y = hashed.y ^ (hashed.y >>> 16);
  hashed.z = hashed.z ^ (hashed.z >>> 16);
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed.x = hashed.x ^ (hashed.x >>> 16);
  hashed.y = hashed.y ^ (hashed.y >>> 16);
  hashed.z = hashed.z ^ (hashed.z >>> 16);
  return hashed;
}

export function unitFloat(hash: number): number {
  "use gpu";
  return d.f32(hash >>> 8) * (1 / 16777216);
}
