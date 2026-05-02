# Smabura

A browser-based 2D platform fighter prototype built with Vite, TypeScript, and Phaser.

## Run

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:5173/`.

## Controls

- `A` / `D`: move
- `W`: jump / double jump
- `J`: quick attack
- `K`: heavy attack
- `L`: dodge
- `R`: restart

## Current Scope

- Bun-based build and deployment scripts
- 1P vs CPU
- 3-stock match
- Damage-scaled knockback
- Generated kitchen stage with collision aligned to the cutting board and plates
- Optimized WebP anthropomorphic fruit character motion frames

## Build and Deploy

```bash
bun run build
bun run deploy
```

`deploy` publishes `dist` to the `gh-pages` branch. GitHub Pages must be enabled for that branch; private repositories require an eligible GitHub plan.
