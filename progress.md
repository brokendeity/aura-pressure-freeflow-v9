Original prompt: Take the most updated functional version in `/Users/richardmpayi/Documents/echte game /moniker game`, improve the enemy AI and Batman-Arkham-style freeflow combat, and begin expanding the sandbox into a broader Moniker game where rhythm is one pillar rather than the whole game.

## 2026-08-28 — Freeflow 4.0 pass

- Canonical base selected: `aura_pressure_freeflow_v3.html` (newest standalone working lineage; newer than the handover's historical authority).
- Context files are background only. Current user intent overrides historical transcript instructions, including the older note that this was separate from Monikers.
- Focus for this pass: reliable attack eligibility, authored attack commitment/whiffs, freeflow player assistance without teleporting, role-aware squad coordination, attack-specific counter windows, restrained threat readability, deterministic test hooks, and regression coverage.
- Preserve: authored animation authority, exact Space roll, shared-root grab, stomp contact correction, real Get Up with ZERO_XZ, contextual traversal, LOS/nav/camera/performance systems.

## Implemented

- V4 combat director: spatial attack authorization, role-aware fallback selection, threat budgets, early tracking followed by committed aim, natural misses, and WHIFF recovery.
- Player targeting preserves combo victims in HIT while excluding grounded/grabbed/getting-up actors; short attack approaches use bounded collision-aware movement.
- Attack-specific counter windows, a restrained primary-threat cue, squad alert relay, squad nerve, KO hesitation, and breathing-room behavior.
- Debug UI starts hidden; menu copy and compact 720p layout identify the broader Moniker/freeflow direction.
- JavaScript module syntax check passes after the V4 director insertion.
- Authored animation contact is now the authoritative attack clock: telegraph, commitment, cue, counter window, damage, and recovery align to the same event.
- Deterministic QA hooks added: `window.render_game_to_text()`, `window.advanceTime(ms)`, and a scoped `window.__auraTest` harness.
- Browser verification passed for bounded player assist, HIT target continuity, perfect dodge, natural miss/WHIFF, squad alert relay without wall vision, high-Aura nerve/breathing response, autonomous conductor play, crowd separation, and Level 2 movement.
- Final 1280x720 menu and gameplay screenshots inspected; no browser console/page errors were captured.

## Verification and handoff

- Verified package: `aura_pressure_freeflow_v4_verified.zip`.
- The package contains the standalone V4 HTML, this QA record, and `MONIKER_EXPANSION_ROADMAP.md`.
- Next product milestone is documented in `MONIKER_EXPANSION_ROADMAP.md`.

## 2026-08-29 — Freeflow 5.0 combat-animation foundation

- Created `aura_pressure_freeflow_v5.html` from the verified V4 build; V4 remains unchanged as the stable fallback.
- Used named files from `Downloads/yellow+armored/new animations`: Lead Hand Hook, Back Foot Side Kick, Heavy Uppercut, and Jumping Knee Into Punch.
- Embedded the four FBX clips into the standalone game and preload them with the established rig. J chains now use the hook, K branches use the side kick, L uses the uppercut, and X uses the knee/punch finisher.
- Added a short authored-action ownership window so combat clips cannot be immediately overwritten by idle/run, while rolls, grabs, traversal, and existing special moves stay on their prior state machines.
- Added a scoped combat-preview QA hook. Module syntax passes; browser parsing confirmed all four clips load and are retimed to the gameplay windows. A deterministic hook-contact test dealt damage, preserved combo/aura/scoring, and showed the hook pose on-screen with no captured browser errors.
- Reusable embedding helper: `tools/embed_v5_combat_animations.mjs`.

## 2026-08-29 — Freeflow 6.0 matrix expansion

- Created `aura_pressure_freeflow_v6.html` from V5, retaining V5 as the prior verified build.
- Added and embedded nine further named animations from `Downloads/yellow+armored/new animations`: Armada Evasion Strike, Roundhouse Kick, Martelo High Kick, Leg Sweep, Flying Kick, Butterfly Kick, Martelo Floor Kick, Running Slide, and Wall Run Jump Off.
- Combat mapping now differentiates J/J/J as hook → armada → roundhouse; K can branch into side kick, high kick, sweep, flying kick, and sprint-slide strike. Air chase, traversal strike, gap-close, and counter states also have authored visual clips instead of reusing the hook.
- Parkour expansion: sprinting into a suitable wall now selects the new `[E] WALL KICK-OFF` animation while retaining the tested collision path, landing roll, and aura reward behavior.
- V6 JavaScript module syntax passes. Browser preload probe parsed and loaded all 13 core matrix clips with concrete durations and responsive retiming; the latest screenshot shows the authored finisher pose in gameplay with no captured browser errors.
- Scaling note: the standalone V6 file is ~250 MB. Before adding rail grinding, wall-to-wall zip, and a larger aerial pack, split optional animation groups into lazy-loaded packs so launch time remains practical.

## 2026-08-29 — Freeflow 7.0 momentum and animation-pack foundation

- Created `aura_pressure_freeflow_v7.html` from V6. Nine V6 optional clips now live in `animation_packs/v7_action_pack.js` and are removed from the core HTML; the core build is ~6 MB smaller.
- The pack is parsed while the level-select menu is open. If a player acts before it finishes, combat uses a core fallback and continues instead of locking; the requested clip loads for subsequent use.
- Added the first gameplay-level momentum resolver: `ground`, `momentum`, `air`, `traversal`, and `wall` are resolved from movement and motion state. The current state and value are exposed in `render_game_to_text`, and the resolver determines light/heavy branches (including sprint-slide).
- Verified the pack registers all 9 files, preloads all optional action clips, and restores authored Armada, Roundhouse, Slide Strike, and Floor Kick playback after pack readiness.
- Deterministic real-input test verified sprint momentum → K selects `slideStrike`, hits the nearby enemy, reduces HP/stance, awards score/aura/combo, and visually shows the running-slide pose. No browser errors were captured.
- Next architecture slice: add a rail spline/magnet state and a small dedicated rail animation pack; then connect it to momentum, rail dismount kick, wall-to-wall zip, and air finish routing.

## 2026-08-29 — Freeflow 8.0 rail-grinding prototype

- Created `aura_pressure_freeflow_v8.html` from V7. Used the supplied Unity Runner Action Animation Pack as a reference check; its Unity assets are not browser-ready, so the web build retains the compatible uploaded animation runtime.
- Added a visible neon rail route in Aura Garage with proximity snap via `[E]`, deterministic forward grind movement, rail state in the text telemetry, Momentum rail context, and passive Aura/score gain.
- Rail controls: `J` rail strike, `K` rail drop-kick exit, `L` high exit, `Space` safe bail. The exits reuse existing freeflow attack rules rather than bypassing collision/score systems.
- Verified snap → grind → J → K dismount through deterministic browser input. Corrected the first dismount root-height issue; final browser screenshot visibly shows the player moving on the neon rail. No browser errors were captured.

## 2026-08-30 — Freeflow 9.0 full player-animation matrix (in progress)

- Created `aura_pressure_freeflow_v9.html` from verified V8; V8 remains unchanged.
- Audited all 136 FBX files under `Downloads/yellow+armored`. V8 already embeds and routes the complete villain attack/reaction set. The 66 still-unused player clips are now packed into four generated, on-demand groups: combat, traversal, reactions, and world/cover.
- Replaced the sub-half-second combat compression with authored-feeling action windows. Verified the core hook and side kick resolve damage/reaction at their slower visible contact windows; side-kick playback is now 2.21x instead of 3.91x, with no browser errors.
- Space now starts the real standing/running jump matrix; Alt retains dodge/perfect-dodge. Deterministic telemetry confirmed `jumpIdle`, a 1.05 m vertical arc, and no dive-roll substitution.
- Added contextual selectors for advanced J/K branches, directional dodges, player hit/knockdown/get-up reactions, ledge hang/climb/drop, cover states, stairs, vault-to-cover, wall-backflip alternation, sit/push/carry props, crawl/sneak, combat strafe, and fight stance.
- Visual QA found airborne camera clipping at the 3.6 m garage ceiling. V9 now keeps elevated traversal on the grounded camera-height path while preserving the real player Y position.
- Startup note: only the traversal pack and standing-jump clip are required before the menu; all other groups warm in the background or on first relevant context to avoid loading all 66 clips at launch.
- Final asset audit passed: 5 advanced-combat + 29 traversal/dodge + 13 reaction + 19 world/cover clips = 66/66 valid player clips. No V9 browser error artifacts were produced.
- Deterministic checks passed for real Space jump, Alt dodge/invulnerability, slowed hook/side-kick contact, `JJJ`, `KK`, `JKK`, and `KKJ` branch selection, inverted-double enemy launch, player body-blow fall, rail K dismount, cover shift, hang shimmy, stairs, wall backflip, sit/carry/push state changes, and Level 2 sprint/collision.
- Visual checks passed for menu, standing jump, slowed core combat, inverted-double kick, player knockdown, rail dismount, cover shift, ledge shimmy with side camera, and wall backflip with low-ceiling camera protection.
- Coverage reference: `V9_ANIMATION_COVERAGE.md`. Generated pack source: `tools/build_v9_player_pack.mjs`.
- Next-pass suggestions: add authored sound/hit-stop per new move, tune individual multi-contact attacks (especially Aura shot and flying shoulder) beyond their current single gameplay contact, and give the Level 2 lab dedicated lighting rather than inheriting the dark garage spill at its distant coordinates.

## 2026-08-31 — V9 Sol/high combat + contextual traversal continuation

- Preserved a recoverable pre-pass snapshot as `aura_pressure_freeflow_v9_pre_sol_pass.html`; the active build remains `aura_pressure_freeflow_v9.html`.
- Slowed the basic authored combat cadence again: jab is 0.96 s / 1.11× playback and side kick is 1.30 s / 1.56×. V9's global animation speed cap is now 1.85× instead of 2.25×, with contact ratios moved into the readable strike portion.
- Added explicit branches: `JJJJ → spinHigh`, `JKJ → handstandSpin`, `KJJ → flyingShoulder`, `KKK → invertedDouble`, `KJK → comboKnockback`, and `JJKK → aerialHeavy`. Existing `JJJ`, `JKK`, and `KKJ` behavior remains intact.
- Added `Digit0` and `Numpad0` as standing jump-up-only inputs. They call the `jumpIdle` branch directly and cannot resolve to Jump Dive Roll. Space remains the contextual jump matrix.
- Replaced overlapping E-action priority with a unified contextual resolver covering vault, wall, climb, swing, rail, ledge/hang, stairs, sit, push, and carry. Candidates expose a score and contact direction and are filtered by position, height, facing/approach, object type, and stance.
- Added impact descriptors (`hitRegion` + `reaction`) from player attacks into villain reaction selection. Hook, body, head, directional running, uppercut knockdown, and real enemy get-up routes are verified. Enemy overhead damage selects player body-blow fall followed by real face-down get-up.
- Telemetry now exposes player controls/current animation, enemy animation/reaction, and the selected traversal context.
- Added Level 2-local hemisphere, directional, and route point lights to resolve the prior distant-course darkness.
- Module syntax validation passes on the full 256 MB module source.
- Required web-game client passed menu → Level 1 startup with no error artifact: `output/v9-sol-final-client/`.
- Focused browser QA passed with zero console/page errors: `output/v9-sol-qa/report.json`. It confirms all 66 V9 player clips load (5 combat + 29 traversal + 13 reaction + 19 world), nine J/K sequences, actual keyboard `0` jump-up, player knockdown/get-up, enemy hook/body/launch/get-up, and push/stairs/hang/wall context selection.
- Final visual evidence inspected: `output/v9-sol-qa/combat-heavy.png` and `output/v9-sol-qa/jump-up-only.png`.
- Remaining worthwhile polish: give Aura Shot and Flying Shoulder genuine multi-contact/contact-event definitions; add authored per-move hit-stop/audio; build synchronized enemy hostage-victim behavior only if a matching player-victim asset is supplied.

## 2026-09-01 — V9 corrective integration pass (handover checkpoint)

- Added geometry-defined braced/free hang selection, a waist-height ledge drop route, a free-hang overhang, contextual cover-away exit, valid-only vault-to-cover, and approach/clearance-selected wall backflip.
- Converted Aura Shot into a visible projectile; added staged contacts for Handstand Spin, Inverted Double Kick, and Flying Shoulder; and made the enemy super string route player hit → uppercut reaction → throw victim.
- Expanded `tmp/v9_sol_qa.mjs`; latest focused browser QA passed with zero errors and confirms 66 loaded player clips, staged reactions, projectile/multi-contact metadata, live cover-away, free/braced hang styles, and high/waist ledge classes.
- A final one-line braced-hang routing correction was made after that report. Rerun the focused QA once and verify `bracedMount.key === 'jumpBracedHang'` before claiming the corrective pass fully closed.
- Full continuation details: `HANDOVER_V9_CORRECTIVE_2026-09-01.md`.

## 2026-09-01 — V9 corrective visual QA closure

- Reran `node tmp/v9_sol_qa.mjs` after the braced-mount correction. It passes with zero console/page errors and records `bracedMount.key === 'jumpBracedHang'`, 66 loaded player clips, both hang styles, both ledge-drop classes, live cover-away, staged combat contacts, and the super-reaction sequence.
- Visual QA revealed the generic elevated camera could enter the authored hang geometry. Added a hang-specific outward shoulder camera for both the mount and static hang state.
- Visual QA also caught the mount animations returning to neutral after completion. The active hang now reclaims and holds its actual selected authored pose (`jumpBracedHang` or `standJumpFreeHang`) at the valid hang beat; final screenshots show both braced and free hanging correctly.
- Added `braced-hang.png` and camera/action telemetry to the focused QA. Current evidence: `output/v9-sol-qa/{braced-hang,free-hang,combat-heavy,jump-up-only}.png` and `report.json`.
- Re-ran the required real-input Playwright client with `tmp/v9_corrective_actions.json`. It exited cleanly; final gameplay state is Level 1 combat with a normal `landFeet` landing and an active enemy jump-kick threat. Screenshot: `output/v9-corrective-client/shot-0.png`.

## 2026-09-01 — V9 authored rail-grinding integration

- Added the supplied `rail grinding .fbx` as a dedicated lazy-loaded V9 rail pack and registered it as the looping `railGrind` player animation. The active player matrix now has 67 authored clips.
- Rail entry now uses that actual authored grind animation. While grinding, `Space` performs a real `runJump` hop over the rail; when Aura descends back onto the valid portion of the same rail, the rail state and `railGrind` animation automatically resume. Reaching either end retains the existing safe dismount.
- Expanded `tmp/v9_sol_qa.mjs` to verify rail start, authored grind playback, in-air rail hop, and automatic rejoin. The focused browser report passed with zero console/page errors; it records progress `.262` while grinding, an in-air height of `.82`, and a resumed `railGrind` at progress `.597`.
- Visual evidence inspected: `output/v9-sol-qa/rail-rejoin.png` shows the rail-grind pose on the neon rail after re-entry.

## 2026-09-01 — Direct-file animation-pack compatibility

- Fixed the `file://` startup failure shown when opening the HTML by double-clicking it. V9 animation packs are now loaded as classic sibling scripts for `file:` pages, while HTTP development continues to use dynamic module imports.
- Applied the compatibility loader to both `aura_pressure_freeflow_v9.html` and the recoverable `aura_pressure_freeflow_v9_pre_sol_pass.html` shown in the report image.
- Verified both HTML files with the required Playwright input client opened directly from disk. The active build reached the stage-select menu after 90 frames with no console/page errors. Full-page visual evidence: `output/v9-active-file-open-client/full-page.png`.

## 2026-09-01 — Player movement / animation continuity pass

- Root-cause audit found that the player FBXs contain real horizontal root travel (run/sprint: 1.67 m; run-jump: 2.30 m; vault: 3.29 m; wall-run: roughly 0.99 m × 0.89 m). Retaining each clip's own start offset meant transitions could visibly snap Aura even when the gameplay root was continuous.
- Changed player clip preparation to normalize every player Hip X/Z track to the common zero origin. Gameplay now exclusively owns horizontal travel for running, combat assist, jumps, vaults, walls, stairs, hang transitions, rail grinding, and reactions; authored animation continues to own pose and vertical motion.
- Capped freeflow target assistance to a continuous 0.095 m maximum per update, preventing a delayed frame from consuming an entire approach gap at once. The deterministic heavy-attack probe recorded a 0.0774 m maximum frame move and 0.8597 m total assisted approach.
- Expanded `tmp/v9_sol_qa.mjs` with raw-versus-prepared root-motion reporting and a combat continuity assertion. Latest focused browser QA passed with 67 loaded player clips and zero errors; every audited prepared clip has 0 X/Z root range. Visual checks: `output/v9-sol-qa/combat-heavy.png` and `output/v9-motion-smoke-client/shot-0.png`.

## 2026-09-01 — Garage roof-safe camera pass

- Kept the garage roof and made the Level 1 camera roof-aware. The roof plane is at 3.60 m and its beam undersides begin at 3.215 m; the camera's desired and current positions are now capped at 3.02 m, safely below both.
- The clamp covers normal combat/running camera movement and the V9 hang-camera override. Level 2 remains uncapped because it has no garage ceiling.
- Expanded `tmp/v9_sol_qa.mjs` to assert the combat, jump, braced-hang, and free-hang camera poses never exceed the safe ceiling. Focused QA passes with zero errors: combat/jump/free-hang reach 3.02 m; braced hang is 2.46 m.
- Required real-input run/jump smoke test passed with no error UI: `output/v9-roof-camera-client/state-0.json`. Visual capture `output/v9-roof-camera-client/shot-0.png` keeps Aura and both enemies fully visible beneath the roof.

## 2026-09-01 — V9 animation-fix implementation closure

- Created the recoverable pre-pass snapshot `aura_pressure_freeflow_v9_pre_animation_fix_2026-09-01.html`; the active authority remains `aura_pressure_freeflow_v9.html`.
- Rebuilt the V9 animation packs from `/Users/richardmpayi/Downloads/yellow+armored/new animations` and verified that `rail grinding .fbx` is the exact source of `animation_packs/v9_rail_pack.js`. The rail pack is now mandatory before the level menu becomes available; gameplay never substitutes a run clip for a grind.
- Replaced the legacy rail boolean with explicit `offRail → railCandidate → railMount → railGrind → railAir → railReentry → railGrind/railDismount` ownership. Grounded `E` mounts from beside the rail, airborne `E` buffers a descending catch, Space hops from the rail, valid re-contact resumes the same grind clip and progress direction, and misses return to ordinary landing without magnetic capture.
- Added rail-specific tangent/shoulder camera framing plus a corrected near-obstruction clamp. The garage roof cap remains in force, but nearby columns no longer push the camera through geometry or hide Aura.
- Replaced discrete run/strafe animation switching with simultaneous run/left/right actions, smoothed weights, one normalized gait phase, stable target selection, and smooth facing. Rapid A/D reversals no longer restart the locomotion cycle. The supplied animation map contains no authored backward-run clip, so dominant backward travel correctly faces the movement vector rather than pretending a forward clip is backward locomotion.
- Tightened combat movement authority: gameplay root translation remains authoritative, freeflow assist is eased and capped at 0.070 m per update, combat facing rotates smoothly, and Inverted Double/Flying Shoulder durations were relaxed to 1.98 s/2.28 s so staged contacts occur at readable authored beats.
- Parkour continuity now holds hang poses at the selected authored contact frame, uses a surface-aware jump landing height, and retimes landing recovery consistently after jumps and hang climbs.
- Added detailed animation/locomotion/rail/camera telemetry to `render_game_to_text()` and focused real-input QA in `tmp/v9_animation_fix_qa.mjs`.
- Focused QA passed with zero errors: ground `E` reaches `railMount → railGrind`, rail hop returns `railAir → railGrind`, airborne `E` reaches `v9Jump → railReentry → railGrind`, no-input jumps remain `offRail`, strafe phase remains continuous through a camera sweep, and six rapid A/D reversals produce zero action restarts. Evidence: `output/v9-animation-fix-qa/report.json` and `{ground-grind,air-catch-grind,strafe-sweep}.png`.
- Full deterministic QA passed with zero errors and 67 loaded clips. It confirms zero prepared X/Z root range, 0.070 m maximum combat frame movement, all combat/traversal/reaction routes, stable paused hang poses, real rail hop/rejoin, and the keyboard-jump contract: `output/v9-sol-qa/report.json`.
- Independent real-input menu → Level 1 → run → jump → landing smoke passed with no error artifact. Final state is active combat, `landFeet`, a live enemy jump-kick threat, rail clip ready, and camera clear: `output/v9-animation-fix-client/state-0.json` and `shot-0.png`.
- Known asset limitation remains: no matching villain victim clip exists for a genuinely synchronized Flying Shoulder throw, so the implementation keeps the safe staged body-contact → launch reaction and does not claim a paired throw.

## 2026-09-01 — Public GitHub release archive

- Initialized the workspace as a Git repository with `main` as the release branch and created the GitHub repository `brokendeity/aura-pressure-freeflow-v9`.
- Curated the repository around the current V9 release: canonical game, immediate recovery snapshot, all V9 animation packs, pack-building/QA tools, implementation reports, and final focused/full/real-input evidence. Historical 160–250 MB builds and redundant ZIP archives remain local and are intentionally excluded.
- Added Git LFS tracking for standalone HTML builds. GitHub received both exact 244 MB HTML objects (512 MB total) and the 38-file release manifest.
- Initial verified release commit: `c739a3be9b973c002d58cda0647ca279d06e392b` (`Archive verified Aura Pressure Freeflow V9 release`).
- Repository visibility is public so external tools such as Gemini and web ChatGPT can inspect the committed files by URL: `https://github.com/brokendeity/aura-pressure-freeflow-v9`.

## 2026-09-01 — New-chat handover

- Added `HANDOVER_V9_PUBLIC_GITHUB_2026-09-01.md` as the self-contained authority for a new chat.
- It records the public repository/version, model-switch protocol, canonical files, completed animation fixes, final QA evidence, exact verification commands, known asset limitations, recommended combat-feel milestone, and a copy-ready starter prompt.
- This handover supersedes older corrective/recovery handovers wherever they conflict. No game source changed in this documentation-only commit, so the previously passed focused/full/real-input QA baseline remains authoritative.
