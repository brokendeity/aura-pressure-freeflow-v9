# Continue Aura Freeflow V9

The prior Codex task **"Continue from v8"** crashes when opened. Continue in this project folder and treat the local files as the source of truth.

## User workflow

The user is on **Terra / high reasoning**. Before making a new plan, say whether a model change is needed. If it is not, say so and start planning. Do not change models without explaining why and waiting for the user.

## Existing work

- Main game build: `aura_pressure_freeflow_v9.html`
- Animation inventory: `V9_ANIMATION_COVERAGE.md`
- Asset source: `/Downloads/yellow+armored`
  - `villain` = enemy animations
  - `new animations` and `animations` = player animations

## Requested continuation

1. Slow down jab and kick animations; they currently play far too quickly.
2. Expand combat and parcours/traversal.
3. Integrate every usable remaining player and enemy animation.
4. Make traversal contextual: select the correct action based on the nearby object, contact direction, and character position, similar to the existing wall-run and vault behavior.
5. Make the number button play only the jump-up animation; it must not trigger jump-dive-roll.
6. Further expand the J and K move branches.
7. Add player-to-enemy and enemy-to-player hit/reaction animations wherever matching assets are available.

First inspect the V9 build and asset inventory, then propose the next focused implementation plan.
