# Kudamono Battle

A browser-based 2D platform fighter prototype built with Vite, TypeScript, and Phaser.

## Run

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:5173/`.

## Flow

`Title -> Character Select -> Stage Select -> Game -> Result`

From the result screen:

- `R`: rematch with the same character and stage
- `C`: return to character select
- `T`: return to title

## Controls

- `A` / `D`: move
- `W`: jump / up input
- `S`: down input
- `J`: normal attack
- `K`: special attack
- `L`: dodge
- `R`: restart

On touch devices, use the left stick for movement and direction, then tap `A` for normal attacks or `B` for specials. Pushing the stick upward also jumps.

## Moves

Strawberry Samurai:

- Neutral normal: Seed Jab
- Side normal: Berry Blade
- Up normal: Leaf Upper
- Down normal: Low Vine Cut
- Neutral special: Pectin Pulse
- Side special: Jam Dash
- Up special: Leaf Lift
- Down special: Jam Spike

Banana Brawler:

- Neutral normal: Peel Pop
- Side normal: Peel Hook
- Up normal: Stem Upper
- Down normal: Banana Sweep
- Neutral special: Potassium Burst
- Side special: Slipstream Rush
- Up special: Peel Copter
- Down special: Peel Drop

## Current Scope

- Bun-based build and deployment scripts
- 1P vs CPU
- 3-stock match
- Damage-scaled knockback
- Generated kitchen stage with collision aligned to the cutting board and plates
- Optimized WebP anthropomorphic fruit character motion frames

## Docs

- [Character and visual design](docs/character-design.md)
- [Screen flow and menus](docs/screen-flow.md)

## Build and Deploy

```bash
bun run build
bun run deploy
```

`deploy` publishes `dist` to the `gh-pages` branch.
