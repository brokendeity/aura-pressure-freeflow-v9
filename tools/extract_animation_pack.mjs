import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [htmlPath, packPath, packName, ...files] = process.argv.slice(2);
if (!htmlPath || !packPath || !packName || files.length === 0) {
  throw new Error('Usage: node extract_animation_pack.mjs <html> <pack-js> <pack-name> <embedded-file> [...]');
}

const source = await readFile(htmlPath, 'utf8');
const marker = 'const EMBEDDED_ASSETS = ';
const start = source.indexOf(marker);
const end = source.indexOf(';\n\nlet scene', start);
if (start < 0 || end < 0) throw new Error('Could not locate the embedded asset manifest.');

const jsonStart = start + marker.length;
const assets = JSON.parse(source.slice(jsonStart, end));
const animations = {};
for (const file of files) {
  if (!assets.animations?.[file]) throw new Error(`Missing embedded animation: ${file}`);
  animations[file] = assets.animations[file];
  delete assets.animations[file];
}

await mkdir(path.dirname(packPath), { recursive: true });
const pack = `// Generated local animation pack. Loaded only when the gameplay requests it.\n`+
  `window.AURA_ANIMATION_PACKS ??= {};\n`+
  `window.AURA_ANIMATION_PACKS[${JSON.stringify(packName)}] = { animations: ${JSON.stringify(animations)} };\n`;
await writeFile(packPath, pack);
const next = source.slice(0, jsonStart) + JSON.stringify(assets) + source.slice(end);
await writeFile(htmlPath, next);
console.log(`Extracted ${files.length} clips into ${packPath}`);
