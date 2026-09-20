import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("assets/products");
const destination = resolve("public/assets/products");

const sourceFiles = (await readdir(source)).filter((name) => name.toLowerCase().endsWith(".webp"));
if (sourceFiles.length !== 80) {
  throw new Error(`Expected 80 product images in assets/products; found ${sourceFiles.length}.`);
}

await mkdir(destination, { recursive: true });
for (const filename of sourceFiles) {
  const from = resolve(source, filename);
  if (!from.startsWith(source)) throw new Error(`Unsafe source filename: ${filename}`);
  const info = await stat(from);
  if (!info.isFile() || info.size === 0) throw new Error(`Invalid product image: ${filename}`);
  await cp(from, resolve(destination, filename), { force: true });
}

console.log(`Synced ${sourceFiles.length} product images to public/assets/products.`);
