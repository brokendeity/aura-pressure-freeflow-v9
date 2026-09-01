# Aura Pressure Freeflow V9

Verified standalone web-game release containing Aura Pressure Freeflow V9, its authored player animation packs, deterministic QA tools, and final browser evidence.

## Play

The canonical build is `aura_pressure_freeflow_v9.html`.

You can double-click the HTML file for the direct-file-compatible build, or serve the repository locally:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/aura_pressure_freeflow_v9.html
```

## Controls

- WASD: move
- Shift: sprint
- Space: contextual jump / rail hop
- E: contextual parkour / rail mount / airborne rail catch
- J: light attack
- K: heavy attack
- L: launcher
- X: finisher
- Z: Aura attack
- Alt: dodge
- C: crouch / cover
- Q: quick turn
- R: restart
- 0: standing jump-up-only

## Release contents

- `aura_pressure_freeflow_v9.html` — canonical verified game
- `aura_pressure_freeflow_v9_pre_animation_fix_2026-09-01.html` — immediate recovery snapshot
- `animation_packs/` — generated V7/V9 authored animation packs, including rail grinding
- `tools/` — animation packing/extraction utilities
- `tmp/` — deterministic and real-input QA scripts/action payloads
- `output/v9-animation-fix-qa/` — focused rail and locomotion evidence
- `output/v9-sol-qa/` — full 67-clip regression evidence
- `output/v9-animation-fix-client/` — independent real-input smoke evidence
- project reports and implementation handovers in the repository root

## Verified status

- 67 authored player clips loaded
- ground rail mount, rail hop/rejoin, and airborne E catch verified
- normalized-phase run/strafe blending verified under camera sweeps and rapid reversals
- prepared player animation root X/Z travel is zeroed; gameplay owns world translation
- combat approach is eased and capped at 0.070 units per update
- braced/free hangs, ledge classes, cover exits, wall routing, reactions, and Aura Shot verified
- focused QA, full deterministic QA, and independent real-input smoke run pass with zero game/browser errors

See `progress.md` and `V9_ANIMATION_FIX_IMPLEMENTATION_PLAN.md` for the full implementation history.

## Git LFS

The standalone HTML files are stored with Git LFS because each exact embedded build is approximately 244 MB. Install Git LFS before cloning or pulling this repository:

```sh
git lfs install
```

## Asset note

This repository is a public project archive so external tools and collaborators can inspect the release. No open-source license or permission to redistribute included third-party animation/model assets is granted.
