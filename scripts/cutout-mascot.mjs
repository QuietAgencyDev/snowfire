// Asset prep: lift a flat white studio background off a mascot render.
//
//   node scripts/cutout-mascot.mjs <src> <out> [width]
//
// Two passes, because a plain "delete every white pixel" would eat the snow:
//   1. Flood inward from the border, so white *inside* the art survives.
//   2. Clear leftover white pockets the flood could not reach — the gap under
//      an arm, the counter inside an "o".
//
// The hard part is pass 2, where a painted white such as the whites of his
// eyes looks much like backdrop to any single threshold. Three measurements
// together separate them; see the constants below.
import sharp from "sharp";

const [src, out, widthArg] = process.argv.slice(2);

if (!src || !out) {
  throw new Error("usage: cutout-mascot.mjs <src> <out> [width]");
}

// Pixels at or above SOLID are certainly background; the ramp down to LOOSE
// gives the cutout a soft edge instead of a jagged one.
const SOLID = 250;
const LOOSE = 235;

// Neutral: snow and its shadows carry a blue cast, backdrop does not.
// Flat: backdrop is one printed colour so its luminance barely moves, while
//   painted whites are shaded. This is the narrowest of the three — measured
//   backdrop tops out near 2.4 and painted whites start near 2.6 — so widen
//   it only against a render where you can check his eyes afterwards.
// Dense: a real gap fills much of its own bounding box, where speckle
//   scattered between snow clumps fills almost none of it.
const NEUTRAL_BLUE = 2;
const MAX_ROUGHNESS = 2.5;
const MIN_DENSITY = 0.3;
const MIN_POCKET = 64;

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = width * height;

const lo = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
const luma = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
const isWhitish = (p) => lo(p * channels) >= LOOSE;

const background = new Uint8Array(pixels);

function neighbours(p) {
  const x = p % width;
  const y = (p / width) | 0;
  const out = [];

  if (x > 0) out.push(p - 1);
  if (x < width - 1) out.push(p + 1);
  if (y > 0) out.push(p - width);
  if (y < height - 1) out.push(p + width);

  return out;
}

// Pass 1 — everything white that is reachable from the frame edge.
const stack = [];

for (let x = 0; x < width; x += 1) {
  stack.push(x, (height - 1) * width + x);
}

for (let y = 0; y < height; y += 1) {
  stack.push(y * width, y * width + width - 1);
}

while (stack.length > 0) {
  const p = stack.pop();

  if (background[p] || !isWhitish(p)) {
    continue;
  }

  background[p] = 1;

  for (const n of neighbours(p)) {
    if (!background[n] && isWhitish(n)) {
      stack.push(n);
    }
  }
}

// Pass 2 — the pockets the flood could not reach.
const seen = new Uint8Array(pixels);
let pockets = 0;

for (let start = 0; start < pixels; start += 1) {
  if (seen[start] || background[start] || !isWhitish(start)) {
    continue;
  }

  const region = [];
  const queue = [start];
  let blue = 0;
  let sum = 0;
  let sumSquares = 0;
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  seen[start] = 1;

  while (queue.length > 0) {
    const p = queue.pop();
    const i = p * channels;
    const x = p % width;
    const y = (p / width) | 0;
    const l = luma(i);

    region.push(p);
    blue += data[i + 2] - data[i];
    sum += l;
    sumSquares += l * l;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);

    for (const n of neighbours(p)) {
      if (!seen[n] && !background[n] && isWhitish(n)) {
        seen[n] = 1;
        queue.push(n);
      }
    }
  }

  const count = region.length;
  const mean = sum / count;
  const roughness = Math.sqrt(Math.max(0, sumSquares / count - mean * mean));
  const density = count / ((right - left + 1) * (bottom - top + 1));

  const isBackground =
    count >= MIN_POCKET &&
    blue / count < NEUTRAL_BLUE &&
    roughness < MAX_ROUGHNESS &&
    density >= MIN_DENSITY;

  if (isBackground) {
    pockets += 1;

    for (const p of region) {
      background[p] = 1;
    }
  }
}

let cleared = 0;

for (let p = 0; p < pixels; p += 1) {
  if (!background[p]) {
    continue;
  }

  const i = p * channels;
  const alpha = Math.max(
    0,
    Math.min(255, Math.round((255 * (SOLID - lo(i))) / (SOLID - LOOSE))),
  );

  data[i + 3] = alpha;

  if (alpha === 0) {
    cleared += 1;
  }
}

const cut = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();
const written = await sharp(cut)
  .trim({ threshold: 1 })
  .resize({ width: Number(widthArg) || 640, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true })
  .toFile(out);

console.log(
  `cleared ${((cleared / pixels) * 100).toFixed(1)}% of pixels ` +
    `(${pockets} pocket${pockets === 1 ? "" : "s"}) · ` +
    `${written.width}x${written.height} · ${(written.size / 1024).toFixed(0)} KB`,
);
