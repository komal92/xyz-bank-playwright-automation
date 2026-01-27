import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { Page } from "playwright";

export async function compareScreenshot(page: Page, name: string) {
  const baseDir = path.join(process.cwd(), "visual-baseline");
  const actualDir = path.join(process.cwd(), "visual-actual");
  const diffDir = path.join(process.cwd(), "visual-diff");

  [baseDir, actualDir, diffDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  });

  const baselinePath = path.join(baseDir, `${name}.png`);
  const actualPath = path.join(actualDir, `${name}.png`);
  const diffPath = path.join(diffDir, `${name}.png`);

  // Take actual screenshot
  await page.screenshot({ path: actualPath, fullPage: true });

  // If baseline doesn't exist, create it (first run)
  if (!fs.existsSync(baselinePath)) {
    fs.copyFileSync(actualPath, baselinePath);
    return { isBaselineCreated: true, diffPixels: 0 };
  }

  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(fs.readFileSync(actualPath));

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return { isBaselineCreated: false, diffPixels };
}
