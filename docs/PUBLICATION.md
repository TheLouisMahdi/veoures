# Branding and publication

VEOURES is published as `TheLouisMahdi/veoures`, with the primary line **One body. Many hands.** and the supporting line **A living form, shaped by us.** The short repository name matches the existing product identity.

- Repository: `https://github.com/TheLouisMahdi/veoures`
- Public local demo: `https://thelouismahdi.github.io/veoures/`
- Deployment/check history: `https://github.com/TheLouisMahdi/veoures/actions/workflows/pages.yml`
- Brand definition: `BRAND.md`
- Credits and rights: `CREDITS.md`

## Changes after the initial integration

| File | Change |
| --- | --- |
| `.gitattributes` | Consistent source text line endings; original media/provenance bytes preserved |
| `.gitignore` | Excludes runtime data, local credentials, dependencies, logs and generated artifacts |
| `.github/workflows/pages.yml` | Syntax, reducer, real-server and artifact checks before Pages deployment; official actions pinned to verified release commit SHAs |
| `assets/brand/social-card.png` | Original 1200x630 share/README composition using the actual Canvas organism |
| `docs/BRAND.md` | Name, voice, palette, mark, taglines and repository identity |
| `docs/PUBLICATION.md` | This publication record |
| `scripts/build-static.cjs` | Dependency-free, explicit static artifact allowlist with original asset hash checks |
| `tests/publication-check.cjs` | Metadata, card dimensions, relative URLs, honest local mode and artifact exclusion checks |
| `README.md` | Public-facing product introduction, visual identity, portable startup instructions and deployment guidance |
| `asset-manifest.json` | Adds the newly rendered brand card; all supplied asset entries and hashes retained |
| `docs/CREDITS.md` | Records provenance of the additional original brand composition |
| `docs/CHANGED_FILES.md` | Preserves initial integration inventory while removing local personal paths and pointing to this subsequent record |
| `index.html` | Consistent page title/theme, canonical URL, Open Graph and large-image Twitter card metadata |

The application behaviors, original supplied image/audio bytes and source fallback project are preserved. No blanket open-source license was added. Git commits use the repository owner's GitHub noreply address, rather than publishing a personal email address.

## Validation and deployment boundary

Local publication checks pass for canonical URLs, all relative HTML references, the 1200x630 brand card, original media hashes and static artifact contents. Reducer replay and the real shared-server suite pass again before initial publication. The previous complete interaction/browser verification is retained in `VERIFICATION.md`.

The Pages artifact contains only browser application files and media. It excludes server implementation, tests, repository metadata, documentation, reference artwork and private event data. Runtime store files remain outside the public directory and are ignored by Git. The GitHub repository includes server/test sources so the shared demo can be run independently.

GitHub Pages runs **LOCAL DEMO - Only this browser remembers.** It does not run Node or synchronize visitors. The included Node server remains the actual shared implementation. That initial GitHub-only publication did not deploy a public synchronized service. The subsequent public launch is documented in [PUBLIC_LAUNCH.md](PUBLIC_LAUNCH.md).
