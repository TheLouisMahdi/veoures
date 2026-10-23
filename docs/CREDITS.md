# Credits and rights

This implementation integrates the eight VEOURES packs supplied in `../venom/update/`. The new Canvas renderer and interface are derived from the pack-05 vanilla engine/demo, with UX from pack 01, visual direction from pack 02, synthetic audio from pack 03, retained organism design data from pack 04, corrected server integration from pack 06, copy from pack 07 and the integration requirements in pack 08.

The supplied visual pack describes its artwork, textures, icons and favicon as original procedural creations generated for this project. The 33 supplied deployed manifest assets retain their original names, bytes and SHA-256 hashes. The manifest preserves `generator` and `usage` provenance. Its exploration board is recorded under `excludedAssets` and remains only in the supplied source pack; it is neither copied into the new website nor used as a screenshot of implemented functionality.

The supplied audio pack describes all 15 MP3s as original synthesized audio without sampled media, mono 22.05kHz / 80kbps. Files are copied unchanged. The app uses the base ambient loop and seven accepted-tool effects; unused optional clips remain available under their original names.

Original source notes are preserved verbatim in:

- `provenance/VEOURES_VISUAL_STYLE_GUIDE.md`
- `provenance/VEOURES_AUDIO_BEHAVIOR.md`

No separate third-party license grant was included in the supplied packs. These notes preserve their stated provenance without inventing a new license or relicensing the assets. No external fonts, media, trackers or remote visual/audio assets are loaded. The original fallback project's media and reference artwork were not imported into this project.

## Publication identity

The additional `assets/brand/social-card.png` is an original VEOURES brand composition rendered from this project's canonical Canvas organism and native HTML typography. It is separately recorded in `asset-manifest.json`; the 33 original supplied asset hashes remain unchanged. Brand name, repository presentation and publication changes are described in `BRAND.md` and `PUBLICATION.md`.
