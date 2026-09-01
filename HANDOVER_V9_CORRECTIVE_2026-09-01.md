# Aura Freeflow V9 corrective pass — handover

## Goal and current status

The user asked whether the 66 remaining player animations merely load or are actually selected for the correct gameplay context. The honest audit was:

- 66/66 load, parse, and bind to the player rig.
- Before this pass, 49 were solidly contextual, 14 were only partially routed, and 3 were dead in normal play.
- The user approved the corrective implementation.

The active build is `aura_pressure_freeflow_v9.html`. Do not use the older crashed Codex thread as authority. The previous recoverable build snapshot is `aura_pressure_freeflow_v9_pre_sol_pass.html`.

## Files changed in this pass

- `aura_pressure_freeflow_v9.html`
- `tmp/v9_sol_qa.mjs` — expanded deterministic QA
- `tmp/v9_corrective_actions.json` — real-input client action burst
- `output/v9-sol-qa/report.json` plus screenshots — regenerated QA evidence
- `output/v9-corrective-client/state-0.json` and `shot-0.png` — real-input smoke evidence

There is no usable Git repository at the current workspace root, so do not rely on `git status`/diff for the change list.

## Implemented changes

### Traversal, cover, and dead clips

1. **Geometry-defined hang styles**
   - `v9HangMountContext()` now scans registered hang colliders and returns `hangStyle: 'braced' | 'free'` based on the actual collider tag, proximity, facing, and approach.
   - Aura and sprint no longer decide free versus braced hang.
   - Braced mounts use `jumpBracedHang`; free mounts use `jumpFreeHang` while moving and `standJumpFreeHang` from standing.
   - Braced-hang shift uses the core shimmy or Shift-held `bracedHopLeft/Right`; free hang uses `freeHangLeft/Right` only.

2. **New authored traversal geometry in the V9 lab**
   - Existing deck: braced high ledge.
   - New waist-height deck: makes `ledgeDropWaist` physically reachable.
   - New elevated overhang: makes the free-hang clips physically reachable.
   - Source area: `aura_pressure_freeflow_v9.html` around lines 4766–4768.

3. **Ledge and wall routing**
   - `standDropHangV9` is selected only from a free-hang ledge; braced ledges use the original braced drop animation.
   - `ledgeDropHigh` versus `ledgeDropWaist` now comes from actual drop height.
   - `wallBackflip` now requires a strong frontal approach plus clear rear landing space; otherwise the normal wall kick-off stays selected. It no longer alternates by toggle.

4. **Cover and vault context**
   - `vaultToCover` is limited to valid cover-height vaults with a clear landing point and lateral cover space.
   - `coverCrouchAway` is now reachable: hold movement away from the cover while pressing `E` to exit away; ordinary `E` uses the side-specific ready exit.
   - Standing cover idle now looks toward the last shifted side instead of always right.
   - `crouchStandA/B` is selected from player movement direction (backward/left selects B) rather than alternating blindly.

### Combat and reaction routing

1. **Aura Shot**
   - It is now a visible, homing Aura projectile spawned from the right hand at its authored fire point, rather than instant long-range damage.
   - Projectile collision applies the existing body/side enemy reaction.

2. **Advanced contact events**
   - `handstandSpin`: two staged body contacts, then an authored butterfly follow-through.
   - `invertedDouble`: first body contact, then a second launch contact.
   - `flyingShoulder`: shoulder body contact followed by a launch/takedown contact using the existing enemy launch reaction.
   - These are implemented by the final `updateAttack` wrapper near line 4582, with all damage/score/aura/AI reaction calls still using the established combat system.

3. **Player reactions to enemy super string**
   - Enemy `superAttack` is now staged: initial impact → `playerHit`, second contact → `uppercutReaction`, final contact → `throwVictim` and face-down recovery.
   - Attack-specific reactions take precedence over the generic rear-hit branch so these clips remain reachable in legitimate super attacks.

## QA completed

### Passed

- Full module syntax check via extracted module + `node --check` passed before browser QA.
- `node tmp/v9_sol_qa.mjs` passed with **zero console/page errors**.
- QA report confirms:
  - 66 player clips loaded
  - Aura Shot marked as a projectile
  - multi-contact `invertedDouble`, `handstandSpin`, and `flyingShoulder`
  - both braced and free hang styles
  - both high and waist ledge-drop classes
  - `coverCrouchAway` is live
  - super reaction sequence resolves to `playerHit`, `uppercutReaction`, `throwVictim`
  - keyboard `0` remains `jumpIdle` only
- The required real-input client also completed. Its final snapshot is `output/v9-corrective-client/state-0.json`: active Level 1 gameplay, no error UI, normal jump landing, real enemy threat state.

### Important QA caveat / next immediate task

The last deterministic report was generated **before** one final one-line routing correction:

```js
if(braced) key = 'jumpBracedHang';
```

That correction was made because the QA hook reported a stale `getUpFaceDown` key when it attempted an unloaded core `standHang` fallback. The new braced key is one of the loaded V9 pack clips and should now show correctly, but **rerun `node tmp/v9_sol_qa.mjs` once** to refresh the report and confirm `contexts.bracedMount.key === 'jumpBracedHang'`.

Then open and inspect these latest screenshots with the local image viewer:

- `output/v9-sol-qa/free-hang.png`
- `output/v9-sol-qa/combat-heavy.png`
- `output/v9-sol-qa/jump-up-only.png`
- `output/v9-corrective-client/shot-0.png`

The `free-hang.png` was generated before the final braced-key fix but remains valid visual evidence for the free-hang geometry. Capture a new braced-hang screenshot if visual QA shows it is useful.

## Commands to resume

The local server was started as:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

If it is not running, start it from the project root, then run:

```sh
node tmp/v9_sol_qa.mjs
node /Users/richardmpayi/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url http://127.0.0.1:4173/aura_pressure_freeflow_v9.html \
  --actions-file tmp/v9_corrective_actions.json \
  --iterations 1 --pause-ms 250 --screenshot-dir output/v9-corrective-client
```

## Remaining product-level limitation

`throwVictim` is now correctly limited to the final impact of the enemy multi-hit super string, but there is still no dedicated matching enemy victim clip for a fully synchronized player `flyingShoulderThrow`. The current implementation uses staged body → launch reactions, which is the safest available asset match. Do not claim a true paired shoulder-throw interaction unless a matching villain-victim asset is supplied.
