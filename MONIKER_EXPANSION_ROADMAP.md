# Moniker Expansion Roadmap

## Direction

Aura Pressure is now a Moniker-world freeflow action game. Rhythm remains an expressive pacing and scoring layer, but movement, attacks, counters, AI decisions, story consequences, and progression must work independently of the beat.

The durable loop is:

`combat performance -> Aura/reputation -> crowd and enemy response -> territory/Moniker consequences -> new encounters and abilities`

## Next playable milestone: an 8–10 minute vertical slice

1. **Arrival and stakes** — enter Aura Garage with a named rival crew, one short authored intro, and a visible reputation objective.
2. **Readable freeflow fight** — three enemy roles in one encounter: Rusher, Interceptor, and Heavy. The conductor alternates pressure, flank, and anchor behavior.
3. **Aura choice** — after gaining control, the player can leave cleanly or take an optional high-risk Aura action in front of witnesses.
4. **Consequence** — the result changes a crew relationship, district pressure, crowd reaction, and the next encounter setup.
5. **Return screen** — show the Moniker earned, witnesses reached, rival response, and unlocked route; rhythm grade is one line in this report rather than the whole result.

## Build order

### 1. Finish the combat feel

- Add authored player clips for J/K/L/X and map each clip’s contact frames.
- Give every enemy role a distinct silhouette, tell, counter window, recovery, and conductor purpose.
- Add hit-stop, role-specific impact audio, short attack vocals, and directional audio before adding more HUD.
- Preserve the shared-root grab, ZERO_XZ get-up, exact roll, and contextual traversal rules already verified in V4.

### 2. Turn Aura into world state

- Track witnesses, intimidation, crew respect, collateral, style variety, and whether the player overstayed.
- Let high Aura change weak enemies toward hesitation/desperation and elites toward focus, rather than globally lowering difficulty.
- Persist district reputation and use it to select patrols, ambushes, support roles, and crowd density.

### 3. Add a mission shell

- Reuse the older cinematic build only as a donor for camera/cutscene ideas; keep V4 as gameplay authority.
- Build missions from small data-driven beats: arrival, traversal, encounter, Aura choice, consequence, exit.
- Add checkpoint/save data before expanding beyond one district.

### 4. Reduce prototype friction

- Split the 246 MB single HTML into versioned source modules and external assets while keeping a distributable standalone build.
- Move encounter, role, attack, reputation, and mission definitions into data files.
- Keep deterministic state hooks as permanent regression infrastructure.

## Definition of success for the next pass

The player should be able to ignore the beat and still experience responsive, readable freeflow combat; choosing to play with the music should improve flair, Aura, crowd response, and consequences—not basic control reliability.
