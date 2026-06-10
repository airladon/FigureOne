# Texture & Atlas Subsystem Update — Upgrade Notes

This release reworks FigureOne's internal WebGL texture and font-atlas management.
**No public API changed.** Most consumers need to do nothing. If you remove
individual text/GL elements at runtime while other same-font text stays on
screen, read the "What you should do" section.

Source commits: `Bind textures on each use`, `Reference-count shared textures`.

---

## TL;DR

- Texture units are now assigned **per draw from a small shared pool** instead of
  one permanent unit per texture. This removes a previously *silent* cap on the
  number of distinct live textures.
- Textures — including font atlases — are now **reference-counted**. Removing one
  element that shares a font atlas no longer frees that atlas out from under
  other elements still using it.
- A missing/unloaded texture now **degrades safely** (the object skips its draw)
  instead of crashing or sampling a stale texture.

---

## What changed in FigureOne

### Per-draw texture unit allocation (bind-per-draw + bind-on-change)

- **Before:** each texture was bound to a dedicated texture unit at upload and
  kept there for its lifetime. The number of distinct live textures was therefore
  silently capped at `MAX_COMBINED_TEXTURE_IMAGE_UNITS` (spec minimum 8; commonly
  16–32 on mobile). Beyond that, textures stopped sampling with no error.
- **After:** units are assigned per draw from a small shared pool (unit 0 is
  reserved for the target/selector framebuffer texture). There is no longer a cap
  on the number of distinct textures. A `bind-on-change` cache skips redundant
  `bindTexture` calls, so runs of draws sharing a texture (e.g. text on one
  atlas) still issue zero binds.
- A one-time `Console` warning fires if a draw's unit budget would exceed
  `MAX_TEXTURE_IMAGE_UNITS` (the fragment-shader sampler limit), so over-budget
  use is diagnosable instead of silent.

### Reference counting for textures (including font atlases)

- **Before:** `deleteTexture` freed the GL texture immediately. The first owner's
  `cleanup()` would delete a shared texture (e.g. a font atlas) out from under
  other elements still using it — causing a crash, garbage render, or blank text.
- **After:** each registered texture carries a reference count. `deleteTexture`
  releases one reference; the GL texture is freed only when the last owner
  releases it. Full teardown (`webgl.cleanup`) still hard-frees everything.
- `GLText` now correctly **acquires** a reference to the atlas it adopts, balanced
  by its release on cleanup. (Previously it released without acquiring, which is
  the root of the shared-atlas-deletion bug above.)

### Robustness fixes

- A missing/unloaded **base texture** now causes the object to **skip its draw**
  (render nothing this frame) rather than sampling whatever stale texture occupies
  the unit, or throwing. (Composed texture shaders sample unconditionally, so
  there is no safe in-shader fallback — skipping is the only garbage-free option.)
- A missing **mask** is skipped cleanly instead of defaulting its sampler to the
  reserved unit-0 framebuffer texture.
- **Forced texture updates** (e.g. atlas re-render) now preserve pending `onLoad`
  callbacks instead of dropping them.
- The texture release is keyed on an internal `acquiredBaseTextureId` (the exact
  id that was acquired), so it cannot over-release on a failed acquire and is
  robust to consumers nulling `drawingObject.texture` before removal.

### Internal rename

- A texture's `index` field → `handle`: a stable monotonic id, **not** a texture
  unit number. The numeric argument passed to texture `onLoad` callbacks is now
  this handle. This is an internal field, not a public API.

### Tests added

Shared-atlas survival on partial teardown; font-change reference rebalancing;
bind-on-change skip/rebind; acquire/over-release safety; and a regression test
mirroring the downstream "detach then remove" cleanup workaround.

---

## What you should do on upgrade

**1. If you have a shared-atlas cleanup workaround, you can remove it.**

Some consumers wrote helpers to keep shared font atlases alive across element
removal — e.g. calling `resetBuffers(false)`/`cleanup(deleteTexture=false)`,
nulling `drawingObject.texture` before `remove()`, or otherwise dodging the
default cleanup path. Reference counting makes these unnecessary: default
`remove()` → `cleanup(true)` now only decrements the atlas's reference count and
frees it when the last owner releases.

- These workarounds are now **redundant but harmless** — the release is keyed on
  an internal id, not on `texture.id`, so even nulling `texture` keeps the
  reference count balanced (verified by a regression test that mirrors that exact
  sequence).
- **Action:** removing the workaround is safe and simplifies your teardown.
  Verify once in your environment, then delete at your leisure. Keeping it also
  works.

**2. Re-check any resource-exhaustion handling.**

Under the old model, every persisted atlas held a *permanent texture unit*. Apps
that accumulate many atlases (e.g. across single-page-app view transitions) could
exceed mobile unit limits (`MAX_COMBINED_TEXTURE_IMAGE_UNITS`, often 16–32) →
textures silently stop sampling. The new per-draw unit pool means persisted
atlases consume **zero** permanent units, removing that vector.

- **Caveat:** this does **not** reduce atlas VRAM. If your exhaustion comes from
  *memory*/context-loss (e.g. a `webglAvailable === false` path) rather than unit
  count, this change won't help that. Check whether your symptoms were
  blank-textures (unit cap → fixed) vs. context-lost (memory → unchanged).

**3. No action needed for the `index` → `handle` rename.**

Unless you read a texture's `index`/unit number directly or use the numeric
argument passed to a texture `onLoad` callback, the rename does not affect you.

---

## Behavior change to be aware of

Removing an element that shares a font atlas now **decrements** that atlas's
reference count. Previously, workarounds that nulled `texture` dodged the
decrement entirely. This is safe — the count cannot reach zero while the atlas's
own `Atlas` object or any sibling element holds a reference — but if any of your
code assumed a shared atlas's reference count only ever climbs, that assumption no
longer holds.

---

## Known limitations / future work

- **Atlas VRAM is not reclaimed mid-session.** An `Atlas` holds a permanent
  reference to its texture for the figure's lifetime, so atlas textures are freed
  only at full teardown (`webgl.cleanup`), even after all text using them is
  removed. Making atlases reclaimable (releasing the `Atlas` reference on
  eviction) is possible future work; it would also retire the `cleanup(false)`
  calls in the equation code, which currently leave reference counts slightly
  inflated but harmless.
- **Async (URL-loaded custom font) atlases:** if an atlas texture isn't
  registered yet when an element adopts it, no reference is taken; this degrades
  to the safe "render nothing until loaded" behavior rather than a crash. The
  common default-font (canvas) atlas path is synchronous and fully covered.
