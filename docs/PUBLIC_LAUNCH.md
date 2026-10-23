# Public shared launch

Live: **https://veoures.softaspen8.chatgpt.site/**

Open the link and contribute. No installation, account, local process or owner laptop is needed. Both the page and API are publicly accessible in an ordinary browser. The public edition reports **SHARED ONLINE** and keeps one durable collective organism.

The existing `https://thelouismahdi.github.io/veoures/` entry forwards to the shared edition. Append `?mode=local` for the old browser-only fallback. GitHub remains the authoring repository, verification history and downloadable local Node demo.

## Runtime

- One dependency-free Worker serves the unchanged vanilla UI and original local media.
- D1 stores accepted events and anonymous sessions across requests, isolates and deployments.
- The original reducer remains authoritative; the same normalized events reproduce the same anatomy.
- A random Secure/HttpOnly/SameSite cookie authorizes a contribution session; caller-chosen visitor headers cannot create quota.
- One atomic SQL insertion checks quota, request ID, short cooldown and broader network limits before acceptance. Failed/previews/cancelled requests do not spend changes.
- Public API events exclude session/network identifiers; original submitted words remain public. The visible privacy page explains this before contribution.
- The initial edition caps accepted events at 10,000 and preserves the body if contributions pause. Cookie and network quotas are abuse deterrents, not unique-person authentication.

The deployed Site preserves project identity `appgprj_6adbdfaec070819188734de61a9b0bbc`, public access and logical database binding `DB`. Version 2 uses source commit `caf17222238cda6bcab1d739d113a323aa046186` in its managed hosting repository. Its native deployment succeeded. Hosting source, schema and dependency-free checks are mirrored in `hosting/` here; credentials and local database files are excluded.

## Actual verification

- SQLite-backed tests: all seven tools, separate clients/connections, restart/persistence, five daily accepted changes, atomic retry/concurrency, rejected cross-origin and malformed/oversized requests, private-field filtering, media ranges and private-path exclusion passed.
- Complete browser suite against an isolated local copy of the public runtime: 320/390/768/1440/1920, all seven tools, cancellation, reload, keyboard/touch, reduced motion, sound opt-in/off/visibility, two-client sync, disconnect/recovery and lost fifth-commit acknowledgment passed.
- Real public site: two fresh anonymous browser contexts at 1440x900 and 390x844 reached shared mode; one accepted a letter and the other a word. Their canonical state matched.
- After the second deployment, those two real accepted events remained at version 2. Fresh clients saw identical state, reload preserved it, preview/cancel spent no change, health and privacy URLs returned 200, sound loaded no MP3, and there were zero browser errors or failed UI responses.

The first remote check exposed a CSP incompatibility with hosting-injected inline security scripts. The policy was made compatible and the second live browser check passed. Some raw Node HTTP probes received Cloudflare 403; real browser navigation and same-origin API calls returned 200. Deployment success and human-browser operation were verified separately rather than treating the raw probe failure as an application failure.

Production did not need a data reset. The two small test contributions remain valid parts of the public organism. No visitor history was deleted during deployment.

- [Live test result](public-runtime/live-results.json)
- [Complete local browser test result](public-runtime/browser-results.json)
- [Live desktop capture](public-runtime/live-shared-1440.png)
- [Live mobile capture](public-runtime/live-shared-390.png)

## Changed files for this launch

New public-runtime files are `hosting/README.md`, `hosting/build.mjs`, `hosting/worker.js`, `hosting/local-d1.mjs`, `hosting/tests.mjs`, `hosting/package.json`, `hosting/site.json`, `hosting/drizzle/0000_veoures.sql`, and `hosting/drizzle/meta/_journal.json`.

New public UI/entry files are `privacy.html`, `assets/privacy.css`, and `scripts/pages-entry.js`. This document and the four files under `docs/public-runtime/` record verification.

Updated files are `.github/workflows/pages.yml`, `.gitignore`, `README.md`, `docs/ARCHITECTURE.md`, `docs/BRAND.md`, `docs/PUBLICATION.md`, `engine/sync-engine.js`, `index.html`, `script.js`, `scripts/build-static.cjs`, `tests/browser-check.cjs`, and `tests/publication-check.cjs`.

Original supplied image/audio bytes, app design, local Node fallback and the original source project remain intact. The public application uses no npm runtime dependencies, external fonts, sampled media or third-party analytics code authored by this project.
