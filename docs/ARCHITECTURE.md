# Architecture

## Public hosted edition

The primary public site now uses the vanilla frontend with a dependency-free Worker and durable D1 event/session storage. Its source and schema are in `hosting/`; launch and live verification are recorded in `PUBLIC_LAUNCH.md`. Public access does not require an account or the owner's laptop. Atomic SQL enforces anonymous-session quotas, retries and network limits. The original Node/JSON adapter below remains a local fallback.

## State, geometry and rendering

`engine/mutation-engine.js` is the authoritative pack-05 reducer, shared by browser and server. The server loads that exact file when serving this project; its fallback `server/vendor-mutation-engine.js` is kept byte-identical for isolated deployment/tests. Pack-04 JSON documents are retained as design data, not a second geometry implementation.

The canonical seed has a common birth timestamp, seven primordial limbs and normalized coordinates. Each accepted event has an increasing version. Replaying the ordered log produces the same body across clients. Anatomy hash functions depend on normalized payloads, not server-generated UUIDs, so preview and committed geometry agree. Legacy letter/word mutations remain replayable for existing data. The current UI exposes only `draw_scar`, `feed_mass`, and `leave_text`. Tiny written traces use Canvas `fillText` with RTL direction and character-safe wrapping; Inspector uses DOM `textContent`. Text is normalized to NFC and restricted to 1–80 characters without markup, bidi overrides or control characters.

`engine/organism-engine.js` rejects missing sequence positions and ignores duplicates. `engine/renderer.js` draws Canvas 2D geometry, material gradients, veins, limb sway, breathing, scars, growth and healing from that state. A preview applies the reducer to a clone. It does not mutate canonical state or storage. Reference WebPs, textures and overlays are preserved for future archive/art direction use; none stand in for live geometry and no state-frame images are downloaded on first load.

Rendering is capped at 45 fps on desktop / 30 fps below 700px and DPR 2 / 1.5 respectively. Hidden tabs cancel the animation loop. Reduced-motion mode paints stable frames on changes only, with no idle RAF. Accepted geometry grows over 2.6 seconds; up to eight transient reactions last 3.2 seconds. Scar absorption progresses along the stroke, with 3–6 black threads and an inward impulse. Mass droplets merge and text threads settle. Each accepted visual trace carries its original timestamp. A pure four-hour decay function changes opacity/scale without changing canonical state or deleting records. Shared responses include server time, used to offset the browser clock. Reduced motion has no idle RAF and refreshes slow ageing every 30 seconds. Canvas state is reset between draws so cancelling a scar preview restores the prior image exactly.

## Interaction

Root HTML provides the stage, tool rail, collapsible composer, native dialogs and live feedback. Components handle tool selection, configuration, current status, recent traces and help. User strings are validated by the reducer and never inserted as HTML. Native buttons/inputs, visible focus, a skip link, modal focus containment, keyboard positioning, 44px controls and high-contrast CSS accompany pointer/touch input. All three narrow-screen tools remain visible; zoom/pan controls operate on a separate camera transform, and picking uses its inverse. A two-finger gesture cancels an unfinished scar without spending quota; the composer opens for review after a canvas preview.

`script.js` coordinates preview/cancel/commit. Fields and tool selection lock during a pending submission. A rejected/failed submission does not consume local quota. Feedback distinguishes waiting, rejection, accepted commit and recovery. An acknowledgment found after a lost fifth-commit response clears its preview without resubmitting or spending another change.

## Persistence protocol

`engine/sync-engine.js` performs a positive HTML capability probe, then either reads localStorage or fetches the shared log. It never treats an HTTP/server/network error as evidence that a local demo should replace shared state. Incremental polling runs every five seconds while visible, with reconnection on browser online and visibility events. Concurrent polls share one promise. Local events are not uploaded to shared mode.

`GET /api/organism?since=N` returns ordered public events and total version. Browser tokens and idempotency keys are omitted from public events. Only the requesting token receives its own acknowledgment IDs/timestamps/request IDs, used for daily count and recovery. `POST /api/mutations` accepts `{type,payload,requestId}` plus the anonymous browser header. Duplicate identical request IDs return the existing event; conflicting reuse returns 409. Accepted writes use a temporary file then atomic rename before updating in-memory state or returning 201. Versions are assigned within the single Node process.

The server rejects invalid coordinates, oversized paths/text, unknown tools/kinds, non-JSON data, oversized bodies, invalid tokens/request IDs, malformed versions, bursts under 700ms, the sixth daily mutation and a full 10,000-event epoch. Rejected writes never advance version or quota. Server/test/dot files, Windows separator aliases and paths escaping the real public root are blocked. Store files must be outside that root.

## Audio

One native HTMLAudio manager owns ambient and up to three effect voices (0.13 / 0.28 gain). It creates no media before opt-in. Accepted commits alone trigger their mapped effects. Generation counters protect pending playback from rapid toggles and visibility changes. Off/hidden pauses and clears effects as well as ambience. Sound preference is intentionally not persisted. This implementation uses one subtle ambient loop; optional state-loop crossfades and hover audio are not enabled.

## Limits of the local Node/JSON demo

This is a working single-process shared prototype. It uses polling and a bounded procedural anatomy, not a production collaboration platform. Anonymous local browser tokens are pseudonyms, not authentication: clearing storage or another profile can bypass the five/day identity boundary. Operators with filesystem access control the private event log. Mutation words remain in event payloads exposed by the public API, even though the visual body and trace list do not display them; do not enter private information.

Only one Node process may write a given data file. There is no distributed lock, database, account system, moderation queue, transactional backup or automatic epoch migration. Keep the data directory on persistent disk and back it up. The event limit is 10,000; older visual primitives are deterministically trimmed at per-type caps (limbs/buds 420, mass 320, scars 220, lesions 180), while the accepted log persists. Recent UI history shows 30 entries. Age and pulse are organism model values, not sensor readings.

The UI is English; a non-Latin letter or safe word is accepted as anatomy. Archive WebPs are not exposed through a separate gallery. Tested in desktop Chrome with mobile/touch/CPU emulation; no physical Android, Safari/iOS, screen-reader session or maximum-density device performance claim is made. A public service would need stronger identity/quota enforcement, operational monitoring, moderation policy and a database before significant traffic.

## Three-tool refinement

See `TRACE_UPDATE.md` for exact behaviour, current limits and validation evidence. Legacy mutation types remain supported by the compatibility API/reducer but are absent from the public interface. No old event is removed.
