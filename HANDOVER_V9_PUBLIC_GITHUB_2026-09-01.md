# Aura Pressure Freeflow V9 — public GitHub handover

Use this file as the authoritative handover when continuing in a new chat. It supersedes the older corrective and recovery handovers wherever they conflict.

## User/model workflow

The user writes the chosen model and reasoning level at the top of a request, for example `Sol high )`.

- If that model is suitable, say it is suitable and start immediately.
- If a model switch is genuinely needed, explain the proposed switch first and wait for the user to say `start`.
- Never silently switch models.
- Sol High was suitable for the completed animation-fix and GitHub work.

## Canonical source and version

- Public repository: <https://github.com/brokendeity/aura-pressure-freeflow-v9>
- Local workspace: `/Users/richardmpayi/Documents/echte game /moniker game`
- Active branch: `main`
- Stable verified tag: `v9.0-animation-fix`
- Canonical game: `aura_pressure_freeflow_v9.html`
- Immediate recovery snapshot: `aura_pressure_freeflow_v9_pre_animation_fix_2026-09-01.html`
- Initial verified game commit: `c739a3be9b973c002d58cda0647ca279d06e392b`
- Git LFS stores both exact standalone HTML files. Run `git lfs install` before cloning/pulling.

Do not use an older crashed Codex thread, old standalone build, `aura_pressure_freeflow_v9_pre_sol_pass.html`, or the older handover caveat as current authority. Start from repository `main` unless the user explicitly asks to restore the tagged snapshot.

## Current verified status

The V9 animation-fix implementation is complete and pushed to GitHub.

- 67 authored player clips load: the prior 66-player matrix plus the supplied rail-grinding FBX.
- Prepared player Hip X/Z root travel is zeroed; gameplay owns world translation.
- Combat approach is eased and capped at `0.070` world units per update.
- Combat facing rotates smoothly instead of snapping.
- Inverted Double and Flying Shoulder use readable authored durations and staged contacts.
- Aura Shot is a visible homing projectile fired from the authored right-hand point.
- Enemy super attack routes player `playerHit → uppercutReaction → throwVictim`.
- Rail interaction uses the actual `rail grinding .fbx`, never the run animation.
- Rail ownership is explicit: `offRail → railCandidate → railMount → railGrind → railAir → railReentry → railGrind/railDismount`.
- Grounded `E` mounts from beside the rail.
- Airborne `E` buffers a descending rail catch.
- Space jumps from a rail, and valid rail contact resumes the same grind direction/progress.
- A jump without `E` does not magnetically capture the player.
- Running/strafe uses simultaneous run/left/right actions with normalized gait phase, smoothed weights, stable target selection, and smooth facing.
- Rapid A/D reversals do not restart the locomotion cycle.
- Hang poses are held at the authored contact frame rather than drifting.
- Jump landing height is surface-aware; landing actions are consistently retimed.
- The Level 1 garage roof remains. Camera height is capped below it, rail framing follows the rail tangent, and near columns no longer push the camera through geometry.
- Direct `file://` startup and HTTP startup both load sibling animation packs correctly.
- Contextual traversal remains live for braced/free hangs, high/waist drops, wall actions, vault-to-cover, cover-away exit, stairs, swing, climb, sit, push, and carry.

## Important implementation files

- `aura_pressure_freeflow_v9.html` — active game authority
- `animation_packs/v9_rail_pack.js` — authored rail-grinding clip
- `animation_packs/v9_combat_pack.js` — advanced player combat clips
- `animation_packs/v9_traversal_pack.js` — traversal/dodge clips
- `animation_packs/v9_reactions_pack.js` — player reaction clips
- `animation_packs/v9_world_pack.js` — cover/world clips
- `tools/build_v9_player_pack.mjs` — rebuilds the generated packs from FBX sources
- `tmp/v9_animation_fix_qa.mjs` — focused rail/locomotion/camera QA
- `tmp/v9_sol_qa.mjs` — full deterministic animation/context/combat QA
- `V9_ANIMATION_FIX_IMPLEMENTATION_PLAN.md` — completed implementation plan
- `V9_FULL_ANIMATION_DEBUG_REPORT_2026-09-01.md` — pre-fix root-cause audit
- `progress.md` — chronological implementation record

## Final QA evidence

All three final validation layers passed with zero captured game/browser errors.

### Focused rail and locomotion QA

- Report: `output/v9-animation-fix-qa/report.json`
- Screenshots:
  - `output/v9-animation-fix-qa/ground-grind.png`
  - `output/v9-animation-fix-qa/air-catch-grind.png`
  - `output/v9-animation-fix-qa/strafe-sweep.png`
- Confirmed sequences:
  - ground: `railMount → railGrind`
  - rail hop: `railAir → railGrind`
  - airborne catch: `v9Jump → railReentry → railGrind`
  - no-input jump: remains `offRail`
  - camera sweep: locomotion phase continues across run/strafe weighting
  - six rapid A/D reversals: no animation restarts

### Full deterministic QA

- Report: `output/v9-sol-qa/report.json`
- Screenshots: `output/v9-sol-qa/`
- Confirms 67 clips, zero prepared X/Z root range, `0.070` maximum combat frame step, rail hop/rejoin, both hang styles, both ledge classes, contextual cover/wall routes, staged combat/reactions, and keyboard `0` as standing jump only.

### Independent real-input smoke

- State: `output/v9-animation-fix-client/state-0.json`
- Screenshot: `output/v9-animation-fix-client/shot-0.png`
- Final state: active Level 1 gameplay, normal `landFeet` recovery, live enemy threat, rail clip ready, camera clear, no error artifact.

## Commands to resume and verify

From the repository root:

```sh
git lfs install
python3 -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/aura_pressure_freeflow_v9.html
```

Focused QA:

```sh
node tmp/v9_animation_fix_qa.mjs
```

Full deterministic QA:

```sh
node tmp/v9_sol_qa.mjs
```

Independent real-input smoke:

```sh
node /Users/richardmpayi/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url http://127.0.0.1:4173/aura_pressure_freeflow_v9.html \
  --actions-file tmp/v9_motion_smoke_actions.json \
  --iterations 1 --pause-ms 250 \
  --screenshot-dir output/v9-animation-fix-client
```

Module syntax check:

```sh
node -e "const fs=require('fs');const s=fs.readFileSync('aura_pressure_freeflow_v9.html','utf8');const a=s.indexOf('<script type=\"module\">')+22,b=s.lastIndexOf('</script>');process.stdout.write(s.slice(a,b))" \
  | node --input-type=module --check -
```

## Controls relevant to the completed pass

- WASD: move
- Shift: sprint
- Space: contextual jump / rail hop
- E: contextual traversal / ground rail mount / airborne rail catch
- J: light attack
- K: heavy attack
- L: launcher
- X: finisher
- Z: Aura attack
- Alt: dodge
- C: crouch/cover
- Q: quick turn
- R: restart
- `0`: standing jump-up-only

## Known asset-level limitations

1. There is no authored backward-running animation in the supplied new-animation map. Dominant backward movement therefore faces the movement vector instead of faking a backward strafe with the forward run clip.
2. There is no matching villain victim clip for a truly synchronized player Flying Shoulder throw. The current safe implementation uses staged body contact followed by the existing launch reaction. Do not claim a paired throw unless a matching victim asset is supplied.
3. The public standalone HTML is approximately 244 MB and stored through Git LFS. Web tools can access it, but cloning with Git LFS is more reliable than asking a web UI to ingest the entire file at once.

## Recommended next product pass

The next sensible milestone is the previously deferred **combat-feel pass**, not another animation-routing rewrite.

Suggested scope:

- authored per-move hit-stop and camera impulse
- attack-specific sound timing
- cancel/queue windows and recovery readability
- contact-distance validation for staged strikes
- enemy reaction timing against visible player contact
- combat camera composition under multiple nearby enemies
- focused real-input testing of direction changes during attack targeting

Preserve the verified rail state machine, normalized-phase locomotion blend, zeroed player root X/Z preparation, roof-safe camera, direct-file pack loader, and existing contextual traversal.

## New-chat starter prompt

Copy this into the new chat, changing the first line only if you deliberately select another model:

```text
Sol high ) Continue Aura Pressure Freeflow V9 from the public GitHub repository:
https://github.com/brokendeity/aura-pressure-freeflow-v9

Read HANDOVER_V9_PUBLIC_GITHUB_2026-09-01.md completely before acting. Treat repository main and aura_pressure_freeflow_v9.html as authority. The stable verified tag is v9.0-animation-fix. Do not use older crashed threads or historical builds as authority.

I always state the model at the top. If the model is suitable, say so and start. If a switch is genuinely needed, explain it first and wait until I say start. Never switch silently.

First confirm the repository/LFS checkout and current QA baseline. Then continue with the task I give you without regressing the rail state machine, locomotion phase blending, combat root continuity, parkour surface landing, roof-safe camera, or direct-file pack loading.
```

