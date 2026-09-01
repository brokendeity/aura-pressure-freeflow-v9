import { readFile, writeFile } from 'node:fs/promises';

const [htmlPath, ...pairs] = process.argv.slice(2);
if (!htmlPath || pairs.length === 0 || pairs.length % 2) {
  throw new Error('Usage: node embed_v5_combat_animations.mjs <html> <embedded-name> <fbx-path> [...]');
}

const source = await readFile(htmlPath, 'utf8');
const marker = 'const EMBEDDED_ASSETS = ';
const start = source.indexOf(marker);
const end = source.indexOf(';\n\nlet scene', start);
if (start < 0 || end < 0) throw new Error('Could not locate the embedded asset manifest.');

const jsonStart = start + marker.length;
const assets = JSON.parse(source.slice(jsonStart, end));
assets.animations ??= {};
for (let i = 0; i < pairs.length; i += 2) {
  const [name, file] = pairs.slice(i, i + 2);
  assets.animations[name] = (await readFile(file)).toString('base64');
  console.log(`Embedded ${name}`);
}

const next = source.slice(0, jsonStart) + JSON.stringify(assets) + source.slice(end);
await writeFile(htmlPath, next);
