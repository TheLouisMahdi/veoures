# Natural Life — heartbeat, inertia and feeding

This update follows the Organic V2 / Biological V3 integration. The visitor interface and three tools stay in place. Accepted history, quota, identities and collection records are retained.

## What changed

- A single deterministic heartbeat clock drives the dark cardiac chamber, fine membrane contraction, vein highlights and sound. It has a stronger first beat and a softer second beat about 194–196 ms later, followed by a genuine resting interval. Small cycle-to-cycle variation avoids a mechanical metronome. The existing healthy approximately 74 BPM baseline remains.
- The heartbeat sound is original native Web Audio synthesis, with a falling bass thud, quiet upper harmonics and filtered procedural valve texture. Its envelopes are short and asymmetric. Ambient and tool levels were reduced to leave headroom. No heartbeat recording, external library or new media download is used. No AudioContext or MP3 loads before Sound on. Hidden/off stops scheduled sources and the scheduler; returning to the tab resumes only an already enabled sound setting. Repeated toggles reuse one context.
- Body movement now integrates force, velocity, inertial mass, linear/quadratic drag and soft boundaries in substeps of at most 1/120 second. Food increases inertial load and the body coasts and turns more slowly. Small accepted feeding impulses are delayed until the placement freeze ends. Autonomous targets change continuously with seeded eddies; behavior intervals vary rather than switching on a fixed 23-second schedule.
- Tendrils have constrained flexible chains with pinned roots, individual flow forces, damping and lag from body acceleration. Their drawn black ribbons, branches and gloss follow the physical points. Current flexible legacy appendages use the same solver; old collection drawing code remains preserved separately. Hidden tabs do not simulate a long catch-up step. Reduced-motion/history/export uses a quiet static anatomical representation.
- Feed Mass now draws small dark intake streams that disappear into tissue rather than expanding balls. Local tissue influence spreads over a wider area as it matures, with a much lower bounded surface displacement (0.012 local units). Some mass becomes distributed density and inertial load. The temporary mass texture is flatter and fades as absorption progresses. There is no disconnected swollen sphere. The server and renderer use the same updated contour.
- Preview anatomy is no longer added a second time for a frame after the matching server commit. The inverse camera/rotation transform and explicit commit/cancel flow remain intact.

The dynamics are a lightweight 2D inertial body and constrained tendrils in an artistic viscous medium. There is no full fluid simulation or anatomical/medical accuracy claim; self-collision between every appendage is not simulated.

## Verification

`node tests/natural-life-check.cjs` verifies 100 reproducible variable heartbeat intervals, separated first/second pulses, agreement of 30/60 FPS body integration, greater inertia with added mass, 3,000 stable constrained-chain steps, pinned roots, finite coordinates/bounds, and a connected mature mass deformation below 0.016 local units including distributed growth.

The optional `tests/natural-audio-browser.cjs` checks initial silence/no context, actual scheduled heartbeat cycles after explicit opt-in, a rendered offline waveform with a stronger first pulse, silence between cycles and peak amplitude below 0.2, hidden/off suspension, all source cleanup and reuse of the same context. Measured waveform: first RMS 0.0170, second RMS 0.00990, resting RMS 0, peak 0.0968. This verifies synthesis/headroom, not the quality of an untested physical phone speaker.

The complete Chromium suite passed at 320/390/768/1440/1920, with keyboard/touch/pinch, local and two-client shared persistence, quiet historical replay, preview/cancel, recovery of a lost accepted reply, PNG exports, reduced motion and audio opt-in. No page exceptions or HTTP errors. Screenshots and results: [natural-life/](natural-life/).

After a 1.5-second warm-up with 28 anatomical changes and 4× CPU slowdown, the mobile emulation measured 63 draws in 2.5 seconds, p95 18.8 ms and max 22.3 ms, with DPR 1 and cache 31. This is desktop Chromium emulation, not a physical Android claim. Eight legacy/current renderer lifecycles balanced all 16 motion/visibility listeners and registry subscriptions. The 415-accepted-event Worker/migration suite and Node shared-server suite also passed with the revised contour.

## Local checks

Use the startup commands in [DEVELOPMENT.md](DEVELOPMENT.md). Restart the isolated Worker preview before the mutation browser suite.

```powershell
node tests/natural-life-check.cjs
node tests/biology-check.cjs
node hosting/build.mjs
node hosting/tests.mjs
# With the existing optional Playwright installation and local servers running:
node tests/natural-audio-browser.cjs
node tests/browser-check.cjs
node tests/lifecycle-check.cjs
node tests/performance-check.cjs
```

All changes remain vanilla HTML/CSS/JS and Canvas 2D. Read-only production verification and actual release status are recorded separately; intermediate source-upload packages are never production deployments.

The final Worker embeds 360 served responses: 5,646,768 raw bytes / 3,070,341 gzip bytes, below the configured conservative 3 MiB compressed guard. See [PUBLICATION_V3.md](PUBLICATION_V3.md) for the verified deployment and preserved database history.
