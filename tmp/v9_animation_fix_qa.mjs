import { chromium } from '/Users/richardmpayi/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outDir = new URL('../output/v9-animation-fix-qa/', import.meta.url);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', text: message.text() }); });
page.on('pageerror', error => errors.push({ type: 'pageerror', text: String(error) }));

await page.goto('http://127.0.0.1:4173/aura_pressure_freeflow_v9.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => document.querySelector('#loading')?.style.display === 'none', null, { timeout: 120000 });
await page.click('#startBtn');
await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === 'combat', null, { timeout: 20000 });

const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
const advance = ms => page.evaluate(value => window.advanceTime(value), ms);
const reset = () => page.evaluate(() => window.__auraTest.startLevel(1));

// Grounded approach: step away from the rail, then use real E input.
await page.evaluate(() => window.__auraTest.placeForRail(.28));
await page.keyboard.down('KeyW');
await advance(220);
await page.keyboard.up('KeyW');
const groundBefore = await state();
await page.keyboard.press('KeyE');
await advance(80);
const groundMount = await state();
await advance(360);
const groundGrind = await state();
await page.screenshot({ path: fileURLToPath(new URL('ground-grind.png', outDir)), fullPage: true });

// A rail-originated hop must rejoin without a landing/run fallback.
await page.keyboard.press('Space');
await advance(430);
const railHop = await state();
await advance(500);
const railRejoin = await state();

// Ordinary running jump + buffered E must catch the rail on descent.
await reset();
await page.evaluate(() => window.__auraTest.placeForRail(.5));
await page.keyboard.down('KeyW');
await advance(400);
await page.keyboard.up('KeyW');
await page.keyboard.down('KeyS');
await page.keyboard.press('Space');
await advance(320);
const airBeforeE = await state();
await page.keyboard.press('KeyE');
await advance(430);
const airCatch = await state();
await advance(420);
await page.keyboard.up('KeyS');
const airGrind = await state();
await page.screenshot({ path: fileURLToPath(new URL('air-catch-grind.png', outDir)), fullPage: true });

// The same jump without E must not magnetize.
await reset();
await page.evaluate(() => window.__auraTest.placeForRail(.5));
await page.keyboard.down('KeyW');
await advance(400);
await page.keyboard.up('KeyW');
await page.keyboard.down('KeyS');
await page.keyboard.press('Space');
await advance(1050);
await page.keyboard.up('KeyS');
await advance(430);
const noInputLanding = await state();

// Camera-relative strafe sweep and rapid reversal phase continuity.
await reset();
await page.evaluate(() => window.__auraTest.loadV9Pack('v9-world'));
await page.evaluate(() => window.__auraTest.placeEnemy(0, 2.8, 0));
await page.keyboard.down('KeyD');
await advance(180);
await page.mouse.move(600, 360);
await page.mouse.down({ button: 'right' });
const strafeSweep = [];
for (let i = 0; i < 12; i++) {
  await page.mouse.move(645 + i * 42, 360);
  await advance(100);
  const sample = await state();
  strafeSweep.push({ animation: sample.player.animation, locomotion: sample.player.locomotion });
}
await page.mouse.up({ button: 'right' });
await page.keyboard.up('KeyD');
await page.screenshot({ path: fileURLToPath(new URL('strafe-sweep.png', outDir)), fullPage: true });

await reset();
await page.evaluate(() => window.__auraTest.placeEnemy(0, 2.8, 0));
const reversals = [];
for (const key of ['KeyD', 'KeyA', 'KeyD', 'KeyA', 'KeyD', 'KeyA']) {
  await page.keyboard.down(key);
  await advance(100);
  const sample = await state();
  reversals.push({ key, animation: sample.player.animation, locomotion: sample.player.locomotion });
  await page.keyboard.up(key);
}

const report = { errors, ground: { before: groundBefore, mount: groundMount, grind: groundGrind }, railHop, railRejoin, air: { beforeE: airBeforeE, catch: airCatch, grind: airGrind }, noInputLanding, strafeSweep, reversals };

const fail = (type, text) => errors.push({ type, text });
if (groundMount.traversal.railController.mode !== 'railMount' || groundMount.player.animation.key !== 'railGrind') fail('ground-mount', 'Ground E did not enter railMount with railGrind.');
if (groundGrind.traversal.railController.mode !== 'railGrind' || groundGrind.player.animation.key !== 'railGrind') fail('ground-grind', 'Ground mount did not settle into authored grind.');
if (railHop.traversal.railController.mode !== 'railAir') fail('rail-hop', 'Space did not enter railAir.');
if (railRejoin.traversal.railController.mode !== 'railGrind' || railRejoin.player.animation.key !== 'railGrind') fail('rail-rejoin', 'Rail hop did not resume authored grind.');
if (!['railReentry', 'railGrind'].includes(airCatch.traversal.railController.mode)) fail('air-catch', 'Buffered airborne E did not catch the rail.');
if (airGrind.traversal.railController.mode !== 'railGrind' || airGrind.player.animation.key !== 'railGrind') fail('air-grind', 'Air catch did not settle into authored grind.');
if (noInputLanding.traversal.railController.mode !== 'offRail' || noInputLanding.traversal.rail) fail('rail-magnet', 'Jump without E magnetized onto the rail.');
if (errors.length) report.errors = errors;

await writeFile(new URL('report.json', outDir), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify({ ok: errors.length === 0, errors, summary: {
  ground: [groundMount.traversal.railController.mode, groundGrind.traversal.railController.mode, groundGrind.player.animation.key],
  hop: [railHop.traversal.railController.mode, railRejoin.traversal.railController.mode, railRejoin.player.animation.key],
  air: [airBeforeE.traversal.motion, airCatch.traversal.railController.mode, airGrind.traversal.railController.mode, airGrind.player.animation.key],
  noInput: [noInputLanding.traversal.railController.mode, noInputLanding.player.animation.key],
  sweep: strafeSweep.map(value => [value.animation.key, value.animation.normalized, value.animation.transitionCount]),
  reversals: reversals.map(value => [value.key, value.animation.key, value.animation.normalized, value.animation.transitionCount])
} }, null, 2));
