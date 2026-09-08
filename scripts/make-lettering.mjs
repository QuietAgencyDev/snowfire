// Lifts the SnowFire.ca lettering out of the full logo.
//
//   node scripts/make-lettering.mjs
//
// The standalone wordmark is painted in pale gradients that measure 1.2:1 against
// our light surfaces, so anything on a light background wants the heavy
// blue-and-fire lettering instead. That only exists inside the composite logo,
// sat beneath the king — and he hangs over it, so no horizontal cut separates
// the two.
//
// Connectivity does separate them, but only once anti-aliased fringes stop
// bridging the gap, which is the reason SOLID sits so high.
import sharp from "sharp";

const SOURCE = "public/brand/snowfire-mascot.png";
const OUT = "public/brand/snowfire-lettering.png";

// Generous enough to hold every descender plus the shirt above them; the result
// is trimmed back to the ink at the end.
const BAND = { left: 0, top: 640, width: 900, height: 231 };

// Above this the two are one blob. Edge pixels below it are dropped from the
// search and swept up afterwards instead.
const SOLID = 220;

// The figure's soft edge falls under SOLID, so it survives the cut as a fringe.
// Widening the mask takes it, at the cost of shaving the same amount off letter
// tops he touches — invisible once this is drawn a sixth of its size.
const GROW = 2;
const SPECK = 300;
const WIDTH = 900;

const { data, info } = await sharp(SOURCE)
  .extract(BAND)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = width * height;
const alpha = (p) => data[p * channels + 3];

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

// Every blob of ink, so callers can ask which ones to keep.
function regions(opaque) {
  const seen = new Uint8Array(pixels);
  const found = [];

  for (let start = 0; start < pixels; start += 1) {
    if (seen[start] || !opaque(start)) {
      continue;
    }

    const members = [];
    const queue = [start];

    seen[start] = 1;

    while (queue.length > 0) {
      const p = queue.pop();

      members.push(p);

      for (const n of neighbours(p)) {
        if (!seen[n] && opaque(n)) {
          seen[n] = 1;
          queue.push(n);
        }
      }
    }

    found.push(members);
  }

  return found;
}

// The king reaches the top of the band; the lettering never does.
const figure = new Uint8Array(pixels);
let cut = 0;

for (const region of regions((p) => alpha(p) > SOLID)) {
  if (!region.some((p) => ((p / width) | 0) <= 1)) {
    continue;
  }

  cut += 1;

  for (const p of region) {
    figure[p] = 1;
  }
}

if (cut === 0) {
  throw new Error("found no figure above the lettering — has the logo moved?");
}

const clear = new Uint8Array(figure);

for (let p = 0; p < pixels; p += 1) {
  if (!figure[p]) {
    continue;
  }

  const x = p % width;
  const y = (p / width) | 0;

  for (let dy = -GROW; dy <= GROW; dy += 1) {
    for (let dx = -GROW; dx <= GROW; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        clear[ny * width + nx] = 1;
      }
    }
  }
}

for (let p = 0; p < pixels; p += 1) {
  if (clear[p]) {
    data[p * channels + 3] = 0;
  }
}

// Whatever the widened mask failed to reach is loose crumbs by now.
let swept = 0;

for (const region of regions((p) => alpha(p) > 40)) {
  if (region.length >= SPECK) {
    continue;
  }

  swept += 1;

  for (const p of region) {
    data[p * channels + 3] = 0;
  }
}

const written = await sharp(data, { raw: { width, height, channels } })
  .png()
  .trim({ threshold: 1 })
  .resize({ width: WIDTH, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

console.log(
  `${OUT} · lifted off ${cut} overlapping shape${cut === 1 ? "" : "s"} ` +
    `and ${swept} crumb${swept === 1 ? "" : "s"} · ` +
    `${written.width}x${written.height} · ${(written.size / 1024).toFixed(0)} KB`,
);
