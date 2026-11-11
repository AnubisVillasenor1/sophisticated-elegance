/**
 * Descarga las imágenes editoriales del PR y las guarda optimizadas en
 * public/editorial/ como WebP (sin dependencias remotas en producción).
 *
 * Uso: npm i --no-save sharp && node scripts/fetch-editorial.mjs
 */
import { statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const OUT = "public/editorial";
await mkdir(OUT, { recursive: true });

const SOURCES = [
  {
    file: "hero",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1vkmjqqcebVaQWZvZCCAA5I1Gg5YZx.png",
    quality: 80,
  },
  {
    file: "luz-de-jardin",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SevohqsSSJt9FL6uDNu949UFCq8RQe.png",
    quality: 80,
  },
  {
    file: "una-noche-en-marfil",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-F8sURc4uQhSo5kCumMzdedWGlMK8h3.png",
    quality: 80,
  },
  {
    file: "hora-dorada",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tbpfv7Y3oJI2XAtB1oSRPpkJhtyXOI.png",
    quality: 80,
  },
  {
    file: "atelier-nocturno",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Dzlsn0x1rYVbWMP5KWea4DD15JPNV2.png",
    quality: 80,
  },
];

for (const source of SOURCES) {
  const res = await fetch(source.url);
  if (!res.ok) throw new Error(`${source.file}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  const file = `${OUT}/${source.file}.webp`;

  await sharp(buffer).webp({ quality: source.quality, effort: 5 }).toFile(file);

  console.log(
    `${file.padEnd(40)} ${meta.width}x${meta.height}  ${(statSync(file).size / 1024).toFixed(1)} KB`,
  );
}
console.log("done");
