# ¢ni Neon Climb — v2.0.0 "SPIRE"

Complete AAA-polish rewrite. Single-file `index.html`, self-contained, GitHub-Pages-ready (`docs/`), no external dependencies beyond Google Fonts (cached offline by the service worker after first load).

---

## Architecture

- **Full rewrite into clean modules** inside one file: `Save`, `Audio2`, `Views`, `Particles/Confetti/Juice`, `Sprites`, `Input`, `Game`, `Loop`, `Renderer`, `UI`, `Achieve`, `Shops`, `Proof`, `SettingsUI`, `App`. The v1 codebase (20+ overlapping script tags, duplicated handlers, syntax errors) is retired.
- **Fixed 60 Hz timestep** with accumulator loop and spiral-of-death guard; rendering decoupled at display refresh.
- **Dedicated seeded RNG** (`mulberry32` behind an `RNG` object). v1's global `Math.random` patching is gone.
- **Object pooling** for particles (340) with live-count tracking; entity arrays hard-capped.

## Screens & flow

- ViewManager screen stack with neon glitch transitions: **Boot → Title → Hub → Game → Pause → Recap**, plus hub sub-views **Cosmetics Atelier, Yarn Emporium, Fishbone Forge, Achievements Codex, Proof Archive, Settings Lab**.
- Boot screen with real sprite-preload progress. Title has an **attract mode**: after 25 s idle the game plays itself; any input takes over.
- Recap screen with count-up stats, NEW BEST celebration + confetti, replay / proof / share actions.

## Controls

- **Native mobile touch**: hold left/right screen edges to move (with visible zone glow), drag in the middle for analog steering, tap = jump, double-tap = dash, 300 ms hold = laser, 6-slot 46–50 px ability bar for consumables. First-run onboarding hint.
- **Gamepad API** with hot-plug: stick/d-pad move, A/B jump, RB/Y dash, X/RT laser, LB quick-slot 1, Start pause. Toggle in Settings.
- Keyboard unchanged (arrows/WASD, Space, Shift, E, 1–6, P/Esc).

## Determinism & replays

- All effect timers now run on **game time**, not wall clock; pauses and hitstop no longer eat power-up durations.
- Input is recorded as a normalized event stream (`ax`, `hold`, `jump`, `dash`, `laser`, `use`) sampled **inside the fixed tick** with quantized analog values, so replays are **bit-identical** (verified by automated tests comparing full score/height trajectories).
- Consumable activations are part of the event stream and replay correctly without touching your stock.
- Replay player with 0.5×/1×/2× speed, restart, exit, and a watchdog that ends stalled replays 10 s after the final event.
- v1 replays (legacy `kd`/`ku` key events) still load and play; because v1's physics ran on wall-clock time they are not guaranteed frame-identical, but their **proof hashes still verify** (hashing covers `{seed, events}`, which is unchanged).

## Proof system

- **Format preserved**: PNG `tEXt` chunk `CNI-PROOF` containing base64 of `{code, hash, meta, run}` with `hash = SHA-256(stableStringify(run))` — old proofs verify in v2 and vice versa.
- Redesigned proof card (neon frame, big height, code, full hash, build id) rendered over a screenshot of your death moment.
- **Proof Archive**: last 12 proofs stored in the save, each with a **Submit to CNI** action that exports the on-chain submission payload as JSON (and logs it) — ready for the future Cat Network Index endpoint.
- Verifier accepts drag-drop, file picker, or clipboard paste; animated scanline while checking; a valid proof unlocks **Watch verified run** which replays it live.

## Progression & content

- **24 achievements** (height/points/combo/lifetime tiers + skill-based one-offs), each with 🧶/🐟 rewards, live progress bars, in-run toasts and a full-screen celebration with confetti in menus.
- All 8 skins with their v1 passives/actives intact (Lucky Paws, Feather Fall, Dash, Star Magnet, Beam, Phase, Facet Shield, Ascend), now with a mannequin preview, equip animation, and on-HUD skill card with cooldown/charge bar.
- New **perfect quick-hop** micro-skill: landing 40–200 ms after a jump grants +15 pts × multiplier and +1 combo.

## Juice & presentation

- Hitstop, screenshake, squash & stretch, landing dust, speed lines, combo pop, floating score text, parallax starfield + two-layer neon city, hazard telegraphs (420 ms warning arrows), CRT scanlines + vignette (toggleable), colorblind hazard palette, Low-VFX mode.
- **Reactive layered music**: scheduled Web-Audio synthwave (bass/kick/hats/arp/pads) whose layers follow combo and altitude; pitch-varied SFX; per-category volume sliders; auto mute-and-pause when the tab hides.

## Saves & data

- New versioned save (`cniSave_v2`) with **automatic migration** from v1 (`cniGameData_allin`, `cniSettings`, latest `cniMonthlyBest_*` → best-run replay). The multi-megabyte `cniCustomSprites` blob is purged.
- Export/import save as JSON; guarded full reset.
- Dev mode (Settings): god mode (G), debug overlay (O), spawn hazard (H), +currency (K), fast cooldowns; achievements are locked out while dev mode is on.

## PWA

- `sw.js` v6: network-first app shell, cache-first assets, old caches purged on activate.
- Proper `manifest.webmanifest` (fullscreen, portrait, theme `#0a0015`, maskable icon) and a real 512×512 icon replacing the 1×1 placeholder.

---

## Balance notes

| Change | v1 | v2 | Why |
|---|---|---|---|
| Magnet Surge | 420 🧶 / run-start only | **350 🧶, 30 s, activate any time (key 1)** | Consumables became tactical mid-run tools; starters were routinely wasted on easy early meters. Prices dropped where flexibility was the buff's real value. |
| Double Points | 630 🧶 | **550 🧶, 30 s (key 2)** | Same activation rework; slight discount keeps it the "value" multiplier vs Triple. |
| Triple Points | 800 🧶, 15 s | **750 🧶, 15 s (key 3)** | Still stacks with Double (×6) — the timing skill of firing both at a high combo is the payoff. |
| Shield | 350 🧶 start shield | **300 🧶, +2.5 s invuln on demand (key 4)** | On-demand panic button; slightly shorter uptime than the passive Forge start-shield path so the two don't cannibalize each other. |
| Slow-Mo → Spawn Freeze | 450 🧶 | **400 🧶, 7 s spawn pause (key 5)** | Renamed to what it actually did in v1 (a spawn freeze) and priced as breathing room, not damage prevention. |
| **NEW: Screen Purge** | — | **500 🧶, instant hazard wipe (key 6)** | Fills the "I'm surrounded" niche the rare bomb powerup teased; deliberately pricier per use than Freeze because it also cashes out combo safety. |
| Nine Lives | 1200 🧶 auto-revive | **unchanged** | Already correctly priced as ~2 skins of insurance; now clears the screen and grants 3 s invuln on trigger so the revive isn't an instant re-death. |
| **NEW Forge: Combo Keeper** | — | **max 4, 800×2^lvl 🐟, +0.5 s combo window/level** | Combo is the biggest hidden multiplier (+3 %/stack); a fish sink that rewards flow play and gives late-game whales a 10th meaningful purchase. |
| Forge: others | — | Costs/curves unchanged (Magnet 600×2^l, Points 900×1.75^l, Shield 750×2^l, Legs 450×1.8^l, Bounty 900×2^l) | v1's curves were fine; only presentation (live "current → next" preview, level dots) changed. |
| Achievement rewards | none | **60–1000 🧶 / 0–50 🐟 per unlock, tier-scaled** | Injects ~4–5 k 🧶 across a natural first-week arc — roughly one mid skin — without touching run economy. |
| Hazard director | interval `max(900, 2100−0.20·m)·0.99`, density 0.35→2.25 | **unchanged**, plus 420 ms spawn telegraphs | Deaths should feel earned; telegraphs remove "spawned inside me" frustration without lowering difficulty. |
| Points formula | `m·base·(1+combo·0.03)·(1+m/5000)·pickupMult(≤6.9)` | **unchanged** + perfect-hop bonus | Score continuity matters for old proofs/leaderboards; perfect hops add skill expression worth <3 % for average players. |
| Exchange rates | 1→10, 9→100, 80→1000 | **unchanged** | The bulk-discount ladder is a good fish sink as-is. |

**Replay compatibility meaning:** v2 verifies every old proof's hash and can play old event streams, but because v1 simulated on wall-clock frames, an old replay may not reproduce the exact original outcome frame-for-frame. All v2 proofs are fully deterministic end-to-end.
