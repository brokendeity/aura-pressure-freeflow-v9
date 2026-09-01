import { chromium } from '/Users/richardmpayi/.codex/skills/develop-web-game/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outDir = new URL('../output/v9-sol-qa/', import.meta.url);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push({ type: 'console', text: message.text() }); });
page.on('pageerror', error => errors.push({ type: 'pageerror', text: String(error) }));

await page.goto('http://127.0.0.1:4173/aura_pressure_freeflow_v9.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction(() => document.querySelector('#loading')?.style.display === 'none' && getComputedStyle(document.querySelector('#startScreen')).display !== 'none', null, { timeout: 120000 });
await page.click('#startBtn');
await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === 'combat', null, { timeout: 20000 });
await page.evaluate(() => window.advanceTime(1));

const report = await page.evaluate(async () => {
  const qa = window.__auraTest;
  const assets = await qa.loadV9Packs();
  const rootMotion = await qa.rootMotionAudit();
  const profiles = {
    jab: qa.combatProfile('light1'),
    kick: qa.combatProfile('heavy'),
    shoulder: qa.combatProfile('flyingShoulder'),
    handstand: qa.combatProfile('handstandSpin'),
    inverted: qa.combatProfile('invertedDouble'),
    auraShot: qa.combatProfile('auraShot'),
  };
  const combatContinuity = await qa.combatContinuityProbe('heavy');
  const combatCamera = qa.cameraState();
  const sequences = {};
  for (const sequence of ['JJJ', 'JJJJ', 'JKJ', 'KJJ', 'KKJ', 'KKK', 'KJK', 'JKK', 'JJKK']) sequences[sequence] = qa.previewSequence(sequence);

  qa.jumpUpOnly();
  await window.advanceTime(180);
  const jumpUpOnly = JSON.parse(window.render_game_to_text());
  const jumpCamera = qa.cameraState();
  await window.advanceTime(1200);

  const playerOverhead = qa.forcePlayerHit('overhead', 2);
  await window.advanceTime(1200);
  const playerGetUp = JSON.parse(window.render_game_to_text());
  await window.advanceTime(1200);

  const enemyHook = await qa.hitEnemy('light1');
  await window.advanceTime(1250);
  const enemyBody = await qa.hitEnemy('bodyBlow');
  await window.advanceTime(1450);
  const enemyLaunch = await qa.hitEnemy('launcher');
  await window.advanceTime(1700);
  const enemyGetUp = JSON.parse(window.render_game_to_text());
  const enemyHandstand = await qa.hitEnemy('handstandSpin');
  await window.advanceTime(1700);
  const enemyShoulder = await qa.hitEnemy('flyingShoulder');
  await window.advanceTime(2300);
  const enemyInverted = await qa.hitEnemy('invertedDouble');
  await window.advanceTime(2100);
  const enemyAuraShot = await qa.hitEnemy('auraShot');

  qa.placeForRail();
  const railStart = qa.startRail();
  await window.advanceTime(220);
  const railGrinding = JSON.parse(window.render_game_to_text());
  const railHop = qa.railJump();
  await window.advanceTime(420);
  const railAir = JSON.parse(window.render_game_to_text());
  await window.advanceTime(480);
  const railRejoin = JSON.parse(window.render_game_to_text());

  const superStart = qa.forceSuperContact(0);
  await window.advanceTime(650);
  const superUppercut = qa.forceSuperContact(1);
  await window.advanceTime(1300);
  const superThrow = qa.forceSuperContact(2);
  await window.advanceTime(2300);

  qa.placeAt('push');
  const pushContext = qa.contextDetail();
  qa.placeForStairs();
  const stairsContext = qa.contextDetail();
  qa.placeForHang('braced');
  const bracedHangContext = qa.contextDetail();
  const bracedMount = qa.mountHang();
  await window.advanceTime(1120);
  const bracedHangState = JSON.parse(window.render_game_to_text()).traversal.hang;
  const bracedCamera = qa.cameraState();
  qa.placeForHang('free');
  const freeHangContext = qa.contextDetail();
  const freeMount = qa.mountHang();
  await window.advanceTime(1120);
  const freeHangState = JSON.parse(window.render_game_to_text()).traversal.hang;
  const freeCamera = qa.cameraState();
  qa.placeOnLedge('waist');
  const waistDrop = qa.ledgeDrop();
  qa.placeForCover();
  qa.takeCover();
  await window.advanceTime(620);
  const coverAway = qa.exitCoverAway();
  const wall = qa.startWallKick();
  await window.advanceTime(80);
  const wallState = JSON.parse(window.render_game_to_text());

  return {
    assetCounts: assets.packs,
    clipCount: assets.clips.length,
    rootMotion,
    profiles,
    combatContinuity,
    camera: { combat: combatCamera, jump: jumpCamera },
    sequences,
    jumpUpOnly: { animation: jumpUpOnly.player.animation, jump: jumpUpOnly.player.jump, motion: jumpUpOnly.traversal.motion, controls: jumpUpOnly.player.controls },
    playerReaction: { hit: playerOverhead.player, getUp: playerGetUp.player.animation },
    enemyReactions: {
      hook: enemyHook.enemies[0],
      body: enemyBody.enemies[0],
      launch: enemyLaunch.enemies[0],
      getUp: enemyGetUp.enemies[0],
      handstand: enemyHandstand.enemies[0],
      shoulder: enemyShoulder.enemies[0],
      inverted: enemyInverted.enemies[0],
      auraShot: enemyAuraShot.enemies[0],
    },
    rail: { start: railStart?.traversal?.rail, grinding: { rail: railGrinding.traversal.rail, animation: railGrinding.player.animation }, hop: { motion: railHop?.traversal?.motion, airMotion: railAir.traversal.motion, height: railAir.player.position.y }, rejoin: { rail: railRejoin.traversal.rail, animation: railRejoin.player.animation } },
    superReactions: {
      start: superStart.player.animation.key,
      uppercut: superUppercut.player.animation.key,
      throw: superThrow.player.animation.key,
    },
    contexts: { push: pushContext, stairs: stairsContext, bracedHangContext, bracedMount, bracedHangState, bracedCamera, freeHangContext, freeMount, freeHangState, freeCamera, waistDrop, coverAway, wall, wallState: wallState.traversal },
    integrationAudit: qa.integrationAudit(),
  };
});

for (const entry of report.rootMotion) {
  const range = entry.prepared?.range;
  if (!range || range.x > 0.00001 || range.z > 0.00001) {
    errors.push({ type: 'root-motion', text: `Player clip is not in-place after normalization: ${entry.key}` });
  }
}
if (!report.combatContinuity || report.combatContinuity.maxFrameStep > 0.096 || report.combatContinuity.assistPeakStep > 0.096) {
  errors.push({ type: 'combat-continuity', text: 'Freeflow assist exceeded the continuous-motion frame cap.' });
}
for (const [label, camera] of Object.entries({ combat: report.camera?.combat, jump: report.camera?.jump, bracedHang: report.contexts?.bracedCamera, freeHang: report.contexts?.freeCamera })) {
  if (!camera || camera.position.y > 3.021) errors.push({ type: 'camera-roof', text: `Camera exceeded the garage roof-safe height during ${label}.` });
}

await page.evaluate(async () => {
  const qa = window.__auraTest;
  await window.advanceTime(1800);
  await qa.hitEnemy('heavy');
});
await page.screenshot({ path: fileURLToPath(new URL('combat-heavy.png', outDir)), fullPage: true });

await page.evaluate(async () => {
  const qa = window.__auraTest;
  qa.placeForRail();
  qa.startRail();
  await window.advanceTime(220);
  qa.railJump();
  await window.advanceTime(900);
});
await page.screenshot({ path: fileURLToPath(new URL('rail-rejoin.png', outDir)), fullPage: true });

await page.evaluate(async () => {
  await window.advanceTime(1400);
  window.__auraTest.placeForHang('braced');
  window.__auraTest.mountHang();
  await window.advanceTime(1180);
});
await page.screenshot({ path: fileURLToPath(new URL('braced-hang.png', outDir)), fullPage: true });

await page.evaluate(async () => {
  await window.advanceTime(1400);
  window.__auraTest.placeForHang('free');
  window.__auraTest.mountHang();
  await window.advanceTime(1180);
});
await page.screenshot({ path: fileURLToPath(new URL('free-hang.png', outDir)), fullPage: true });

await page.evaluate(async () => {
  await window.advanceTime(1600);
  await window.__auraTest.startLevel(2);
  await window.advanceTime(1500);
});
await page.keyboard.press('Digit0');
await page.evaluate(() => window.advanceTime(240));
report.keyboardJump = await page.evaluate(() => { const s=JSON.parse(window.render_game_to_text());return{animation:s.player.animation,jump:s.player.jump,motion:s.traversal.motion,level:s.level}; });
await page.screenshot({ path: fileURLToPath(new URL('jump-up-only.png', outDir)), fullPage: true });

await writeFile(new URL('report.json', outDir), JSON.stringify({ report, errors }, null, 2));
await browser.close();
console.log(JSON.stringify({ ok: errors.length === 0, report }, null, 2));
