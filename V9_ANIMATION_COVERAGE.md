# Aura Pressure Freeflow 9.0 — Animation Coverage

## Asset ownership

- `yellow+armored/new animations` and `yellow+armored/animations ` are player-only sources.
- `yellow+armored/villain/animation` is enemy-only. V8 already embedded its complete attack, locomotion, directional reaction, knockdown, get-up, death, grab, and victory set; V9 preserves that authority.
- The 66 player clips that were still unused after V8 are split into four on-demand packs: 5 advanced-combat clips, 29 jump/dodge/traversal clips, 13 player-reaction clips, and 19 world/cover clips.

## Controls and selection

- `Space`: contextual standing jump, running jump, sprint flip, high-Aura twist flip, or crouched jump. It no longer substitutes Jump Dive Roll.
- `0` / `Numpad 0`: standing jump-up only. Movement, sprint, crouch, and momentum cannot turn this input into Jump Dive Roll or another jump branch.
- `Alt`: contextual dodge. Incoming ranged threat, movement direction, momentum, Aura, and counter state choose roll, aerial evade, guard step, handstand dodge, corkscrew, backflip, or guard pivot.
- `J`: hook → Armada → roundhouse. Momentum, air, wall/traversal, post-dodge, counter, and `KKJ` contexts add gap-close, aerial, flow, flying-shoulder, counter, and handstand-spin branches.
- `K`: side kick. `JK`, `JJK`, `KK`, and `JKK` add body blow, sweep, spinning high kick, and inverted double kick. Momentum and air retain slide and flying-kick branches.
- `L`, `X`, `B`, `F`, and `Z`: launcher, finisher, synchronized shoulder throw/stomp, flip kick, and Aura shot.
- `E`, `V`, and `C`: object-aware parkour/interaction. Surface height, approach speed, wall angle, ledge state, cover stance, hang direction, and nearby prop choose vault, vault-to-cover, climb, hang, shimmy/hop, ledge lower/drop, wall run/step/backflip, swing, stairs, sit, push, or carry.

## Verified behavior

- All 66 V9 player clips parse on the live player rig with valid durations; no pack or skeleton errors were captured.
- Core jab and kick contacts now use slower authored windows. The jab is 0.96 s at 1.11× playback and the basic side kick is 1.30 s at 1.56×; all V9 retiming is capped at 1.85×.
- Player attacks trigger the existing villain directional/knockdown reactions. Enemy attacks now trigger player-side directional running hits, body/head/back reactions, knockdowns, death, and real face-down get-up.
- Deterministic browser checks cover Space jump, Alt dodge, expanded J/K sequences, player/enemy reactions, rail snap and K dismount, cover shift, ledge mount and shimmy, stairs, wall backflip, prop state changes, and Level 2 movement.

## 2026-08-31 Sol/high continuation

- Added explicit `JJJJ`, `JKJ`, `KJJ`, `KKK`, `KJK`, and `JJKK` endings while retaining the verified `JJJ`, `JKK`, and `KKJ` routes.
- Unified `E` traversal selection. Vault, wall, climb, swing, rail, ledge/hang, stairs, and world props are scored from object suitability, contact direction, approach/facing, player height, and stance before one action is selected.
- Player strikes now carry hit-region/reaction descriptors into the enemy reaction resolver. Hook, body, head, directional running, uppercut fall, knockdown, and the real villain get-up are selected from actual impact context.
- Player damage retains directional running/body/head/back/fall/death reactions and transitions knockdowns through the real face-down get-up clip.
- Added dedicated fill/key lighting to the distant Level 2 traversal lab so character poses and course geometry remain readable.
- Final probe: `output/v9-sol-qa/report.json`. It confirms 66/66 packed player clips, the full branch matrix above, keyboard `0` → `jumpIdle`, contextual traversal choices, bidirectional reactions, and zero captured browser errors.
