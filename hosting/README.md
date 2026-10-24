# Public shared hosting

Live site: https://veoures.softaspen8.chatgpt.site/

The deployed public edition is one small Worker with a durable D1 database. It embeds the exact vanilla frontend and original media; the canonical reducer remains `engine/mutation-engine.js`. There is no React, application framework, dependency installation or external audio/image service.

## Source in this repository

- `worker.js`: anonymous-session authorization, validated event API, atomic quotas/idempotency and public asset serving.
- `drizzle/`: immutable, schema-only database migration and journal. Migrations apply before Worker deployment; request handlers do not create tables.
- `site.json`: non-secret Site identity and logical `DB` binding. No access credentials are stored here.
- `build.mjs`: packages the browser app/reducer into `_cloud/server/index.js` and verifies all original visual hashes.
- `local-d1.mjs`, `tests.mjs`: Node built-in SQLite adapter and end-to-end server tests, including separate database connections.

Run with Node 24 from the repository root:

```sh
node hosting/build.mjs
node hosting/tests.mjs
```

`_cloud/` is generated and ignored. The deployed Sites checkout is maintained separately so Sites source credentials and its Git branch never replace the GitHub authoring repository. That checkout uses the same Worker, migrations and frontend, with a persisted `.openai/hosting.json`, a `dist/server/index.js` build and the standard Sites source-helper/archive-backed deployment flow. For future updates, preserve the same Site ID, database binding, migration history and public audience. Never recreate the Site to apply an update.

## Contribution boundary

The API issues a random Secure/HttpOnly/SameSite session cookie. Its hash identifies accepted contributions; a client-supplied browser ID cannot mint quota. An atomic conditional SQL insert enforces four accepted writes per private contributor/personal 24-hour day, request-ID deduplication, short network cooldown and a broader 100-write / 20-new-session daily network ceiling. Network values are salted one-way daily hashes; raw IP addresses and session/network identifiers are not returned in public events. Origin checks reject cross-site writes. Earlier submitted words and optional names remain public event data, as explained in `privacy.html`.

This is anonymous participation, not proof of a unique person. Clearing cookies can start a new session, subject to broader limits; people on a shared network may share those limits. Accepted event history has no application-level lifetime cap. Every 414 accepted changes preserves a collection descriptor; biological density and bounded rendered detail prevent runaway visual complexity. Additive migration 0001 adds opt-in contributor identities and immutable event scores without changing existing rows. Source quota/transaction tests run on every GitHub push. The public service is independent of the owner's laptop and survives application redeployments.

Full V3 implementation, migration, limits and validation: `../docs/BIOLOGICAL_V3.md`. The dependency-free Node server is a development demo with client-supplied browser tokens; the public Worker uses secure server-issued sessions.
