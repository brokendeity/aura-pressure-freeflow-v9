# Aura Freeflow V9 — Full Animation Debug Report

Date: 2026-09-01  
Scope: diagnostic analysis only; no game implementation was changed.  
Primary build audited: `aura_pressure_freeflow_v9.html`  
Comparison build: `aura_pressure_freeflow_v9_pre_sol_pass.html`

## Executive verdict

The animation assets are generally loading and the active V9 build can select the authored clips, but the animation controller is still prototype-quality. The most visible problems are caused by state routing and transition architecture, not merely broken FBX files.

There are five primary faults:

1. The previously shown `pre_sol_pass` page is not the active rail-animation build. It has no `railGrind` manifest entry or `player_rail_grinding.fbx` pack, so its legacy rail behavior deliberately plays `run`.
2. Normal jumps can never attach to a rail. Both the rail-context resolver and the rail-start function reject airborne/motion-controlled players. Automatic rail re-entry exists only for a jump that began while already grinding.
3. Locomotion uses hard clip selection instead of a locomotion blend tree. Camera yaw, target selection, and a single lateral threshold repeatedly switch run/left-strafe/right-strafe.
4. Every locomotion clip change resets the incoming clip to time zero. Reversing direction therefore restarts the same early footfall instead of preserving gait phase.
5. Combat and most V9 parkour paths move the gameplay root using independent procedural curves while the FBX plays in place. Contacts, planted feet, handholds, facing changes, and clip phase are not consistently synchronized to that root motion.

The existing deterministic QA is useful for loading, routing, and numerical continuity, but it does not test camera-relative strafe churn, ordinary airborne E-to-rail capture, gait-phase continuity, or whether a reported animation visually matches the physical contact.

## Reproduced failures

### 1. Jumping toward the rail and pressing E does nothing

Reproduction used real keyboard events in the active V9 build:

- Aura began at `z = 6.28`, moved toward the rail, and started `runJump`.
- Immediately before E: `y = 0.94`, `z = 6.80`, motion = `v9Jump`, rail = null.
- Immediately after E: state was unchanged. Motion remained `v9Jump`; rail remained null.
- Aura landed at `z = 8.08`, directly over the rail. Animation became `landFeet`; rail remained null.
- After settling, animation became `idle`; only then did the `v9Rail` E prompt become available.

This is deterministic and directly confirms the reported bug.

Root cause:

- `v9RailContext()` returns null whenever `player.position.y > .18`.
- `tryStartRailGrind()` returns false whenever any `motion` is active.
- A normal `v9Jump` never checks for a descending rail intersection.
- The automatic rejoin code exists only inside the dedicated `v9RailJump` state created after jumping from an existing grind.

Severity: critical for traversal feel.

### 2. Grounded E and the apparent run animation

In the active V9 build, grounded E produced `railGrind` from the first sampled simulation frame and kept it active. The authored grind pose is visible in `output/v9-sol-qa/rail-rejoin.png`.

However, the previously shown `aura_pressure_freeflow_v9_pre_sol_pass.html` has no authored rail-grind clip mapping. Its V8 rail path uses the generic run animation. If that snapshot is still the page being opened, the reported “runs on the rail” behavior is exactly what its code is expected to do.

The active build still has physical-quality defects even when `railGrind` is selected:

- Entry can snap laterally by as much as 1.55 m to the nearest point.
- The rail is authored at `y = .16`, but the player root is forced to `y = 0`.
- There is no rail-mount or landing transition; the grind pose starts immediately.
- Entry speed is always 8.2 instead of being derived from approach velocity.
- There is no foot/board/hip contact alignment to the rail.
- The rail is treated as a straight horizontal parameter, not a contact surface with height/orientation sampling.

Severity: critical if the old snapshot is being used; high physical-quality defect in the active build.

### 3. Camera-relative strafe churn

With one continuous D input and one nearby enemy, the active build initially selected `runStrafeRight`. Rotating the camera approximately 174 degrees produced this sequence:

`runStrafeRight → run → runStrafeRight → runStrafeLeft`

The switches occurred while the same movement key remained held. The first run switch happened around camera yaw `-0.522`; the strafe direction inverted around yaw `-1.782`.

Root cause:

- Movement input is rotated by `cameraYaw` every frame.
- Strafe selection is binary: `abs(side) > .62`.
- There is no hysteresis around `.62` and no minimum state hold.
- There is no forward/backward combat-locomotion state. Falling below the lateral threshold delegates to normal run.
- Strafe instantly faces the selected target; normal run smoothly rotates toward movement. The two branches use different rotation ownership.
- Target presence is limited to 5.2 m, so crossing that range boundary also changes the locomotion controller.

Severity: high and continuously player-visible.

### 4. Rapid direction changes restart footfalls

Alternating D/A every 0.1 seconds produced:

`right → left → right → left → right → left`

Every sample reported action time `0.083`. The gait never advanced through a stable cycle because each direction switch reset the incoming action to its beginning.

Root cause:

- `play()` calls `action.reset()` on every clip change.
- Crossfades use a duration but do not synchronize normalized phase between locomotion actions.
- There is no inertialization, velocity smoothing, or acceleration-based direction blend.

Severity: high for controller feel.

### 5. Rail camera can completely lose Aura

The grounded rail diagnostic produced a frame where a garage column occupied almost the entire center of the screen and Aura was not visible.

Root cause:

- Rail grinding uses the generic combat camera; it has no rail-specific sightline.
- When a camera ray hits nearby geometry, the correction uses `max(minDist, hitDistance - margin)`.
- If the obstruction is closer than `minDist`, that expression can place the camera past or inside the obstruction rather than between the target and the obstruction.

Evidence: `output/v9-debug-report/ground-rail-entry.png`.

Severity: high visibility/usability defect.

## Locomotion and strafe architecture audit

### Confirmed strengths

- Run, sprint, and both authored strafe FBXs load in the active build.
- Player FBX Hip X/Z tracks are normalized to zero, so clips no longer apply their own horizontal scene offsets.
- A stable single-direction strafe does continue its action rather than restarting every frame.
- Normal ground rotation is smoothed rather than fully instantaneous.

### Remaining problems

1. **No blend tree.** Only one full-body action is authoritative. Direction is classified into discrete states.
2. **No gait-phase preservation.** Run/strafe/sprint changes begin at frame zero.
3. **No transition hysteresis.** The `.62` strafe threshold can be crossed repeatedly by small camera or target changes.
4. **Inconsistent facing policy.** Strafe uses instantaneous target-facing; run uses movement-facing with smoothing.
5. **No combat forward/back locomotion.** Input near the forward/back axis falls into generic run, which rotates Aura away from combat facing.
6. **Target instability remains visible.** Target continuity exists mainly for attacks. Free locomotion calls the nearest-target selector every update and can face a different enemy immediately.
7. **Stride speed is not matched.** Gameplay moves at fixed 3.9/4.3/6.6 m/s while loop playback stays at the asset's default rate. Zeroing authored root travel prevents teleportation but creates foot sliding unless playback rate is calibrated to controller speed.
8. **Lazy fallback can mask authored clips.** When a world-pack locomotion clip is not resident, `v9PlayOrWarm()` temporarily plays `run`. The active page currently background-loads the packs, but early input or slow parsing can still expose the fallback.

## Rail system audit

### What works in the active build

- Grounded E can enter `railGrind` when the authored rail pack is loaded.
- The rail clip loops and the active QA captures a visible crouched grind pose.
- Space while already grinding creates `v9RailJump`.
- That rail-originated hop automatically re-enters the same rail near 86% of its jump duration.
- Rail state progression is deterministic and telemetry reports it correctly.

### What does not work

- A normal running jump cannot grind or queue a grind.
- E during any jump is ignored rather than buffered.
- Descending proximity, vertical velocity, landing tolerance, and approach alignment are not evaluated.
- Landing on a rail after a normal jump uses `landFeet` and then idle.
- Ground entry is an instant positional snap rather than an approach/mount transition.
- Rail height is not applied to the player root.
- Grind speed and direction are not derived from actual movement momentum.
- There is no dedicated rail camera or obstacle-aware framing mode.
- Rail contact is visual only; there is no IK/contact solver.
- The direct QA helper starts rail flow through internal functions and therefore bypasses the missing real-world jump-to-E path.

## Combat animation audit

### What works

- The audited build loads 67 authored player clips.
- Representative attack clips have zero prepared X/Z root range, preventing their raw FBX travel from directly teleporting the player mesh.
- Heavy-attack target assistance is frame-bounded: observed peak step was 0.0774 m, below the 0.095 m cap.
- Advanced multi-contact events and Aura Shot routing are present.
- No console or page errors occurred during the diagnostic run.

### Why combat can still look janky

1. **Procedural glide during planted poses.** The heavy probe still moved Aura 0.8597 m using gameplay-root assistance during the attack. Small continuous steps avoid a single teleport but can visibly skate planted feet.
2. **Instant attack facing.** Starting an attack calls `faceDirection()` immediately. Assist updates can also re-face the target without an angular-speed limit.
3. **Range/time contacts instead of bone contacts.** Most standard attacks resolve against target distance and an authored ratio, not actual hand/foot intersection. Only a limited set of moves use more specific event handling.
4. **No paired synchronization for most attacks.** Attacker and victim clips do not share a contact transform or common interaction root. Flying Shoulder still has no matching paired enemy-victim animation.
5. **Sequence transitions are not pose-matched.** A queued attack starts after the current attack ends, resets the next clip, and crossfades without matching stance, foot, or momentum.
6. **Aggressive playback retiming.** Advanced attacks run near the 1.8x cap: Flying Shoulder 1.805x and Inverted Double 1.798x. That reduces readability and increases contact mismatch risk.
7. **Single full-body layer.** Locomotion, facing correction, attacks, reactions, and traversal compete for one current full-body action rather than using layered masks or motion matching.

## Parkour animation audit

### Better-integrated legacy paths

The older hand-vault, climb, and swing paths contain explicit hand/foot contact correction. These are the strongest traversal integrations in the file.

### Generic V9 paths

Normal jump, hang mount, hang shifts, ledge drops, vault-to-cover, stairs, and several wall transitions use procedural interpolation (`smoothstep`, linear interpolation, and sinusoidal arcs) while a separately retimed FBX plays in place.

Consequences:

- Animation contact frames are not authoritative for the gameplay trajectory.
- Feet can slide at takeoff and landing.
- Hands can miss ledges before the final pose is forced.
- Hang completion jumps to a fixed point around 66.7% of the selected clip and is then repeatedly held there.
- Stairs traverse to a fixed endpoint over 1.15 seconds regardless of the authored step cadence.
- New vault-to-cover uses a generic arc and lacks the hand planting used by the older vault implementation.
- Player steering is locked for most special-motion windows, making direction corrections feel unresponsive.
- Normal jump landing always resolves through its own endpoint logic and does not search for rails or other context surfaces.

Severity: medium to high depending on the move; the structural cause is shared across the parkour set.

## Loading and build-version audit

The active V9 build and the recoverable snapshot now differ materially:

- `aura_pressure_freeflow_v9.html` contains the rail-grind manifest entry, rail pack, normal-root continuity pass, and roof-camera pass.
- `aura_pressure_freeflow_v9_pre_sol_pass.html` is a recovery snapshot. It contains the old rail behavior and must not be used to judge the current rail integration.

The earlier photographed URL showed the recovery snapshot. This is the strongest explanation for seeing a run animation during grounded rail flow even though the active V9 runtime reports and visibly plays `railGrind`.

## QA coverage gaps

Existing QA proves clip loading and many route selections, but it misses the reported player-experience failures:

- Rail QA uses internal placement/start helpers instead of an ordinary running jump followed by E.
- Rail-hop QA only tests re-entry after a jump that starts on the rail.
- There is no camera-yaw locomotion stress test.
- There is no rapid A/D reversal test or gait-phase assertion.
- Animation telemetry checks the key name, not whether the visible pose physically contacts the rail/target/ledge.
- X/Z root normalization is audited, but Hip Y continuity and first/last-pose compatibility across transitions are not.
- There is no visibility assertion that Aura remains unobstructed during a complete rail pass.
- Passing “zero console errors” does not imply good animation behavior; all reproduced bugs occurred with zero browser errors.

## Severity and recommended correction order

### P0 — Establish the correct authority build

Confirm playtesting always opens `aura_pressure_freeflow_v9.html`, not `aura_pressure_freeflow_v9_pre_sol_pass.html`.

### P1 — Rail interaction contract

Design a unified rail-catch state covering grounded mount, airborne buffered E, descending auto-catch, approach alignment, valid vertical tolerance, momentum-derived direction/speed, contact height, and a safe rail camera.

### P1 — Locomotion controller

Replace the hard run/strafe switches with a target-relative 2D locomotion blend, add hysteresis/state hold, preserve normalized gait phase, and use one consistent facing controller with angular acceleration limits.

### P1 — Camera visibility

Correct collision placement when an obstruction is closer than the minimum camera distance, then add rail/traversal-specific sightline tests.

### P2 — Combat physical synchronization

Separate rotation assist from translation assist, reduce planted-foot glide, use move-specific contact transforms/bones, and validate attack-to-reaction timing visually rather than only by state key.

### P2 — Parkour contact synchronization

Move V9 traversal from generic arcs toward authored contact markers with hand/foot anchors, surface-aware landing, and controllable transition windows.

### P2 — Regression suite

Add real-input tests for camera-turn strafing, direction reversals, running jump + E rail capture, normal landing on a rail, full rail camera visibility, and transition phase continuity.

## Evidence generated

- `output/v9-debug-report/ground-rail-entry.png` — rail camera occlusion.
- `output/v9-debug-report/jump-to-rail-result.png` — normal jump lands over the rail and returns to idle with the E prompt.
- `output/v9-debug-report/strafe-look-turn.png` — camera-relative direction change during combat locomotion.
- `output/v9-sol-qa/rail-rejoin.png` — the active build's authored grind pose after its internally supported rail-originated hop.
- `output/v9-sol-qa/report.json` — 67 loaded clips, root-motion normalization, combat profiles, and internal rail-state QA.

No game HTML, JavaScript, animation pack, or gameplay behavior was modified during this audit.
