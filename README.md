# Fieldwork — independent specimen workstation

An independent, publicly hosted scientific examination gallery for the Travis Downing collection. The original `specimen-gallery` website is maintained separately and remains unchanged. TD-001 is included byte-for-byte from the existing public repository; no scientific identification or physical dimensions have been inferred.

## Run the ready-built version (no npm needed)

Extract this complete archive, open a terminal in `fieldwork`, then:

```sh
python3 -m http.server 8000 --directory dist
```

Open **http://localhost:8000**. On Windows use `py -m http.server 8000 --directory dist`.

Do not double-click index.html: browsers restrict catalog fetches under file://. Use localhost or HTTPS, because scan fingerprints use Web Crypto. A phone accessing an ordinary HTTP LAN address may not have Web Crypto available; GitHub Pages HTTPS is the recommended phone testing route.

## Develop

Requires Node.js 20.19+ and npm, with internet only for installing dependencies.

```sh
npm ci
npm run dev
npm test
npm run build
```

The development server prints its URL. `dist/` is the complete portable static website, with bundled JavaScript, CSS and original model. The built site has no CDN, Google Fonts, API keys, analytics or runtime package downloads. Source is in `src/`; catalog and original assets are in `public/`.

## GitHub Pages publishing

This separate repository deploys automatically from `main` using `.github/workflows/pages.yml`: GitHub Actions installs exact locked dependencies, runs tests, builds the relative-path static site, and deploys `dist/` over HTTPS. The original `specimen-gallery` repository is not modified. Updates should be committed and pushed to this repository. No files or models are uploaded by visitors using the browser-only `Open GLB` control.

## Examine a scan

- Choose a catalog entry or use **Open GLB**. Local GLBs are read inside the browser and never uploaded.
- Drag to orbit; wheel/pinch to zoom; right-drag or two fingers to pan. View buttons use the model's coordinate axes, not anatomical directions.
- **Rotate** turns the specimen around the center of its axis-aligned geometry bounding box. Speed and CW/CCW are adjustable. Orthographic projection removes perspective depth scaling. The object's outline can still naturally change as different sides face the camera.
- **Studio / Raking / Cross-light / Silhouette / Flat** are always visible. Adjust azimuth, elevation, key strength, ambient and opposing fill. Lighting is shared between both views.
- **Original texture / Neutral matte / Surface normals / Wireframe** changes display materials, never stored geometry. Silhouette uses a dark unlit material on a light background. Flat uses ambient illumination; it is not a photometric reconstruction.
- **Compare two** opens B. Select a catalog entry or another local GLB there. Link views to match camera angles, normalized pan/zoom and rotation; unlink to examine independently. Both models fit their own viewport: this is NOT a shared physical-size comparison.
- **Place marker** pauses rotation and disables orbit while placing. Tap the surface, enter a neutral label and observation. Edit from the numbered marker or notebook. Remove from the notebook. Use **Navigate** to orbit again.
- **Measure**: tap two surface points in the same view. Blue lines connect those original-scene coordinates; lines remain visible through the specimen. Distances are straight-line chords, not geodesic surface distances. They use model units until calibrated.
- To calibrate, enter a verified number of millimetres per original model unit AND a source. For example, if a verified physical span is L mm and its corresponding model span is D model units, use L/D. Do not use an estimated species size as calibration. Clear the factor to restore unknown scale.
- Save edited metadata with **Save record locally**. Export JSON for backup or transfer. Import replaces the current record after confirmation and only accepts the exact same GLB SHA-256 fingerprint. A re-exported or edited GLB needs a new record even if it looks similar.

## Add records and supporting photographs

Keep original archival copies. Copy a self-contained GLB to `public/models/` and add a record to `public/specimens.json`. Add photographs under `public/images/`. Rebuild after catalog changes. Example schema:

```json
{
  "id": "MY-002",
  "title": "Specimen MY-002",
  "file": "models/my-002.glb",
  "description": "Observed surface scan; identification unconfirmed.",
  "provenance": "Documented collection location, at the intended public precision",
  "acquisition": "Collector, date and circumstances if documented",
  "measurements": "Verified physical measurements and method, or unknown",
  "scan": "Device, capture date, software and known defects",
  "observations": "Visible features only",
  "uncertainty": "Alternative interpretations and limitations",
  "images": [{"src":"images/my-002.jpg","caption":"Supporting view; date and scale if known"}]
}
```

Paths must be relative and on the same origin. Supporting images come from the catalog, not from the record editor. Metadata edits are local to the browser; they do not modify the published JSON. No precise locality, acquisition date, specimen size or taxonomic identification has been invented for TD-001.

## Current limitations

- Requires WebGL 2 and HTTPS/localhost. This environment's preview Chrome explicitly disabled WebGL, so GPU appearance, live picking, synchronized interaction, fullscreen and real Android gestures still need device acceptance testing. See `docs/TESTING.md` for precisely what passed.
- Supports self-contained GLB 2.0 static meshes. Draco, Meshopt, KTX2, external sidecars, skeletal animation and morph targets are rejected with clear errors. No scan is converted or compressed automatically.
- Two comparison views use two GPU contexts and load assets separately. Large meshes/textures can exhaust mobile memory; there is no decimation or texture downsampling. Pixel ratio is capped at 1.5. The included original is about 34 MB.
- Lighting uses real directional lights and surface normals, without cast-shadow maps or ambient occlusion. Baked texture lighting cannot be removed. Extremely metallic materials may look dark without an environment map; use neutral matte for shape inspection.
- Rotation uses bounding-box center, not center of mass. Props/stands are included in that bound. No automatic stand removal, anatomical reorientation, mesh registration or alignment is attempted.
- Notes and calibration are browser-local and shared for the same exact file in both views. Export JSON before clearing browser data. No multi-user collaboration or cloud persistence.
- The record editor requires pressing Save. Switching the working specimen before saving discards unsaved form edits. Marker/measurement edits save immediately.
- Surface markers remain in original GLB scene coordinates. Back-facing markers are hidden using ray tests with a small numerical tolerance. Hundreds of markers can reduce rendering speed.
- Measurements inherit scan distortion, calibration and picking error. No error bars are calculated. Displayed significant figures are numerical formatting, not a claim of scientific accuracy.
- Supporting image display is available, but image upload, catalog authoring UI, slicing, mesh editing, Gaussian splats and side-by-side physical scale normalization are not included.

## Architecture and validation

Read `docs/ARCHITECTURE.md`, `docs/SOURCE_REVIEW.md`, and `docs/TESTING.md`. Ten automated checks cover the actual model's geometry parsing, data validation, coordinate round trips, centered rotation and orthographic scale invariance. The build is included and does not need a toolchain to serve.

## Rights

New application source: MIT (see LICENSE). Three.js: MIT (`licenses/three-MIT.txt`, also shipped in dist). TD-001 and specimen records remain the collection owner's data; this project grants no additional license to redistribute or scientifically identify the scan. Development packages retain their own licenses.
