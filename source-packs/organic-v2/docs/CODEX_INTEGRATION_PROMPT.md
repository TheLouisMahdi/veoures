# Codex integration instructions (paste into Codex)

Project: https://github.com/TheLouisMahdi/veoures
Unzip the asset pack into a NEW directory under the repository (suggest `assets/veoures-v2/`) without deleting original media or overwriting existing source files.

Goal: preserve the current dark, floating, organic Canvas 2D creature. Replace three user-facing mutation tools with Grow Limb, Grow Eye, Feed Mass and use the new asset pack as optional visual material.

Inspect existing `script.js`, `components/toolbar.js`, `components/contribution-modal.js`, `engine/mutation-engine.js`, `engine/life-engine.js`, `engine/renderer.js`, `engine/sync-engine.js`, `hosting/worker.js`, and tests before changing code.

Implementation rules:
1. The geometry remains procedural. DO NOT paste raster organism references over the existing canvas. The `references/` folder is art direction only.
2. Integrate icons under `assets/ui/icons/grow-limb`, `grow-eye`, and `feed-mass`; use SVG for toolbar, and honor hover/selected states.
3. Grow Limb: keep existing type `add_limb` where possible; attach to computed current body boundary, rotated along the outward local normal. Use transparent limb assets only for detail or transient growth. Root pivot = 50% width, 91.8% height of source.
4. Grow Eye: add validated event type `grow_eye` to the canonical reducer, browser tool, and shared Worker. Persist normalized center, radius, orientation, variant/seed. Eyes emerge from within existing skin, blink, and subtly follow pointer input. Visual eye variants are in `assets/eyes` with 4 stages and PNG strips. Do not treat any filename or user string as an arbitrary fetch path.
5. Feed Mass: continue current `feed_mass` event. Change local silhouette using spatially smooth deformation centered on the accepted point. Composite material maps and mass sprites clipped into the same anatomical transform; do not render an unattached orb.
6. Maintain a bounded local tissue memory for compound nearby contributions (limb + limb branching, eye + limb nerve tissue, eye + mass eyelid tissue, mass + limb thickening). Derive state from event log with deterministic, seedable rules.
7. Validate attachment placement to the actual body region before confirmation; reject empty-space commits without using quota, on both client and server for deterministic anatomy rules where feasible.
8. Fix renderer resource cleanup and preserve touch preview during navigation gestures; add focused browser and reducer tests.
9. Preserve legacy mutation replay and persistent D1 event history; no data reset. Preserve 4 daily changes, 414 milestone editions, offline handling, keyboard/touch accessibility, reduced motion, portrait export.
10. Avoid big dependencies, frameworks, new scene engines, and mass changes to UI. Maintain performance target 30 FPS mobile / 45 FPS desktop.
11. Provide brief changed-files and test report. Do not deploy without explicit permission.

Asset loading: lazy-load only selected organ variants, compressed textures as needed. All assets' paths, pivots, and categories are documented by `manifest.json` and `docs/ASSET_USAGE_MAP.json`.
