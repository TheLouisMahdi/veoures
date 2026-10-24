# VEOURES Organic Assets v2

Designed for the existing VEOURES procedural Canvas 2D organism. Preserve the current dark, restrained, semi-translucent crimson aesthetic and original runtime.

Folders: `assets/eyes` (12 eyes x 4 states + 12 strips), `assets/limbs` (30), `assets/mass` (24), `assets/fx` (36), `assets/seams` (12), `assets/ui/icons` (29 icons x 3 visual states), `assets/material-maps` (32), `assets/atmosphere` (10), `references` (1 original concept art board + 13 reference crops), and `previews` (8 index sheets). All organ, icon, and FX SVG/PNG exports are transparent. Reference crops are *not* transparent runtime sprites.

Art integration rules:
- Keep the organism procedural; images enhance detail and interaction, not replace the body.
- Attach organs to the deformed body surface in organism-local coordinates; update transforms each frame.
- Limb pivot: normalized [0.5, 0.918]; eye/mass pivot: [0.5,0.5].
- Render new organs within the same scene transform as the core and use socket seam/blend overlays where useful.
- Never spend quota for an invalid placement. Keep persisted mutations deterministic and replayable.
- Fade initial growth visuals into persistent structural evolution. Do not delete lifetime event records.
- Load only used resources; prefer vector icons and low-alpha material overlays.
- Retain backwards compatibility with scar/text events in historical data, even when removed from current tools.
- This is an asset package, not a code patch, and does not change the live website.

See `docs/CODEX_INTEGRATION_PROMPT.md`, `docs/ASSET_USAGE_MAP.json`, `manifest.json`, and `previews/`.
