import { isLand } from "@/data/land";

export type Formation = "sheet" | ((count: number) => Float32Array | Promise<Float32Array>);

const radians = Math.PI / 180;
const circle = 2 * Math.PI;

export function globe(frontLat: number, frontLon: number): Formation {
  const cosFront = Math.cos(frontLat * radians);
  const sinFront = Math.sin(frontLat * radians);

  return (count) => {
    const points = new Float32Array(count * 4);
    const marker = Math.round(count * 0.035);
    for (let i = 0; i < count - marker; ) {
      const north = Math.random() * 2 - 1;
      const lat = Math.asin(north) / radians;
      const lon = Math.random() * 360 - 180;
      const equator = Math.sqrt(1 - north * north);
      const longitude = (lon - frontLon) * radians;
      const meridian = equator * Math.cos(longitude);
      const depth = -meridian * cosFront - north * sinFront;
      const ocean = 0.075 + 0.14 * Math.max(0, 1 - Math.abs(depth + 1 / 2.4) * 5);
      if (!isLand(lat, lon) && Math.random() > ocean) continue;

      points.set(
        [equator * Math.sin(longitude), meridian * sinFront - north * cosFront, depth],
        i++ * 4,
      );
    }
    for (let i = count - marker; i < count; i++) {
      const angle = Math.random() * circle;
      const radius = 0.052 + (Math.random() - 0.5) * 0.018;
      points.set([radius * Math.cos(angle), radius * Math.sin(angle), -Math.sqrt(1 - radius * radius)], i * 4);
    }
    return points;
  };
}

export function glyph(text: string): Formation {
  return async (count) => {
    const font = '640 320px "Hezaerd Sans", sans-serif';
    await document.fonts.ready;
    await document.fonts.load(font, text).catch(() => []);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const left = Math.ceil(metrics.actualBoundingBoxLeft);
    const top = Math.ceil(metrics.actualBoundingBoxAscent);
    const width = left + Math.ceil(metrics.actualBoundingBoxRight);
    const height = top + Math.ceil(metrics.actualBoundingBoxDescent);
    const points = new Float32Array(count * 4);
    if (width <= 0 || height <= 0) return points;

    canvas.width = width;
    canvas.height = height;
    ctx.font = font;
    ctx.fillText(text, left, top);
    const alpha = ctx.getImageData(0, 0, width, height).data;
    const pixels: number[] = [];
    for (let i = 0; i < width * height; i++) {
      if (alpha[i * 4 + 3] >= 128) pixels.push(i);
    }
    const scale = 2 / Math.max(width, height);
    for (let i = 0; i < count && pixels.length; i++) {
      const pixel = pixels[Math.floor(Math.random() * pixels.length)];
      const x = (pixel % width) + Math.random() - width / 2;
      const y = Math.floor(pixel / width) + Math.random() - height / 2;
      points.set([x * scale, y * scale, 0], i * 4);
    }
    return points;
  };
}

export function assignPoints(seeds: Float32Array, points: Float32Array): Float32Array<ArrayBuffer> {
  const count = seeds.length / 4;
  const strip = Math.ceil(Math.sqrt(count));
  const order = (cloud: Float32Array) => {
    const byX = Array.from({ length: count }, (_, i) => i).sort((a, b) => cloud[a * 4] - cloud[b * 4]);
    const ordered: number[] = [];
    for (let i = 0; i < count; i += strip) {
      ordered.push(...byX.slice(i, i + strip).sort((a, b) => cloud[a * 4 + 1] - cloud[b * 4 + 1]));
    }
    return ordered;
  };

  const birds = order(seeds);
  const targets = order(points);
  const assigned = new Float32Array(points.length);
  for (let i = 0; i < count; i++) {
    const offset = targets[i] * 4;
    assigned.set(points.subarray(offset, offset + 4), birds[i] * 4);
  }
  return assigned;
}
