> Current Biological Evolution V3 details and validation: [BIOLOGICAL_V3.md](BIOLOGICAL_V3.md). Earlier implementation notes below are retained as history.

# Verification performed

Current autonomous behaviour, four personal-day touches, names and 414-change collection supersede earlier interface/quota details below. See [LIVING_UPDATE.md](LIVING_UPDATE.md).

The original seven-tool integration results below are historical. For the current three-tool interface, zoom, absorption and four-hour ageing, see [TRACE_UPDATE.md](TRACE_UPDATE.md).

Integration session: 2026-10-24. Real local HTTP servers plus installed desktop Chrome through Playwright. All checks below were executed, not inferred from source code. Browser testing uses isolated fresh contexts; shared mode uses two separate browser storage profiles talking to one real Node process.

| Check | Actual result |
| --- | --- |
| JavaScript syntax | All app, engine, component, server and test JS/CJS files parse with `node --check` |
| Canonical replay | 10,000 ordered events produce identical browser/server reducer state; topology stays bounded and ordering is enforced |
| Seven tools | Each previews visible anatomy, cancels to the identical previous Canvas image, commits exactly once and survives a local reload |
| Preview/commit geometry | Identical normalized payloads yield identical anatomy despite different preview/server IDs |
| Healing and validation | A real existing lesion fades from intensity 1 to 0.3; invalid letters and a blank limb direction cannot commit |
| Daily bound | Sixth accepted change is blocked in local UI, shared UI and server API; rejected input/previews do not advance quota or version |
| Shared clients | Seven UI mutations across two isolated profiles synchronize to byte-identical canonical state; reload replays that state |
| Interrupted connection | Shared mode locks commits, retains the preview, recovers connection and does not write local-only events |
| Lost fifth response | Server accepts mutation, response is intentionally aborted, polling recovers its owner acknowledgment and clears the preview without duplication or another quota charge |
| Idempotency | Identical request ID/payload returns the original event; changed payload under that ID returns 409 |
| Server robustness | Malformed/null/array JSON, unknown tool, invalid coordinates/word/letter/limb, invalid version, wrong content type and >16KB input rejected; oversized input returns 413 without killing the connection/server |
| Concurrent writes and restart | Three simultaneous clients receive consecutive unique versions; accepted log survives a process restart |
| Private paths | Server/test/dot paths and encoded Windows backslash aliases denied; static HEAD works and shared capability header is present |
| Responsive layouts | 320x844, 390x844, 768x900, 1440x900, 1920x900: no document horizontal overflow, all seven tools reachable, visible buttons at least 44px, commit and dialogs usable |
| Additional mobile check | 375x844 forced-colors mode with subpath startup, valid limb commit and reload passed |
| Pointer / touch / keyboard | Mouse-drawn multipoint scar; mobile touch position + explicit commit; canvas arrows + Enter to focused Commit; Escape cancels; native dialog focus containment and Escape passed |
| Reduced motion | No idle RAF, DPR cap respected, stable preview/cancel images; mutations still render |
| Sound | No initial MP3 requests; opt-in starts ambience, effects stop with off, simulated hidden state stops all media and RAF, visible state resumes ambience only when enabled |
| URLs and hashes | 52 root/art/audio/copy URLs return 200 at static root, shared root and `/veoures/` static subpath; all 33 deployed visual manifest hashes match supplied bytes |
| Console / HTTP | No uncaught JavaScript errors, unexpected console errors or HTTP failures during normal interactions; no 404s |
| Original project | All 189 files in the initial SHA-256 snapshot remain unchanged, including the source packs |

Two network diagnostics in `browser-results.json` are expected: `ERR_INTERNET_DISCONNECTED` during the intentional offline test and `ERR_FAILED` for the deliberately aborted accepted response. They are recorded rather than hidden. There were zero failing HTTP responses in the regular UI test; separate API rejection tests intentionally exercise 400/409/413/415/429 responses.

## Performance sample

Chrome mobile viewport 390x844, device scale 3 (Canvas DPR capped at 1.5), CPU throttled 4x, 2.514-second sample of the initial animated body:

- 62 actual draws; target cap 30 fps.
- 95th-percentile draw time: 2.7ms. Maximum: 3.2ms.
- Browser-thread task time: 0.563 seconds during that sample.

This is desktop CPU emulation, not a physical mid-range Android benchmark. It verifies that the initial Canvas loop is lightweight in this environment. Maximum anatomy density, real-device battery use, Safari/iOS and manual screen-reader testing were not measured. Rendering caps and hidden/reduced-motion suspension are implemented.

## Screenshots inspected

All six PNGs were opened and visually inspected. Initial views keep the organism visible, the small-screen composer collapsed, the toolbar scrollable, and the mode label readable. The shared screenshot shows actual committed procedural mutations, not a reference image.

- [320px](screenshots/viewport-320.png)
- [390px](screenshots/viewport-390.png)
- [768px](screenshots/viewport-768.png)
- [1440px](screenshots/viewport-1440.png)
- [1920px](screenshots/viewport-1920.png)
- [Shared organism after commits](screenshots/shared-mutated-1440.png)

## Repeat

`node tests/reducer-check.cjs` and `node tests/server-smoke.cjs` require Node only. `tests/asset-check.cjs` checks running roots, with optional `SUBPATH_URL` for a project subpath. The browser suite needs the existing Playwright module and Chrome; environment options are in README. Its mutations must target disposable shared storage.

The browser regression suite passed after sync recovery changes. A targeted 375px/forced-colors/subpath test then verified the final blank-direction validation correction. Syntax and asset tests were repeated at completion. Remaining limitations are documented in `ARCHITECTURE.md`.
