// SVG → PNG icon generator (run via `node scripts/build-icons.mjs`)
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const targets = [
  // Apple touch icon (iOS home screen)
  { src: "icon.svg",          out: "apple-touch-icon.png", size: 180 },
  // Android / Web manifest
  { src: "icon.svg",          out: "icon-192.png",         size: 192 },
  { src: "icon.svg",          out: "icon-512.png",         size: 512 },
  // Maskable (Android adaptive icons)
  { src: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
  // Favicon
  { src: "icon.svg",          out: "favicon-32.png",       size: 32 },
  { src: "icon.svg",          out: "favicon-16.png",       size: 16 },
];

for (const t of targets) {
  const svg = readFileSync(join(pub, t.src));
  const buf = await sharp(svg, { density: 384 })
    .resize(t.size, t.size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(pub, t.out), buf);
  console.log(`✓ ${t.out} (${t.size}px) ${buf.length} bytes`);
}
