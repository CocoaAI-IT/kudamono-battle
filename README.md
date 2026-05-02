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

Each fighter uses the same input grid: neutral/side/up/down plus normal or special.

| Fighter | Type | Signature specials |
| --- | --- | --- |
| Strawberry Samurai | Speed swordsman | Pectin Pulse, Jam Dash, Leaf Lift, Jam Spike |
| Banana Brawler | Midweight brawler | Potassium Burst, Slipstream Rush, Peel Copter, Peel Drop |
| Grape Gunner | Ranged zoner | Grape Shot, Cluster Burst, Vine Swing, Sticky Juice Mine |
| Watermelon Tank | Super heavyweight | Seed Cannon, Melon Charge, Rind Rocket, Heavy Drop |
| Pineapple Trapper | Trap controller | Syrup Trap, Pine Roll, Crown Lift, Spike Field |
| Cherry Ninja | Rushdown combo | Double Pop, Cherry Blink, Stem Hook, Split Step |

## Current Scope

- Bun-based build and deployment scripts
- 1P vs CPU
- 3-stock match
- Damage-scaled knockback
- Six-character initial roster
- Lightweight projectile, trap, armor, and multi-hit attack support
- Image-based attack effects for slashes, shots, traps, armor, and combo hits
- Stage select with a platform kitchen stage and a Final Destination style dark cutting board stage
- Anthropomorphic fruit character motion frames and portraits

## Docs

- [Character and visual design](docs/character-design.md)
- [Screen flow and menus](docs/screen-flow.md)

## Build and Deploy

```bash
bun run build
bun run deploy
```

`deploy` publishes `dist` to the `gh-pages` branch.
