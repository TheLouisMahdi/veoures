> Current Biological Evolution V3 details and validation: [BIOLOGICAL_V3.md](BIOLOGICAL_V3.md). Earlier implementation notes below are retained as history.

# Exact added files and corrections

This inventory records the initial integration into the new `veoures/` sibling project. No existing source project file or supplied pack was overwritten, moved or deleted. All 189 original source files were verified unchanged against the initial SHA-256 snapshot. Private runtime data remains outside the public roots. Subsequent branding and publication changes are recorded in [PUBLICATION.md](PUBLICATION.md).

## Corrections to integration baseline

- Replaced the pack-05 boxed demo presentation with a full-screen procedural stage and collapsible composer; adapted all root-relative file usage to preserve static project subpaths.
- Replaced the illustrative renderer with anatomy drawn from canonical mutation state. Seeded letters/words are raised tissue, not painted text; growth, breathing, healing and scars animate. Resetting Canvas stroke state fixes subtle preview/cancel image drift.
- Pack-05 geometry jitter originally depended on the accepted event ID; the server generates a different ID than a preview. It now depends on the normalized tool payload so previews are faithful. The same corrected reducer is used in browser and server fallback. Unicode single-letter validation permits letter graphemes rather than assuming ASCII.
- Blank contribution text no longer silently substitutes default values; blank limb direction no longer becomes numeric zero. Validation, cancellation, explicit commit and quota feedback are wired to real state.
- Reworked synchronization so a failed API/network call cannot silently become a local demo. Mode is positively identified, known shared origins stay locked on outages, concurrent polling is coordinated, missing sequences are replayed, and request IDs make retries idempotent. Owner-only acknowledgment recovery handles a lost fifth-commit response.
- Pack-06 storage default could live under the public directory. Storage now resolves outside the real public root (including Windows junctions), refuses internal placement and atomically saves before acknowledging acceptance. Static serving denies private implementation/test/dot files, Windows separator aliases and escaped real paths. Oversized request bodies return 413 without destroying the socket; malformed inputs and ordering are tested.
- Original audio behavior did not comprehensively stop all active effect voices. One bounded manager now owns ambience and effects, defers all media construction until opt-in, pauses on off/hidden and guards pending playback against toggle races.
- Added genuine status/recent trace inspection, accessible native dialogs, keyboard placement, touch input, mobile tool scrolling, reduced-motion idle suspension, DPR/fps caps and high-contrast styles.
- Preserved supplied media filenames and provenance notes. The pack-02 exploration board is excluded from public files; manifest keeps its provenance under `excludedAssets`. No fallback project media/content or external fonts/libraries were imported.
- Updated the supplied server smoke fixture to separate public and private test directories, including restart; expanded coverage for malformed/oversized requests, idempotency, concurrent writers and path aliases. Tests found real Canvas/Windows-path/reconnection defects during integration, and those were corrected before the successful final run.

## Added file inventory

88 files in the new directory. “Copied unchanged” means byte-for-byte equality with the stated input at verification.

| Path relative to veoures/ | Change | Origin |
| --- | --- | --- |
| `README.md` | New | Implementation, verification or documentation |
| `asset-manifest.json` | Adapted / corrected | pack 02: `asset-manifest.json` |
| `assets/favicon.svg` | Copied unchanged | pack 02: `assets/favicon.svg` |
| `audio/ambient-awakened.mp3` | Copied unchanged | pack 03: `audio/ambient-awakened.mp3` |
| `audio/ambient-base.mp3` | Copied unchanged | pack 03: `audio/ambient-base.mp3` |
| `audio/ambient-dormant.mp3` | Copied unchanged | pack 03: `audio/ambient-dormant.mp3` |
| `audio/ambient-pulse.mp3` | Copied unchanged | pack 03: `audio/ambient-pulse.mp3` |
| `audio/archive-open.mp3` | Copied unchanged | pack 03: `audio/archive-open.mp3` |
| `audio/error-soft.mp3` | Copied unchanged | pack 03: `audio/error-soft.mp3` |
| `audio/tool-add-limb.mp3` | Copied unchanged | pack 03: `audio/tool-add-limb.mp3` |
| `audio/tool-corrupt.mp3` | Copied unchanged | pack 03: `audio/tool-corrupt.mp3` |
| `audio/tool-draw-scar.mp3` | Copied unchanged | pack 03: `audio/tool-draw-scar.mp3` |
| `audio/tool-feed-mass.mp3` | Copied unchanged | pack 03: `audio/tool-feed-mass.mp3` |
| `audio/tool-feed-word.mp3` | Copied unchanged | pack 03: `audio/tool-feed-word.mp3` |
| `audio/tool-heal.mp3` | Copied unchanged | pack 03: `audio/tool-heal.mp3` |
| `audio/tool-seed-letter.mp3` | Copied unchanged | pack 03: `audio/tool-seed-letter.mp3` |
| `audio/ui-confirm-mutation.mp3` | Copied unchanged | pack 03: `audio/ui-confirm-mutation.mp3` |
| `audio/ui-hover-soft.mp3` | Copied unchanged | pack 03: `audio/ui-hover-soft.mp3` |
| `components/archive-panel.js` | Adapted / corrected | pack 05: `components/archive-panel.js` |
| `components/contribution-modal.js` | Adapted / corrected | pack 05: `components/contribution-modal.js` |
| `components/onboarding.js` | Adapted / corrected | pack 05: `components/onboarding.js` |
| `components/status-panel.js` | Adapted / corrected | pack 05: `components/status-panel.js` |
| `components/toolbar.js` | Adapted / corrected | pack 05: `components/toolbar.js` |
| `data/letter-forms.json` | Copied unchanged | pack 04: `data/letter-forms.json` |
| `data/mutation-rules.json` | Copied unchanged | pack 04: `data/mutation-rules.json` |
| `data/organism-seed.json` | Copied unchanged | pack 04: `data/organism-seed.json` |
| `data/tool-limits.json` | Copied unchanged | pack 04: `data/tool-limits.json` |
| `data/ui-copy.json` | Copied unchanged | pack 07: `data/ui-copy.json` |
| `data/word-moods.json` | Copied unchanged | pack 04: `data/word-moods.json` |
| `docs/ARCHITECTURE.md` | New | Implementation, verification or documentation |
| `docs/CHANGED_FILES.md` | New | Implementation, verification or documentation |
| `docs/CREDITS.md` | New | Implementation, verification or documentation |
| `docs/VERIFICATION.md` | New | Implementation, verification or documentation |
| `docs/browser-results.json` | New | Implementation, verification or documentation |
| `docs/provenance/VEOURES_AUDIO_BEHAVIOR.md` | Copied unchanged | pack 03: `docs/VEOURES_AUDIO_BEHAVIOR.md` |
| `docs/provenance/VEOURES_VISUAL_STYLE_GUIDE.md` | Copied unchanged | pack 02: `docs/VEOURES_VISUAL_STYLE_GUIDE.md` |
| `docs/screenshots/shared-mutated-1440.png` | New | Implementation, verification or documentation |
| `docs/screenshots/viewport-1440.png` | New | Implementation, verification or documentation |
| `docs/screenshots/viewport-1920.png` | New | Implementation, verification or documentation |
| `docs/screenshots/viewport-320.png` | New | Implementation, verification or documentation |
| `docs/screenshots/viewport-390.png` | New | Implementation, verification or documentation |
| `docs/screenshots/viewport-768.png` | New | Implementation, verification or documentation |
| `engine/audio-engine.js` | Adapted / corrected | pack 05: `engine/audio-engine.js` |
| `engine/mutation-engine.js` | Adapted / corrected | pack 05: `engine/mutation-engine.js` |
| `engine/organism-engine.js` | Adapted / corrected | pack 05: `engine/organism-engine.js` |
| `engine/renderer.js` | Adapted / corrected | pack 05: `engine/renderer.js` |
| `engine/sync-engine.js` | Adapted / corrected | pack 05: `engine/sync-engine.js` |
| `images/overlays/droplet-overlay.png` | Copied unchanged | pack 02: `images/overlays/droplet-overlay.png` |
| `images/overlays/pulse-glow.png` | Copied unchanged | pack 02: `images/overlays/pulse-glow.png` |
| `images/overlays/red-haze.png` | Copied unchanged | pack 02: `images/overlays/red-haze.png` |
| `images/overlays/scar-overlay.png` | Copied unchanged | pack 02: `images/overlays/scar-overlay.png` |
| `images/overlays/smoke-overlay.png` | Copied unchanged | pack 02: `images/overlays/smoke-overlay.png` |
| `images/states/awakened.webp` | Copied unchanged | pack 02: `images/states/awakened.webp` |
| `images/states/corrupted.webp` | Copied unchanged | pack 02: `images/states/corrupted.webp` |
| `images/states/dormant.webp` | Copied unchanged | pack 02: `images/states/dormant.webp` |
| `images/states/grown.webp` | Copied unchanged | pack 02: `images/states/grown.webp` |
| `images/states/healed.webp` | Copied unchanged | pack 02: `images/states/healed.webp` |
| `images/states/high-pulse.webp` | Copied unchanged | pack 02: `images/states/high-pulse.webp` |
| `images/states/overgrown.webp` | Copied unchanged | pack 02: `images/states/overgrown.webp` |
| `images/states/seed.webp` | Copied unchanged | pack 02: `images/states/seed.webp` |
| `images/states/wounded.webp` | Copied unchanged | pack 02: `images/states/wounded.webp` |
| `images/states/young.webp` | Copied unchanged | pack 02: `images/states/young.webp` |
| `images/textures/black-organic-skin.webp` | Copied unchanged | pack 02: `images/textures/black-organic-skin.webp` |
| `images/textures/crimson-veins.webp` | Copied unchanged | pack 02: `images/textures/crimson-veins.webp` |
| `images/textures/displacement-map.webp` | Copied unchanged | pack 02: `images/textures/displacement-map.webp` |
| `images/textures/glossy-noise.webp` | Copied unchanged | pack 02: `images/textures/glossy-noise.webp` |
| `images/textures/liquid-membrane.webp` | Copied unchanged | pack 02: `images/textures/liquid-membrane.webp` |
| `images/textures/pulse-map.webp` | Copied unchanged | pack 02: `images/textures/pulse-map.webp` |
| `images/textures/tendril-texture.webp` | Copied unchanged | pack 02: `images/textures/tendril-texture.webp` |
| `images/ui/logo-lockup.svg` | Copied unchanged | pack 02: `images/ui/logo-lockup.svg` |
| `images/ui/panel-frame.svg` | Copied unchanged | pack 02: `images/ui/panel-frame.svg` |
| `images/ui/tool-corrupt.svg` | Copied unchanged | pack 02: `images/ui/tool-corrupt.svg` |
| `images/ui/tool-draw.svg` | Copied unchanged | pack 02: `images/ui/tool-draw.svg` |
| `images/ui/tool-heal.svg` | Copied unchanged | pack 02: `images/ui/tool-heal.svg` |
| `images/ui/tool-letter.svg` | Copied unchanged | pack 02: `images/ui/tool-letter.svg` |
| `images/ui/tool-limb.svg` | Copied unchanged | pack 02: `images/ui/tool-limb.svg` |
| `images/ui/tool-mass.svg` | Copied unchanged | pack 02: `images/ui/tool-mass.svg` |
| `images/ui/tool-word.svg` | Copied unchanged | pack 02: `images/ui/tool-word.svg` |
| `images/ui/wordmark.svg` | Copied unchanged | pack 02: `images/ui/wordmark.svg` |
| `index.html` | Adapted / corrected | pack 05: `demo/index.html` |
| `script.js` | Adapted / corrected | pack 05: `demo/app.js` |
| `server/server.js` | Adapted / corrected | pack 06: `server/server.js` |
| `server/vendor-mutation-engine.js` | Adapted / corrected | pack 06: `server/vendor-mutation-engine.js` |
| `style.css` | Adapted / corrected | pack 05: `demo/style.css` |
| `tests/asset-check.cjs` | New | Implementation, verification or documentation |
| `tests/browser-check.cjs` | New | Implementation, verification or documentation |
| `tests/reducer-check.cjs` | New | Implementation, verification or documentation |
| `tests/server-smoke.cjs` | Adapted / corrected | pack 06: `tests/server-smoke.cjs` |
