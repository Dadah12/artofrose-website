// Requirements: Node 18+  ->  npm i sharp
// Run: node tools/convert-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputRoot = path.resolve("./images");
const outThumb = path.resolve("./optimized/thumbs");
const outFull = path.resolve("./optimized/full");

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const THUMB_W = 640; // light
const FULL_W = 1600; // good for lightbox
const Q_WEBP = 72;
const Q_AVIF = 55;

// watermark.png path (as you want)
const watermarkName = "watermark.png"; // put at images/watermark.png
const WM_SCALE = 0.18; // ~18% of image width
const WM_PADDING = 16; // px from edges

const ensureDir = async (d) => fs.promises.mkdir(d, { recursive: true });
const isImg = (f) => ALLOWED.has(path.extname(f).toLowerCase());
async function* walk(dir) {
  for (const d of await fs.promises.readdir(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".") || d.name.startsWith("~")) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function findWatermark() {
  for await (const f of walk(inputRoot)) {
    if (path.basename(f).toLowerCase() === watermarkName) return f;
  }
  return null;
}

async function resizedWM(buf, width) {
  const wmW = Math.max(1, Math.round(width * WM_SCALE));
  return await sharp(buf)
    .resize({ width: wmW, withoutEnlargement: true })
    .png()
    .toBuffer();
}

async function compositeWM(img, wmBuf) {
  const meta = await img.metadata();
  const wm = await sharp(wmBuf).toBuffer();
  return img.composite([
    { input: wm, gravity: "southeast", left: WM_PADDING, top: WM_PADDING },
  ]);
}

async function buildOne(src, wmPath) {
  const rel = path.relative(inputRoot, src);
  if (path.basename(src).toLowerCase() === watermarkName) return;

  const baseDir = path.dirname(rel);
  const baseName = path.basename(rel, path.extname(rel));

  const outThumbDir = path.join(outThumb, baseDir);
  const outFullDir = path.join(outFull, baseDir);
  await ensureDir(outThumbDir);
  await ensureDir(outFullDir);

  try {
    const img = sharp(src);
    const meta = await img.metadata();
    if (!meta.width) {
      console.warn("Skip (no width):", rel);
      return;
    }

    // Load/resize watermark depending on output width
    const wmFile = await fs.promises.readFile(wmPath);

    // THUMB
    {
      const pipeline = sharp(src).resize({
        width: THUMB_W,
        withoutEnlargement: true,
      });
      const wm = await resizedWM(wmFile, THUMB_W);
      const withWM = await compositeWM(pipeline, wm);

      await withWM
        .clone()
        .avif({ quality: Q_AVIF })
        .toFile(path.join(outThumbDir, `${baseName}.avif`));
      await withWM
        .clone()
        .webp({ quality: Q_WEBP })
        .toFile(path.join(outThumbDir, `${baseName}.webp`));
      // optional JPG fallback:
      // await withWM.clone().jpeg({quality:80}).toFile(path.join(outThumbDir, `${baseName}.jpg`));
    }

    // FULL
    {
      const targetW = Math.min(FULL_W, meta.width);
      const pipeline = sharp(src).resize({
        width: targetW,
        withoutEnlargement: true,
      });
      const wm = await resizedWM(wmFile, targetW);
      const withWM = await compositeWM(pipeline, wm);

      await withWM
        .clone()
        .avif({ quality: Q_AVIF })
        .toFile(path.join(outFullDir, `${baseName}.avif`));
      await withWM
        .clone()
        .webp({ quality: Q_WEBP })
        .toFile(path.join(outFullDir, `${baseName}.webp`));
      // optional JPG fallback:
      // await withWM.clone().jpeg({quality:82}).toFile(path.join(outFullDir, `${baseName}.jpg`));
    }

    console.log("✔", rel);
  } catch (e) {
    console.error("✖", rel, e.message);
  }
}

(async () => {
  if (!fs.existsSync(inputRoot)) {
    console.error("Input folder not found:", inputRoot);
    process.exit(1);
  }
  const wmPath = await findWatermark();
  if (!wmPath) {
    console.error("watermark.png not found inside:", inputRoot);
    process.exit(1);
  }
  console.log("💧 Using watermark:", wmPath);

  for await (const file of walk(inputRoot)) {
    if (isImg(file)) await buildOne(file, wmPath);
  }
  console.log("🎉 Done! Thumbs in /optimized/thumbs, full in /optimized/full");
})();
