# Existing source review

Reviewed the public `travisty001/specimen-gallery` repository at commit `4e4dcdf52f421d5a8431c9a4a8113c7a3dfa1b7f`. No separate attached source archive was present in this session, so that repository supplied the baseline and original TD-001 scan. No changes were made there.

Findings grounded in that revision:

1. `app.js` handles model-viewer interactions, while `raking-engine.js` creates an additional Three.js scene. Its activation code explicitly tells the user to switch back to place/inspect markers. A single rendering path removes that mismatch.
2. `vendor/three/three.module.js` imports `./three.core.js`, which is absent from the tracked source. GLTFLoader also imports `../utils/BufferGeometryUtils.js` and `../utils/SkeletonUtils.js`, which are absent. A package-managed bundled build resolves the complete dependency graph rather than hand-copying only entry points.
3. The raking engine removes an old pivot without disposing mesh/texture GPU resources. Fieldwork releases replaced resources and avoids rendering hidden B views.
4. The README says the catalog is initially empty and says light controls only affect exposure, while the reviewed revision includes TD-001 and an additional directional engine. Fieldwork's documentation describes the packaged implementation and explicitly distinguishes test evidence from unverified GPU behavior.
5. The engine already attempts orthographic, centered rotation; that is retained as a requirement, but implemented independently with original-coordinate markers and invariant tests. No claim is made that changing the outline during rotation is itself a centering bug.

Independent design decisions:

- Large specimen bench, fixed adjacent light controls on desktop, direct light controls below the viewport on narrow screens.
- A separate notebook for evidence, scale provenance and uncertainty; no decorative telemetry or specimen identification badges.
- Muted gold and pale blue with text labels, avoiding dependence on red/green distinctions.
- No external web fonts, generative specimen imagery or invented reference models.
- Original TD-001 byte integrity verified against the reviewed repository copy.
