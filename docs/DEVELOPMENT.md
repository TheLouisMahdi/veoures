# Development and operations

The root README is a visitor guide. This file contains developer startup details.

## Local browser demo

From the repository root, run `python -m http.server 8012 --bind 127.0.0.1` and open http://127.0.0.1:8012/. Local mode is explicitly labelled and only this browser remembers.

## Isolated public-runtime QA

Node 24 is required for the built-in SQLite adapter. Run `node hosting/build.mjs`, then `node tests/preview-worker.mjs` on port 8013. It creates a disposable database outside the public root. Never aim the browser mutation suite at production. With an existing Playwright installation, set `PLAYWRIGHT_MODULE`, optionally `CHROME_PATH`, `STATIC_URL`, `SHARED_URL` and `QA_OUTPUT`, then run `node tests/browser-check.cjs`.

## Local shared fallback

Run `server/server.js` with `PUBLIC_DIR` set to the repository, `PORT` to the chosen port, and `VEOURES_DATA_FILE` to an absolute private path outside the repository/public directory. No packages are required. The JSON adapter is a local single-writer demo; the hosted public edition uses server-issued cookies and durable D1 storage.

## Checks

- `node tests/reducer-check.cjs`
- `node tests/server-smoke.cjs`
- `node hosting/build.mjs`
- `node hosting/tests.mjs`
- `node scripts/build-static.cjs`
- `node tests/publication-check.cjs`

See [living organism update](LIVING_UPDATE.md), [architecture](ARCHITECTURE.md), and [hosting source](../hosting/README.md). Publish with the existing Sites project and database; preserve its audience and migrations. GitHub Pages remains a clearly labelled browser-local fallback and redirects normal visits to the public shared edition.
