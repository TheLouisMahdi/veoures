# Autonomous organism and collection update

## Visitor review and resulting behaviour

The previous first screen read as a website around a stationary specimen: large editorial heading, persistent composer, fixed shape and a midnight quota. The new first view is Observe: a larger creature alone in a dark habitat, with quiet instruments and no open composer. Tool controls open on demand. Mobile drawing starts with collapsed controls so the surface remains reachable.

The creature drifts and rotates independently, breathes, grows/retracts tapered black tendrils, branches, ripples, circulates small nerve pulses and sheds vesicles. Thirteen behaviour families blend over five seconds: drifting, unfurling, listening, coiling, blooming, shivering, resting, searching, stretching, shedding, spiralling, contracting and awakening. These change actual curl/reach/stretch/activity, not just a label. Continuous seeded noise avoids a short repeating animation. Idle life never creates persisted events or consumes quota.

Accepted mutations update a persistent genome, yielding distinct anatomy, reach, branching, skin folds, pace and hue. The old four-hour surface decay remains; anatomical memory persists. No public data is deleted, no migration resets the database, and original media/licensing remain untouched.

## Participation and collection

- Four accepted changes per personal 24-hour day. A private random session identity selects a stable random daily opening; reload and retry cannot move it. The server returns next opening and remaining quota. This means a random assigned time for each visitor, not a newly rerolled time on every refresh or a simultaneous midnight reset.
- Optional 1–32-character public display name, including Persian. Validation strips no identity into HTML; archive uses textContent. Names do not affect the genome and are not verified identities.
- Every 414 accepted changes records an edition descriptor (genome, version, accepted time and unique named credits). Next mutations continue shaping another form. No application lifetime event cap remains.
- Inspector exports the accepted form as a 1600×1600 PNG, with an independent JSON credit/traits record. Historical edition portraits replay exactly through their milestone; current studies omit previews. Export uses a fixed reduced-motion pose and timestamp. No minting, marketplace or ownership-transfer system is claimed.
- Root README is entirely a visitor guide: playing, observing, daily openings, credits, and the digital-art collection goal. Developer commands moved to DEVELOPMENT.md.

## Verification actually completed

- All 26 JS/CJS/MJS source files passed syntax checks.
- 10,000 legacy events replay identically; 828 successive current changes produce 828 distinct anatomy descriptors and editions at 414/828. Name validation, independent author/geometry, four-hour age and autonomous pose/tendril changes pass.
- The real Worker/SQLite test accepts 414 mutations through HTTP-style fetch requests, validates a first collection milestone, then accepts mutation 415. Two clients/connections replay the same state. Four-change limit, random personal openings, reset exactly at the next boundary, secure cookie authorization, idempotency/concurrent retry, malformed/oversized requests, public names, private fields and Origin checks pass.
- The Node/JSON fallback passes replay, persistent restart, malformed input, Windows path privacy and the new four-change rule.
- Chrome browser suite at 320/390/768/1440/1920: no horizontal overflow; actual 44px buttons; all three tools preview/cancel/commit/reload; Persian authors/words; zoom/pan; mouse/keyboard/touch/pinch; default Observe; offline lock/recovery; same shared state; quiet initial history; reduced-motion RAF=0; audio opt-in/off; hidden-tab suspension. Console errors and failed HTTP responses: zero.
- Browser creates a real 414-change local milestone, downloads a 1600px portrait and JSON containing the correct version and named credits. Both artifacts were inspected.
- Chrome 4× CPU emulation at 390px with 24 mixed changes and eight active reactions: 62 draws in 2.5 seconds, p95 draw 14.7ms, maximum 15.5ms, DPR 1.5. This is emulation, not physical Android testing.
- 53 root/original media URLs resolve in both static and Worker modes; asset hashes and static privacy allowlist pass. Managed and GitHub Worker bytes match.

[Browser results](life-update/browser-results.json), [desktop habitat](life-update/viewport-1440.png), [mobile habitat](life-update/viewport-390.png), [first-form portrait](life-update/form-001.png), [credits](life-update/form-001-credits.json), [collection UI](life-update/collection-414.png).

## Practical limits

Visual variation continues without a predetermined sequence or lifetime change ceiling. This is not a claim of infinite physical storage: the durable event log grows, and initial replay/export cost grows with it. Rendering keeps bounded active tissue arrays and caps desktop/mobile tendrils at 44/28, transient reactions at eight, and DPR/frame rate. Individual surface marks remain bounded as documented in TRACE_UPDATE.md. Anonymous participation remains session-based; shared network abuse ceilings still apply. Future large-scale operation should add snapshot/paged replay before very large logs.

## Domain

No custom domain is attached. Sites supports custom hostnames but requires an owned hostname and DNS validation. Changing a site slug cannot remove the host provider’s parent domain. No domain was purchased, invented as owned, or presented as already connected. The existing shared service remains live while the custom hostname is pending user input.

## Files changed

README.md; index.html; style.css; script.js; privacy.html; data/ui-copy.json; components/archive-panel.js; components/status-panel.js; engine/mutation-engine.js; engine/life-engine.js (new); engine/renderer.js; engine/sync-engine.js; hosting/worker.js; hosting/tests.mjs; server/server.js; server/vendor-mutation-engine.js; tests/browser-check.cjs; tests/reducer-check.cjs; tests/server-smoke.cjs; tests/publication-check.cjs; docs/DEVELOPMENT.md (new); docs/LIVING_UPDATE.md (new); docs/life-update/*; supersession notices in docs/ARCHITECTURE.md, docs/VERIFICATION.md and docs/TRACE_UPDATE.md.
