// Builds the home-screen and tab icons from the mascot.
//
//   node scripts/make-icons.mjs
//
// Home-screen slots are square and the full logo is not, so this crops to the
// head and crown — the part still readable once Android shrinks it to 96px —
// and sits it on the brand blue. Transparency is deliberately dropped: an
// installed icon lands on whatever wallpaper the user has, and iOS fills any
// alpha with black.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/brand/snowfire-mascot.png";
const HEAD = { left: 312, top: 0, width: 236, height: 310 };
const BACKGROUND = "#0f3d7a";

// How much of each canvas the artwork fills. Maskable icons get cropped to a
// circle by the launcher, and only the middle 80% is guaranteed to survive, so
// that one is drawn much smaller inside the same square.
const INSET = 0.84;
const MASKABLE_INSET = 0.6;

const icons = [
  { file: "snowfire-icon-192.png", size: 192, inset: INSET },
  { file: "snowfire-icon-512.png", size: 512, inset: INSET },
  { file: "snowfire-icon-maskable.png", size: 512, inset: MASKABLE_INSET },
  { file: "snowfire-apple-touch.png", size: 180, inset: 0.8 },
];

// Browsers still reach for favicon.ico before anything in the manifest, so it
// has to be branded too. Sizes a tab actually picks from.
const FAVICON = "src/app/favicon.ico";
const FAVICON_SIZES = [16, 32, 48, 64];

const head = await sharp(SOURCE).extract(HEAD).toBuffer();

async function square(size, inset) {
  const box = Math.round(size * inset);
  const art = await sharp(head)
    .resize({ width: box, height: box, fit: "inside" })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  }).composite([{ input: art, gravity: "center" }]);
}

// Minimal ICO container. Every entry is just a PNG, which every browser we
// care about reads, so this needs no encoder beyond sharp.
function packIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  const table = Buffer.alloc(16 * frames.length);
  let offset = header.length + table.length;

  frames.forEach(({ size, png }, i) => {
    const at = i * 16;

    table.writeUInt8(size >= 256 ? 0 : size, at);
    table.writeUInt8(size >= 256 ? 0 : size, at + 1);
    table.writeUInt16LE(1, at + 4);
    table.writeUInt16LE(32, at + 6);
    table.writeUInt32LE(png.length, at + 8);
    table.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });

  return Buffer.concat([header, table, ...frames.map((f) => f.png)]);
}

for (const { file, size, inset } of icons) {
  const canvas = await square(size, inset);
  const written = await canvas
    .png({ compressionLevel: 9, palette: true })
    .toFile(`public/brand/${file}`);

  console.log(
    `${file} · ${written.width}x${written.height} · ${(written.size / 1024).toFixed(0)} KB`,
  );
}

const frames = [];

for (const size of FAVICON_SIZES) {
  const canvas = await square(size, INSET);

  frames.push({ size, png: await canvas.png({ compressionLevel: 9 }).toBuffer() });
}

const ico = packIco(frames);

await writeFile(FAVICON, ico);

console.log(
  `${FAVICON} · ${FAVICON_SIZES.join("/")} · ${(ico.length / 1024).toFixed(0)} KB`,
);
