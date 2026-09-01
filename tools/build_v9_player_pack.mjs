import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [sourceDir, packDir] = process.argv.slice(2);
if (!sourceDir || !packDir) {
  throw new Error('Usage: node build_v9_player_pack.mjs <new-animations-dir> <pack-directory>');
}

// Canonical browser-safe filenames for every still-unused player clip in
// yellow+armored/new animations. Clips already shipped by V5-V8 are omitted.
export const V9_PLAYER_FILES = {
  'player_rail_grinding.fbx': 'rail grinding .fbx',
  'player_fall_face_forward.fbx': 'Fall Flat on face from hard hit on the back.fbx',
  'player_death.fbx': 'Dying no health .fbx',
  'player_stand_drop_hang.fbx': 'standing Drop To Freehang from legde against wall.fbx',
  'player_run_turn_180.fbx': 'Change Direction 180° while running.fbx',
  'player_aura_shot.fbx': 'Shooting ability out of hand .fbx',
  'player_guard_step_left.fbx': 'defence guard up side step to the left .fbx',
  'player_sit_down.fbx': 'Stand To Sit.fbx',
  'player_corkscrew_evade.fbx': 'Corkscrew Evade.fbx',
  'player_cover_crouch_left.fbx': 'crouch cover to cover crouched to the left.fbx',
  'player_run_hit_head_left.fbx': 'Hit On left Side Of Head while running .fbx',
  'player_push_start.fbx': 'Push Start.fbx',
  'player_carry.fbx': 'Carrying.fbx',
  'player_handstand_back_dodge.fbx': 'dodge backward by doing handstand back flip.fbx',
  'player_hit_generic.fbx': 'Hit Reaction.fbx',
  'player_cover_ready_right.fbx': 'standing Cover  right  To Stand ready .fbx',
  'player_cover_crouch_away.fbx': 'crouched against wall to crouched walk away .fbx',
  'player_run_strafe_left.fbx': 'running strafe to the left.fbx',
  'player_free_hang_left.fbx': 'free hang left Shimmy.fbx',
  'player_body_blow_fall.fbx': 'Big Body Blow getting pushed back and fall.fbx',
  'player_spin_high_kick.fbx': 'Chapa-Giratoria high kick .fbx',
  'player_front_twist_flip.fbx': 'Front Twist Flip.fbx',
  'player_jump_idle.fbx': 'jump- from idle to jump.fbx',
  'player_roll.fbx': 'rolling.fbx',
  'player_uppercut_reaction.fbx': 'Receive Uppercut To The Face.fbx',
  'player_aerial_evade.fbx': 'Aerial Evade for incoming projectile .fbx',
  'player_cover_stand_right.fbx': 'Standing Cover To Cover to the right.fbx',
  'player_free_hang_right.fbx': 'free hang Right Shimmy.fbx',
  'player_flying_shoulder_throw.fbx': 'Flying Shoulder Throw ( grab attack ).fbx',
  'player_ko_head.fbx': 'Knocked Out by head injury.fbx',
  'player_braced_hop_right.fbx': 'Braced Hang Hop right.fbx',
  'player_throw_victim.fbx': 'Shoulder Throw, Victim.fbx',
  'player_stand_jump_free_hang.fbx': 'standing jump to free hang.fbx',
  'player_sneak_walk.fbx': 'Sneak Walk.fbx',
  'player_cover_look_left.fbx': 'Stand Cover To Look left .fbx',
  'player_braced_hop_left.fbx': 'Braced Hang Hop Left.fbx',
  'player_jump_braced_hang.fbx': 'jumpt to Braced Hang.fbx',
  'player_crouch_stand_a.fbx': 'crouched to standing .fbx',
  'player_ledge_drop_waist.fbx': 'crouching on legde to jumping down from legde landing into crouch  ( waist hight ) .fbx',
  'player_guard_step_right.fbx': 'defence guard up side step to the right .fbx',
  'player_vault_to_cover.fbx': 'Vault Over Box to crouched cover .fbx',
  'player_cover_crouch_right.fbx': 'crouch cover to cover crouched to the right .fbx',
  'player_guard_pivot.fbx': 'guard up defence Pivot from front foot.fbx',
  'player_land_feet.fbx': 'Falling To Landing on feet transition .fbx',
  'player_get_up_face_down.fbx': 'from laying down face down to stand up .fbx',
  'player_run_hit_body_left.fbx': 'Hit On left Side Of body while running .fbx',
  'player_fall_roll_high.fbx': 'Falling from height To Roll.fbx',
  'player_fight_stance.fbx': 'standing idle to fight stance.fbx',
  'player_handstand_spin.fbx': 'single handstand spin attack start .fbx',
  'player_run_hit_head_right.fbx': 'Hit On right  Side Of Head while running .fbx',
  'player_crouch_stand_b.fbx': 'Crouched To Standing transition .fbx',
  'player_run_forward_flip.fbx': 'Running to Forward Flip.fbx',
  'player_run_hit_body_right.fbx': 'Hit On right Side Of body while running .fbx',
  'player_wall_backflip.fbx': 'run frontal towards wall kick of and backflip.fbx',
  'player_run_jump.fbx': 'Running to  Jump to running .fbx',
  'player_hang_climb_up.fbx': 'from hang to climb up on top of ledge .fbx',
  'player_jump_free_hang.fbx': 'jumpt to free hang.fbx',
  'player_inverted_double_kick.fbx': 'Inverted Double Kick To Kip Up attack.fbx',
  'player_standing_backflip.fbx': 'standing Backflip.fbx',
  'player_hang_jump_off.fbx': 'hanging on wall to jumping of.fbx',
  'player_cover_stand_left.fbx': 'Standing Cover To Cover to the left .fbx',
  'player_hit_back.fbx': 'getting Hit On The Back .fbx',
  'player_low_crawl.fbx': 'Low Crawl.fbx',
  'player_ledge_drop_high.fbx': 'crouching on legde to jumping down from legde landing into crouch  (jumping of from higher height  ) .fbx',
  'player_cover_look_right.fbx': 'Stand Cover To Look right .fbx',
  'player_run_strafe_right.fbx': 'running strafe to the right.fbx',
  'player_cover_ready_left.fbx': 'standing Cover  left To Stand ready .fbx',
};

const V9_GROUPS = {
  'v9-rail': [
    'player_rail_grinding.fbx'
  ],
  'v9-combat': [
    'player_aura_shot.fbx','player_spin_high_kick.fbx','player_flying_shoulder_throw.fbx',
    'player_handstand_spin.fbx','player_inverted_double_kick.fbx'
  ],
  'v9-traversal': [
    'player_guard_step_left.fbx','player_corkscrew_evade.fbx','player_handstand_back_dodge.fbx',
    'player_front_twist_flip.fbx','player_roll.fbx','player_aerial_evade.fbx',
    'player_guard_step_right.fbx','player_guard_pivot.fbx','player_standing_backflip.fbx',
    'player_stand_drop_hang.fbx','player_run_turn_180.fbx','player_free_hang_left.fbx',
    'player_jump_idle.fbx','player_free_hang_right.fbx','player_braced_hop_right.fbx',
    'player_stand_jump_free_hang.fbx','player_braced_hop_left.fbx','player_jump_braced_hang.fbx',
    'player_ledge_drop_waist.fbx','player_vault_to_cover.fbx','player_land_feet.fbx',
    'player_fall_roll_high.fbx','player_run_forward_flip.fbx','player_wall_backflip.fbx',
    'player_run_jump.fbx','player_hang_climb_up.fbx','player_jump_free_hang.fbx',
    'player_hang_jump_off.fbx','player_ledge_drop_high.fbx'
  ],
  'v9-reactions': [
    'player_fall_face_forward.fbx','player_death.fbx','player_run_hit_head_left.fbx',
    'player_hit_generic.fbx','player_body_blow_fall.fbx','player_uppercut_reaction.fbx',
    'player_ko_head.fbx','player_throw_victim.fbx','player_get_up_face_down.fbx',
    'player_run_hit_body_left.fbx','player_run_hit_head_right.fbx','player_run_hit_body_right.fbx',
    'player_hit_back.fbx'
  ],
  'v9-world': [
    'player_sit_down.fbx','player_cover_crouch_left.fbx','player_push_start.fbx','player_carry.fbx',
    'player_cover_ready_right.fbx','player_cover_crouch_away.fbx','player_run_strafe_left.fbx',
    'player_cover_stand_right.fbx','player_sneak_walk.fbx','player_cover_look_left.fbx',
    'player_crouch_stand_a.fbx','player_cover_crouch_right.fbx','player_fight_stance.fbx',
    'player_crouch_stand_b.fbx','player_cover_stand_left.fbx','player_low_crawl.fbx',
    'player_cover_look_right.fbx','player_run_strafe_right.fbx','player_cover_ready_left.fbx'
  ]
};

const assigned = new Set(Object.values(V9_GROUPS).flat());
const missing = Object.keys(V9_PLAYER_FILES).filter(name => !assigned.has(name));
const unknown = [...assigned].filter(name => !V9_PLAYER_FILES[name]);
if (missing.length || unknown.length) {
  throw new Error(`Invalid pack grouping. Missing: ${missing.join(', ') || 'none'}; unknown: ${unknown.join(', ') || 'none'}`);
}

await mkdir(packDir, { recursive: true });
for (const [packName, embeddedNames] of Object.entries(V9_GROUPS)) {
  const animations = {};
  for (const embeddedName of embeddedNames) {
    const sourceName = V9_PLAYER_FILES[embeddedName];
    animations[embeddedName] = (await readFile(path.join(sourceDir, sourceName))).toString('base64');
    process.stdout.write(`Packed ${embeddedName} <- ${sourceName}\n`);
  }
  const packPath = path.join(packDir, packName.replaceAll('-', '_') + '_pack.js');
  const output = `// Generated V9 ${packName} animation pack. Loaded on demand.\n` +
    `window.AURA_ANIMATION_PACKS ??= {};\n` +
    `window.AURA_ANIMATION_PACKS[${JSON.stringify(packName)}] = { animations: ${JSON.stringify(animations)} };\n`;
  await writeFile(packPath, output);
  process.stdout.write(`Wrote ${embeddedNames.length} animations to ${packPath}\n`);
}
