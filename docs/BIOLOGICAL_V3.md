> Updated by [Natural Life](NATURAL_LIFE.md): paired heartbeat audio, inertial movement, constrained tendrils and diffused feeding. Initial V3 measurements below are retained; the newer report gives current timing and build values.

# Biological Evolution V3 — 24 October 2026

The existing vanilla Canvas organism is extended in place. Its birth timestamp, accepted log, personal four-touch day, old surface traces and 414-change collection descriptors are preserved. The root README remains a visitor guide.

## Files and assets

The precise source delta is in [BIOLOGICAL_V3_FILES.json](BIOLOGICAL_V3_FILES.json). Main changes: `index.html`, `style.css`, `script.js`; geometry, registry, reducer, renderer, organism and sync engines; composer, toolbar, archive, status and evolution panels; both server adapters; additive migration/build; visitor/privacy/provenance documentation and verification.

All **563 supplied files / 14,783,018 original bytes** are preserved under `source-packs/organic-v2/`. Their paths, sizes and SHA-256 hashes are inventoried in `data/organic-inventory.json`. The supplied manifest counts 562 because it excludes itself; its prose says 29 icon families but its files contain 30. Neither discrepancy was silently copied into the inventory. `.gitattributes` preserves source bytes on checkout.

The runtime registry contains **282 files / 2,030,614 bytes**: 240 unchanged transparent SVGs and 42 optimized WebPs. There are **156 organic variants**: 12 eyes × four states (48 SVG files), 30 limbs, 24 mass forms, 36 FX, 12 seams, 32 material maps and 10 atmospheres; plus 30 icon families × three states (90 SVGs). All 282 runtime images successfully decode in Chromium. Eye maturity and blink states crossfade continuously. All variants are available through the registry; relevant variants are selected on demand, not all painted or fetched together. Current controls use relevant icons; unused icon families do not add unrelated features.

PNG alternatives, strips, 14 reference images, eight catalogs and documents remain archived. They are excluded from the public runtime allowlist. No reference board or static state image substitutes for live anatomy. The original 33 visual assets and additional brand card retain their hashes. Supplied provenance is retained in [CREDITS.md](CREDITS.md); no new license grant is invented.

## Anatomical behavior

`engine/body-geometry.js` is shared by browser and authoritative server reducer. Its 192-vertex deformed polygon is both the Canvas membrane path and the hit-testing boundary. Closest segments yield attachment positions, tangents and outward normals. Internal organs use contour-relative angular/radial anchors and render inside the same clipping path. Rotation, camera scale, fit and pan share the inverse pointer transform. External roots follow the actual moving polygon rather than a circle.

The only active tools are schema-3 **Grow Limb**, **Grow Eye**, **Feed Mass**. All old event types still replay. Preview/cancel never spend quota. The server recomputes placement, variant, duration and scores; client-supplied attachment/score metadata is not trusted. Invalid empty-space placements, crowded sockets and saturated recent tissue are rejected before the atomic accepted-event insert. A concurrent geometry change asks for a new preview.

Internal limbs appear as subdued fibres; external limbs extend along the local normal, branch and sway with independent seeded phases. Supplied limb art uses its documented root pivot (0.5, 0.918). Eyes develop embedded sockets, independent bud/opening/awake/blink states, gaze and nerve connections. Mass thickens existing tissue and creates a bounded continuous contour bulge, never a disconnected circle. Vein endpoints follow the contour. Material and seam overlays are restrained and clipped.

An 8×8 regional map remembers accepted activity, density, limbs, eyes, connections, first/last acceptance and structural influence. Local maturity is derived from organs and server time. Mass reinforces limb roots; eyes acquire connections to developed nearby tissue. Density, socket spacing and local limb limits prevent crowding. Saturated mass regions can be fed again after eight hours; accumulated swelling remains bounded by a smooth cap.

## Time, evolution and vital signs

- Mass matures over **8–24 hours**, eyes **24–48 hours**, limbs **36–72 hours**, deterministically chosen at acceptance. Initial attachment feedback lasts about 3.2 seconds. Organs then grow from accepted timestamps, including while the tab is closed.
- Five gradual stages combine elapsed time and accepted history: configured thresholds at 0/12/36/72/168 hours and 0/4/12/24/48 contributions. Stage names are Primordial, Cellular growth, Structural development, Sensory development and Complex organism. Membrane folds, tissue, fibres and sensory organs develop within one scene; there is no scene swap or creature reset.
- The healthy existing approximately **74 BPM** baseline remains. The Natural Life update uses gentle beat-to-beat timing variation around the existing baseline, a shared visual/audio phase and a contracting core. Mass changes apparent breathing and inertial load; it does not restart or abruptly accelerate the heart clock. Limb phases and eye blinks are independent. The pre-existing continuous mood/rest/drift system remains.
- Historical inspection rebuilds an event prefix and uses its selected timestamp for anatomy, maturity, materials and motion phases. It is read-only. Existing collection descriptors and legacy rendering methods are regression checked against the prior commit; legacy lifecycle cleanup is fixed without changing drawing methods. New forms record biological-renderer version 3. Portrait export waits for local assets and produces untainted 1600×1600 PNGs.
- Biological time never writes per-frame/per-second database updates. Only accepted contributions and explicit identity preferences write persistent data.

## Contributor identity and ranking

Public participation is opt-in. A server-generated public UUID is independent of the private secure cookie hash and optional unverified name. Same-name contributors remain distinct. Legacy name-only credits retain their original content and are excluded from rankings. Private session/network/recovery data never appears in public events or profiles.

An optional 256-bit recovery key is shown/downloaded once; only its SHA-256 hash is stored. Restoring it maps another secure session to the same contributor and **same quota key**. A replacement invalidates the old key. Without recovery, an expired/cleared 30-day cookie may lose access to the identity. It is anonymous artwork participation, not proof of a unique human.

Ranking supports all time / 24h / 7d and accepted total / impact / influence / recency, stable UUID tie-breaking, 20-row pagination, profile event history, regional/tool totals and collection milestones. Scores are computed once from accepted anatomical events:

`impact = 10 + round(min(40, estimated mature tissue area × 20000)) + min(8, 2 × regional connections)`

`influence = 1 + regional connections + min(4, floor(area × 1000))`

Area estimates use limb length, eye area or density-adjusted mass. These are transparent artistic heuristics, not physical/medical measurements. Rejected requests, previews, cancellation and idempotent retries earn nothing. Local mode has an explicitly labelled browser-only ranking. The Node JSON adapter provides the same tools/profile flow for development, but trusts browser tokens; the public Worker uses secure server-issued sessions.

## Migration and preservation

`hosting/drizzle/0000_veoures.sql` is unchanged. Additive `0001_biology.sql` adds contributors, contributor-session mappings, nullable event contributor/region and default-zero impact/influence scores, with indexes. Existing event IDs, versions, payload bytes, timestamps and quota ownership are not rewritten. Legacy rows stay unclaimed and unranked. The migration journal appends entry 1. No DROP, reset, migration-on-request or production test mutation is used.

The same Sites project, `DB` binding and public audience are retained. A native read-only pre-deployment inspection captured **12 existing production events** in session memory for post-migration comparison. Test writes run only against temporary local SQLite/JSON databases.

## Performance and loading

The deployment-ready Worker contains **360 allowlisted responses**, **5,628,792 raw bytes / 3,063,712 gzip bytes** at this verification point, below the enforced conservative 3 MiB compressed budget. The frontend remains vanilla HTML/CSS/JS and Canvas 2D. There is no runtime package installation or new library.

First-view browser checks fetch **30–31 organic resources**, primarily relevant icons and initial surface details, rather than all 282. Assets load only when selected/visible. SVG details rasterize once into bounded canvases; a 96-entry LRU bounds retained resources. Mobile detail budgets, 32 angular mass bins, capped DPR and an adaptive economy mode reduce expensive material overlays under sustained load. Economy mode changes drawing detail, never canonical geometry, timing or scores. It preserves the glossy procedural membrane and core movement. Full state remains available for inspection/export.

Idle rendering targets 45 FPS desktop / 30 mobile. Hidden tabs cancel RAF and stop audio. Reduced motion runs no idle RAF and uses quiet timestamp-driven updates. No MP3 loads before explicit sound opt-in. Existing local audio is retained. Renderer destruction removes media-query, visibility, resize, timer and registry subscriptions, including legacy portrait exporters.

The final Chromium mobile CPU-emulation sample, after a 1.5-second warm-up, measured **63 draws / 2.5 seconds, p95 9.5 ms, max 10.4 ms**, DPR 1, cache 36, with 28 accepted anatomical changes and 4× CPU slowdown. This is desktop Chrome emulation, **not a physical Android measurement**. Earlier full-detail stress exceeded the budget; the observed bottleneck was repeated material-pattern/overlay work and was corrected with raster caching and adaptive detail.

## Verification

- JavaScript syntax: 35 application/test/build/QA files.
- Reducer: 10,000 deterministic browser/vendor events, strict ordering, bounds and legacy Unicode validation; 828 distinct prior forms and two old collection descriptors.
- Geometry/time: true boundary normals, internal anchors, eye spacing, rejected empty space, continuous bounded deformation, 0/6/24/48/72/168/720-hour growth, identical replay; original 563 file hashes and 282 runtime paths.
- Worker + both migrations: **415 real accepted V3 events** in isolated SQLite, all three tools, 414th collection and continued growth, four/day/reset, same-name identities, opt-in/out, exact stored scores, time filters/order, retry deduplication, recovery/shared quota, privacy, durable reconnection, HTTP validation/ranges and private-source exclusions. A separate populated legacy database verifies additive migration preserves payloads and leaves old credits unclaimed.
- Node JSON server: all seven legacy tools plus three V3 tools, anatomical preparation, ranking and recovery, concurrent ordering, malformed/oversized requests, safe public paths, four-touch quota and restart persistence.
- Browser: Chrome at **320 / 390 / 768 / 1440 / 1920**, no horizontal overflow or sub-44px visible button targets; mouse, keyboard, real emulated touch, pinch preserving previews, transformed picking, reduced motion, no initial audio, hidden pause, local reload/history, two independent shared clients, disconnect/retry and recovery of a server-accepted response lost in transit. No console exceptions or HTTP errors in the final suite.
- Eight legacy/current renderer lifecycle constructions remove all 16 registered motion/visibility listeners; registry subscriptions return to baseline. Explicit opt-in preference survives shared reload.
- Legacy/current portrait exports: 1600×1600 PNG downloads.
- Asset serving: **335 URLs** each on static root, shared Worker and a static subpath, including every organic runtime file; original visual hashes unchanged.
- Screenshots and measured browser results: [biological-v3/](biological-v3/).

## Exact local verification

Node 24 is needed for the isolated built-in SQLite harness. No packages are shipped with the site.

```powershell
node tests/reducer-check.cjs
node tests/biology-check.cjs
node tests/server-smoke.cjs
node hosting/build.mjs
node hosting/tests.mjs
node scripts/build-static.cjs
node tests/publication-check.cjs
```

In two terminals, from the repository root:

```powershell
python -m http.server 8012 --bind 127.0.0.1
node tests/preview-worker.mjs
```

The preview uses a fresh private temporary database on port 8013. Restart it before each browser suite. Never point the mutation suite at production.

```powershell
$env:PLAYWRIGHT_MODULE='C:/Users/poimu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:STATIC_URL='http://127.0.0.1:8012/'
$env:SHARED_URL='http://127.0.0.1:8013/'
$env:SUBPATH_URL='http://127.0.0.1:8012/_site/'
node tests/browser-check.cjs
node tests/lifecycle-check.cjs
node tests/performance-check.cjs
node tests/asset-check.cjs
```

The Playwright/Chrome paths above are this workstation's existing optional QA tools; set them to your own installation elsewhere. `CHROME_PATH` can override the main suite's browser executable. `QA_OUTPUT` can choose an output folder.

For the dependency-free shared development demo:

```powershell
$env:PUBLIC_DIR=(Get-Location).Path
$env:VEOURES_DATA_FILE=Join-Path $env:TEMP 'veoures-demo-private/organism.json'
$env:PORT='8000'
node server/server.js
```

## Deployment

Keep the existing Sites identity and public audience. Open its configured source with the Sites source helper; synchronize this frontend, `hosting/worker.js` to `worker/index.js`, and the complete migration directory/journal. The managed `scripts/build.mjs` uses `dist/` and `.openai/hosting.json`, with the same geometry/reducer embedding and size guard. Run its build, Worker tests and artifact validator, then use the helper to push exact source and package an archive outside the checkout. Save that exact commit/archive and deploy the returned saved version. Migrations apply before the Worker; never recreate the Site or bind an empty database. Native deployment status and read-only post-deploy event comparison verify the result.

GitHub Actions verifies syntax/reducer/biology/Node/Worker and publishes the static Pages artifact. Pages keeps its shared-site redirect; `?mode=local` is explicitly browser-only. The root README contains playing instructions rather than implementation details.

## Practical limits

No Safari/Firefox or physical mobile/Android device was available in this run. The organism is a bounded procedural anatomical model, not a fluid/soft-body physics solver or mathematically infinite geometry. Eye capacity/spacing and regional limb density are finite; older rendered organ arrays are bounded while the event log and editions remain intact. Event replay currently downloads the complete history on first load; very large future histories need snapshots/pagination. Secure sessions and broader network limits reduce casual abuse but do not prove one person per identity. Custom-domain publication still needs the user's owned hostname and DNS access; no domain was purchased or fabricated. A separate deployment record states the actual publication outcome.
