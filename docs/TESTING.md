# Validation and acceptance checklist

## Completed in this build

- [x] `npm test`: ten checks pass.
- [x] Included TD-001 parses as a self-contained GLB and has mesh geometry and texture references.
- [x] Invalid/truncated, external-resource, compressed and animated GLBs are rejected by preflight tests.
- [x] Import validation rejects wrong-file fingerprints, non-finite marker positions and incomplete calibration.
- [x] Original-coordinate point-to-point distance is translation invariant.
- [x] Actual TD-001 bounding-box center remains at world origin through a full rotation.
- [x] Marker coordinates round-trip through centering and rotation.
- [x] Orthographic projected scale is independent of depth.
- [x] Display rotations do not mutate sampled vertex buffers.
- [x] `npm run build` produces static relative assets with the local Three.js dependency graph resolved.
- [x] Original/public/dist GLB SHA-256 checks match (see CHECKSUMS.txt).
- [x] Desktop page layout and WebGL-unavailable message inspected in preview Chrome.

Geometry tests stub image decoding only; they do not verify texture color or GPU rendering. The preview browser reports `GL_VENDOR = Disabled, GL_RENDERER = Disabled`, so it cannot create a WebGL context. This is an explicit verification limit, not a passed 3D browser test. The source retains all textures, and no fabricated rendered specimen is substituted.

## Required acceptance on WebGL-enabled Chrome / Android

- [ ] Serve `dist/` on localhost, or publish it in a separate HTTPS repository. Load TD-001 with no console errors or missing asset requests.
- [ ] Orbit, pan, zoom, reset and each model-coordinate orientation. Check a narrow Android portrait screen and landscape layout; verify controls do not overflow horizontally.
- [ ] Rotate at slow/fast speeds in both directions. Verify center stability and constant orthographic framing; expect natural silhouette changes. Pause/resume and hide/restore the browser tab.
- [ ] Try all five light presets. Sweep azimuth through 360° and elevation from 0° to 90°, in original and matte display. Confirm light is world-fixed and the opposing light illuminates the other side.
- [ ] Place a marker, edit its text, rotate it behind the specimen, rotate back, remove it. Place while raking is active. Confirm numbering/text and occlusion behavior.
- [ ] Measure two points, orbit, and confirm distance unchanged. Add a verified calibration source/factor; confirm converted mm. Clear calibration to return to model units.
- [ ] Export a record, reload, confirm local persistence. Import the exported file; confirm replacement prompt. Try wrong-hash and malformed JSON; ensure current data remains intact.
- [ ] Open B with a second scan (or TD-001 for a controlled same-file check). Test linked orbit, zoom, rotation and reset. Unlink, manipulate independently, then relink. Confirm identical-file notebook state is shared.
- [ ] Enter/update each record field and save. Verify supporting catalog image display and a broken image path message.
- [ ] Open a valid local GLB. Confirm no upload requests. Try an OBJ, corrupted GLB, nonexistent catalog model, compressed GLB and empty mesh; expect clear errors and retention of previous valid scan.
- [ ] Rapidly select files during loading; ensure the latest selected scan wins. Switch repeated large models and watch GPU memory. Test two large scans on the modest target hardware.
- [ ] Enter/exit fullscreen; use rotation/orientation/light controls there. Check keyboard focus, accessible labels, and readable touch targets.
- [ ] Clear browser storage only after exporting notes; import restores them against the identical GLB.
- [ ] Deploy under a GitHub Pages repository subpath and confirm relative assets, catalog, GLB and JSON export work over HTTPS.

## Release status

Runnable implementation and deployable static build, with automated geometry/data validation complete. Real-device GPU/touch acceptance is pending. Production was not changed or deployed.
