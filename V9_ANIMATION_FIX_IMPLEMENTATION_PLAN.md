# Aura Freeflow V9 — Animation Fix Implementation Plan

Status: plan only; no gameplay implementation has been performed.  
Authority build: `aura_pressure_freeflow_v9.html`  
Diagnostic basis: `V9_FULL_ANIMATION_DEBUG_REPORT_2026-09-01.md`

## Non-negotiable asset authority

The Rail Grinding FBX in the user's `new animations` map is the sole animation authority for the grinding loop.

Current generated route:

`new animations/Rail Grinding FBX → player_rail_grinding.fbx → animation_packs/v9_rail_pack.js → manifest.railGrind → rail state machine`

The implementation must not report a successful grind while visually playing `run`, `sprint`, `idle`, or another fallback. If the rail clip is not loaded, rail entry must wait briefly or display an unavailable/loading state; it must never enter gameplay rail state with a fake animation.

The recovery snapshot `aura_pressure_freeflow_v9_pre_sol_pass.html` is not an implementation target. It remains unchanged as historical recovery evidence.

## Delivery strategy

Repair one system at a time in this order:

1. Authority build, asset validation, and diagnostic telemetry.
2. Complete rail interaction state machine.
3. Rail camera and physical contact calibration.
4. Locomotion/strafe blend controller.
5. Combat motion/contact synchronization.
6. Parkour contact synchronization.
7. Full regression and visual acceptance pass.

Each phase must pass its focused tests before the next phase starts. Do not combine the rail and strafe rewrites in one edit because both touch player animation ownership and would make regressions hard to isolate.

## Phase 0 — Safe implementation baseline

### Work

- Confirm all implementation and testing uses `aura_pressure_freeflow_v9.html` through the local HTTP server.
- Create a dated recovery copy before changing code because the workspace has no usable Git history.
- Record checksums and timestamps for the active HTML, Rail Grinding FBX source, generated rail pack, and pack builder.
- Confirm the exact Rail Grinding source FBX in the `new animations` map and rebuild `v9_rail_pack.js` from that source rather than treating the existing generated pack as unquestioned authority.
- Inspect the Rail Grinding FBX independently in the animation lab and record:
  - duration and loop boundaries;
  - forward axis and rig facing;
  - Hip Y range;
  - left/right foot contact frames;
  - the frame that best represents entry into a stable grind;
  - whether the source contains unwanted root travel.
- Preserve the current X/Z normalization policy for gameplay-owned motion, but audit Hip Y separately.

### Telemetry to add before behavior changes

- `player.animation.key`, normalized time, weight, and previous animation.
- transition reason and transition count.
- locomotion local forward/side parameters.
- stable combat target ID and target-facing error.
- rail state, progress, tangent, contact point, capture distance, capture source, speed, and direction.
- rail animation readiness.
- camera-to-player line-of-sight and blocking collider.

### Gate

- The active page and generated pack demonstrably use the FBX from the new animations map.
- Direct animation preview visibly shows the correct grind pose and a clean loop.
- No game behavior has changed yet.

## Phase 1 — Replace rail booleans with an explicit rail state machine

### Required states

- `offRail`
- `railCandidate`
- `railMount`
- `railGrind`
- `railAir`
- `railReentry`
- `railDismount`

The state machine becomes the only owner of rail movement and rail animation. Ordinary player locomotion must not be allowed to overwrite it.

### Shared rail sampler

Create one rail-sampling function used by prompts, grounded entry, airborne capture, grinding, re-entry, camera framing, and dismounts. It must return:

- closest progress on the rail;
- world contact point including rail height;
- tangent and travel direction;
- horizontal and vertical separation;
- approach alignment;
- whether the projected landing is inside safe rail endpoints;
- camera-safe framing information.

This removes the current mismatch where some functions use full 3D distance while entry and update later force Y to zero.

### Grounded entry

- E creates `railMount`, not an instant `railGrind` snap.
- Accept only a bounded contact distance and valid approach angle.
- Project current player velocity onto the rail tangent to choose direction and initial grind speed.
- Move from the current position to the calibrated rail contact over a short mount window.
- Cap per-frame correction so entry cannot teleport laterally.
- Begin the real `railGrind` clip at the source FBX's verified stable-grind phase.
- Transition to `railGrind` only after physical and visual contact agree.

### Airborne entry

- Pressing E creates a short buffered rail-catch request rather than being ignored.
- While the buffer is active, evaluate descending rail intersections using current position, velocity, projected landing, horizontal tolerance, vertical tolerance, approach tangent, and endpoint safety.
- A valid catch cancels ordinary `v9Jump` landing and enters `railReentry`.
- Do not play `landFeet` or `idle` between the jump and grind.
- An invalid catch expires safely and preserves the normal jump.

### Automatic landing capture

- A descending player who physically lands on the rail may re-enter even if the E press happened slightly earlier.
- E remains the intentional input; automatic capture only consumes a valid buffered request unless a future design decision explicitly enables unconditional auto-grind.

### Jump from rail and re-entry

- Reuse the same rail sampler and `railReentry` path used by ordinary jumps.
- Retain rail ID, direction, and momentum while airborne.
- Re-enter only while descending and within physical tolerances.
- Landing back on the rail resumes the real `railGrind` clip without a run/idle/landing frame.
- Missing the rail transitions to a normal safe landing or fall state.

### Clip-readiness contract

- Preload the rail pack before the Level 1 rail prompt is enabled.
- Remove `run` as the successful rail-animation fallback.
- If loading fails, keep the player off the rail and show a concise rail-animation error rather than silently substituting another animation.

### Acceptance criteria

- Standing beside the rail + E enters the authored Rail Grinding FBX every time.
- Running jump toward rail + E enters grind on descent.
- Pressing E too early is buffered; pressing it outside tolerance does not magnetize Aura unrealistically.
- Jump from grind and land on the same rail resumes grinding.
- No sampled rail entry frame reports `run`, `sprint`, `idle`, or `landFeet` while rail state is active.
- Player root height matches the rail contact height plus the calibrated FBX contact offset.
- No rail capture correction exceeds the global visible-continuity cap.
- Rail direction and speed agree with the approach momentum.

## Phase 2 — Rail pose, contact, and camera calibration

### Pose/contact work

- Determine which foot or support point the Rail Grinding FBX expects on the rail.
- Store a small rig-space contact offset derived from the source pose.
- Apply that offset relative to sampled rail point/tangent/up rather than forcing player Y to zero.
- Calibrate loop playback rate against grind speed to prevent foot/body sliding.
- Preserve normalized loop phase during speed changes.
- Add a short authored crossfade into and out of the grind pose without restarting the loop unnecessarily.

### Camera work

- Add a rail camera mode driven by rail tangent, travel direction, upcoming obstruction clearance, and Aura visibility.
- Correct generic camera collision so an obstruction closer than the normal minimum distance places the camera in front of the obstruction, never beyond/inside it.
- Probe both trailing shoulders and choose the view with a clear target sightline.
- Preserve the Level 1 roof ceiling.
- Blend back to the combat camera after dismount instead of cutting.

### Acceptance criteria

- Aura's support foot/body remains visually attached to the rail through a full pass.
- The rail does not appear below the floor contact or through the legs.
- Aura remains visible for every sampled rail frame.
- No garage column, roof beam, sign, or ledge covers more than the allowed central target area.
- Camera transition into/out of rail mode is continuous.

## Phase 3 — Locomotion and strafe blend controller

### Asset decision gate

Audit the `new animations` map for target-relative forward, backward, and diagonal combat locomotion clips in addition to the existing left/right strafe clips.

- If suitable clips exist, add them to a dedicated locomotion pack.
- If they do not exist, build a conservative blend from run plus left/right strafe and document the missing backward-authored asset. Do not disguise a forward run as a polished backward strafe without visual review.

### Controller design

- Keep multiple locomotion actions alive and control their weights from target-local forward/side input.
- Preserve normalized gait phase when weights change.
- Never call `reset()` just because the dominant locomotion direction changes.
- Add input smoothing, acceleration/deceleration, and direction hysteresis.
- Add minimum target-lock and locomotion-state hold durations to stop per-frame target churn.
- Use one facing controller for normal locomotion, combat strafe, and attack alignment.
- Limit angular speed and angular acceleration; remove instant target-facing snaps from free locomotion.
- Maintain target-relative facing during forward/back/side combat movement rather than delegating forward/back input to generic movement-facing run.
- Match animation playback rate to actual controller speed.

### Transition rules

- Idle ↔ locomotion preserves planted-foot timing where possible.
- Run ↔ sprint preserves gait phase.
- Run ↔ strafe blends through weights instead of discrete resets.
- Left ↔ right reversal passes smoothly through a neutral/forward blend.
- Losing or changing target eases facing and weights rather than cutting.
- Camera rotation changes world input smoothly without forcing unrelated animation restarts.

### Acceptance criteria

- Holding one movement key while rotating the camera 180 degrees produces a continuous directional blend, not `strafe → run → strafe` resets.
- Alternating A/D rapidly does not repeatedly return both clips to their first footfall.
- Normalized locomotion phase remains continuous across run/strafe/sprint transitions.
- Target changes do not create one-frame body rotations.
- Foot sliding stays within the agreed planted-foot tolerance at walk/run/strafe speeds.
- No authored action is overwritten by locomotion while combat, reaction, rail, or parkour owns the player.

## Phase 4 — Combat motion and contact synchronization

### Motion ownership

- Keep X/Z root normalization, but replace generic whole-windup translation with move-specific approach curves.
- Separate target-facing rotation assist from positional assist.
- Cap both angular and linear correction by move.
- Stop positional assistance during verified planted-foot/contact phases.
- Keep the selected target stable throughout an authored strike unless it becomes invalid.

### Contact authority

- Audit each combat FBX for authored contact frames and the responsible hand/foot/shoulder bone.
- Move damage events to those markers.
- Require spatial bone-to-target validation within a tuned tolerance for ordinary strikes.
- Align enemy reaction start with the actual contact frame.
- Use staged transforms for multi-contact attacks.
- Retain the documented limitation for Flying Shoulder until a genuinely matching enemy-victim clip exists.

### Combo transitions

- Define legal cancel/queue windows per move.
- Match outgoing and incoming stance/foot phase where possible.
- Avoid resetting the next clip long before its visible ownership begins.
- Re-evaluate aggressive playback rates near 1.8x; prioritize readable contacts over fitting every asset into the old gameplay duration.

### Acceptance criteria

- No combat root step exceeds the continuity limit.
- Planted feet do not visibly glide during contact.
- Hit effects and enemy reactions begin within two simulation frames of visible contact.
- Turning toward a target is smooth and completes before contact.
- Every combo branch is visually reviewed at normal gameplay speed, not only through telemetry.

## Phase 5 — Parkour contact synchronization

### Work order

1. Running and standing jumps/landings.
2. Rail catches and re-entry integration regression.
3. Vault and vault-to-cover.
4. Braced/free hang mount and release.
5. Ledge drops and climb-up.
6. Wall run/backflip/landing.
7. Stairs, cover shifts, and remaining world interactions.

### Implementation pattern

- Record takeoff, hand-contact, support, release, apex, and landing markers for each authored clip.
- Drive procedural movement in phases that correspond to those markers.
- Use hand/foot anchors at actual contact phases.
- Search and validate the destination surface before committing.
- Land at detected surface height rather than a hard-coded zero.
- Allow carefully bounded steering only during authored controllable windows.
- Blend into the correct landing/idle/locomotion state without a frame-zero pop.

### Acceptance criteria

- Hands meet ledges/cover at authored contact frames.
- Feet meet landing surfaces without a vertical pop.
- Wall and vault motion agrees with the animation's travel direction.
- No traversal completion forces an unrelated pose for one frame.
- Parkour remains responsive without allowing impossible mid-animation direction changes.

## Phase 6 — Regression and evidence matrix

### Required real-input scenarios

#### Rail

- Stand beside rail → E → full grind → endpoint dismount.
- Run toward rail → E.
- Running jump toward rail → E early, on-time, and late.
- Jump across rail without E; verify no unwanted magnet.
- Grind → Space → land on same rail → continue grind.
- Grind → Space → miss rail → normal landing.
- Approach rail from both directions.
- Attempt rail near both endpoints.
- Full rail pass with camera obstacle/roof checks.

#### Locomotion

- Hold W/A/S/D separately with and without a target.
- Circular target movement while rotating camera.
- 180-degree camera sweep while holding D.
- Rapid A/D and W/S reversals.
- Run ↔ sprint repeatedly.
- Enter/exit enemy target range.
- Two enemies crossing target priority.

#### Combat

- Every J/K sequence from idle, run, strafe, and near maximum assist range.
- Attack during camera turn.
- Target dies or becomes invalid during a queued chain.
- Multi-contact moves and Aura Shot.
- Player reactions and get-up transitions.

#### Parkour

- Every traversal interaction from valid and invalid angles.
- Surface-edge and endpoint cases.
- Jump/landing transitions at different approach speeds.
- Camera visibility throughout each action.

### Automated assertions

- Correct active animation key and non-zero effective weight.
- No disallowed fallback animation during owned states.
- Transition count and reason.
- Normalized locomotion phase continuity.
- Maximum per-frame root displacement and rotation.
- Rail contact/height error.
- Hand/foot contact error at authored markers.
- Camera line-of-sight to player torso/head.
- No console/page errors.

### Visual evidence

For every phase, capture and inspect gameplay frames at:

- entry;
- physical contact;
- steady state;
- exit/landing;
- the previously failing boundary case.

Telemetry passing is insufficient if the screenshot does not show the expected physical relationship.

## Phase completion checkpoints

### Checkpoint A — Rail functional

The real Rail Grinding FBX is guaranteed, grounded and airborne entry work, rail hop re-entry works, and no fallback run is possible.

### Checkpoint B — Movement stable

Camera-relative strafing, reversals, target changes, and run/sprint transitions remain phase-continuous.

### Checkpoint C — Combat readable

Approach, facing, contact, reaction, and combo transitions visually agree.

### Checkpoint D — Parkour grounded

Hands, feet, surfaces, and landings match authored phases across the traversal set.

### Checkpoint E — Release candidate

Full real-input regression passes, all required screenshots are inspected, and the active V9 build has no known P0/P1 animation defects.

## Estimated implementation shape

This should be treated as a multi-pass controller repair, not a single patch:

- Pass 1: baseline, source-FBX validation, and telemetry.
- Pass 2: complete rail state machine and clip-readiness contract.
- Pass 3: rail contact/camera polish and rail regression.
- Pass 4: locomotion blend/phase controller.
- Pass 5: combat synchronization.
- Pass 6: parkour synchronization.
- Pass 7: full regression, visual QA, and handover.

Implementation should stop at every checkpoint if the new behavior regresses an already verified interaction. The next pass begins only after the current checkpoint has both telemetry and visual evidence.
