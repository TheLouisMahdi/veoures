# Audio behavior

15 original generated MP3s, no sampled media, mono 22.05kHz 80kbps. Four ambient clips are 14 seconds, designed for subtle looping; short tools are 0.25-1.25 seconds. Their loudness is deliberately subdued.

**Off by default every visit.** Never load, decode or play MP3 until an explicit Sound On gesture. Background ambience volume ~0.16; tool feedback ~0.35. Stop on visibility hidden or Sound Off; never autoplay, never play on every pointer motion/hover. Keep concurrent effect voices bounded (max 3). On mobile prefer fewer voices.

Event map: draw_scar -> tool-draw-scar; seed_letter -> tool-seed-letter; feed_word -> tool-feed-word; add_limb -> tool-add-limb; feed_mass -> tool-feed-mass; heal -> tool-heal; corrupt -> tool-corrupt. Play only after successful server confirmation, not during preview. `ui-hover-soft` is optional (avoid repeated hover triggers); `error-soft` only on explicit failed submission. Ambient can crossfade across dormant/awakened states if optional.
