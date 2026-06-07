# Sakura vs. The Infection 🌸

A self-contained, single-file browser game. Play as **Hana**, a cute anime
magical girl, as a green infection corrupts Sakura Town. Fight your way through
the infected monsters, track the spreading corruption to its origin, and defeat
**The Source** — the giant monster-mother of the infection.

## Play

Just open `index.html` in any modern browser. No build step, no dependencies.

```bash
# from this folder
xdg-open index.html      # Linux
open index.html          # macOS
# or drag the file into a browser tab
```

## Controls

| Action | Keys |
| ------ | ---- |
| Move   | `WASD` / Arrow keys |
| Aim    | Mouse |
| Shoot magic | Left click / `Space` |
| Dash (brief invuln) | `Shift` |
| Confirm / start | Click / `Space` / `Enter` |

## The quest

1. **The Outskirts** — clear waves of infected slimes and wisps.
2. **The Sick Forest** — the corruption thickens; tougher brutes appear.
3. **The Hollow Core** — survive the final waves, then confront **The Source**,
   a multi-eyed infection-mother with spore barrages and minion summons. Beat its
   three rage phases to cleanse the town.

## How it's built

Everything is drawn procedurally on an HTML5 `<canvas>` (the heroine, monsters,
and boss are all canvas paths — no image assets), sound effects are generated
with the WebAudio API, and the whole game lives in one `index.html` file.
