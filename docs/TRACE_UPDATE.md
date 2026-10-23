# Living traces update

The public interface now offers Draw Scar, Feed Mass and Write Trace. Former tools are removed from the toolbar and composer; historical events remain replayable. No production data or schema is reset. Existing asset provenance and audio remain unchanged.

## Behaviour

- Draw Scar: smoothed preview; after an accepted commit, 3–6 tapered black threads pull the wet line beneath the skin over roughly 2.8 seconds. A dark branching ridge remains. Thickness decreases as it ages.
- Feed Mass: 3–5 glossy droplets and connecting strands merge over about 2.6 seconds. Body volume follows accepted, age-adjusted mass.
- Write Trace: 1–80 NFC Unicode characters, including Persian. Text settles into a small corner attached to the body; Read traces focuses the camera. Zoom 1×–8×, pan, wheel, pinch and keyboard +/−/0. Inspector provides a readable DOM alternative.
- Traces visually dissolve over four hours from their accepted timestamp. At two hours approximately 39% of the trace remains. History is retained publicly; fading is not deletion. New responses synchronize the presentation clock to server time. No timer job or database migration is needed.
- Initial history and reload are quiet. New accepted local/remote events react once; previews, failures and polling do not create success effects. At most eight transient reactions run together. Old catch-up events are quiet after 20 seconds.
- Pointer proximity pulls four short black strands from the body. It spends no quota, is suppressed during preview/navigation, and is disabled for touch and reduced motion.

## Limits

The live text geometry retains the latest 24 written traces, the inspector the latest 30 contributions, and the public event API the full bounded event log. Several columns of tiny writing may require panning. User-provided writing is public; no HTML is rendered. Legacy mutation types are still accepted for API compatibility, but have no interface controls. Audio remains off on every visit. No new packages, fonts, art or audio are introduced.

## Verification

Results and screenshots are recorded after validation below. Four-hour ageing is tested with a controlled presentation clock, not a four-hour wall-clock wait. CPU throttling is browser emulation, not a physical Android test.


Completed checks:

- Syntax: all 25 JS/CJS/MJS source/test files parse.
- Reducer: 10,000-event deterministic legacy replay, preview agreement, 0/2/4-hour decay, Persian text and malformed-text validation.
- Node adapter: legacy compatibility, two contributors, restart persistence, five/day limit, malformed/oversized requests and path privacy.
- Worker: all new tool payloads plus compatibility tools, SQLite persistence, separate clients/connections, atomic retries, quotas, secure cookies, Origin enforcement, input bounds and audio range responses. Managed deployment artifact passes ESM validation.
- Browser: 320/390/768/1440/1920px, 44px targets, no overflow, all three tools, preview/cancel/commit/reload, quota, keyboard, touch drawing/pinch, camera coordinate inversion, two-client identical state, quiet reload/polling, offline lock/recovery, sound opt-in/off and hidden-tab suspension. No console errors or HTTP failures in the completed suite.
- 4× CPU throttling at 390px, 24 seeded mixed mutations with the maximum eight active reactions: 64 draws in 2.5 seconds, p95 9.7ms, maximum 10.9ms; DPR 1.5. This is Chrome emulation, not physical Android testing.
- All 53 original media/root URLs resolve on both static and Worker servers, original visual hashes match, and static packaging excludes runtime/private files.
- Original venom fallback: all 189 saved hashes unchanged.

[Machine-readable browser results](trace-update/browser-results.json). Inspected screenshots: [absorption](trace-update/scar-absorption.png), [mobile writing zoom](trace-update/text-zoom-390.png), [mobile resting view](trace-update/viewport-390.png).

Corrections found during QA: mobile text focus initially clipped the right edge; the camera now provides a 24px left margin. A later desktop toolbar width rule accidentally narrowed the mobile rail; its scope is now desktop-only. Touch-emulation checks include a short gesture-settling interval after pinch. Transient animation entries are pruned after 3.2 seconds.

## Changed files

- Browser: `index.html`, `style.css`, `script.js`, `privacy.html`, `data/ui-copy.json`.
- Geometry/rendering/sync: `engine/mutation-engine.js`, `engine/organism-engine.js`, `engine/renderer.js`, `engine/sync-engine.js`.
- Controls/inspection: `components/toolbar.js`, `components/contribution-modal.js`, `components/status-panel.js`, `components/archive-panel.js`.
- Runtime: `hosting/worker.js`, `server/server.js`, `server/vendor-mutation-engine.js`.
- Verification: `hosting/tests.mjs`, `tests/reducer-check.cjs`, `tests/browser-check.cjs`, `tests/preview-worker.mjs`, `docs/trace-update/*`.
- Documentation: `README.md`, `docs/ARCHITECTURE.md`, `docs/VERIFICATION.md`, `docs/TRACE_UPDATE.md`.

The managed Sites checkout mirrors the browser sources and Worker, with matching build output. It preserves the same database, schema migrations, audience and public URL.
