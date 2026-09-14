// Optional deployment staging. The website itself has no build dependencies.
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, 'dist');
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'styles.css', 'script.js', 'assets', 'data']) {
  await cp(join(root, entry), join(output, entry), { recursive: true });
}
console.log('Static website staged in dist/.');
