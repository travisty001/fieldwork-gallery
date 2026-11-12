# Architecture

## One rendering path

Every viewport uses the same Three.js engine (`src/viewer.js`) for camera orbit, directional light, ray picking, material inspection and rotation. No feature toggles between a separate model-viewer element and a second rendering system. Three.js 0.180.0 and its actual imports are bundled by Vite; the distributable has no import map or remote dependency path.

`src/main.js` owns application state, catalog loading, UI events, comparison synchronization and record persistence. `src/data.js` owns GLB preflight, import validation, measurements and JSON export. `src/style.css` owns responsive layout and contrast. Catalog content is independent of application code.

## Coordinate system

The model's vertex buffers and embedded textures are never edited. The hierarchy is:

- pivot: rotation about world origin
- space: translation by negative original scene bounding-box center
- original GLB scene, unchanged
- measurement overlay in original scene coordinates

Ray-picked world points are converted with space.worldToLocal. Imported markers use this same frame, and space.localToWorld projects them for the HTML marker labels. Measurements use Euclidean distance in original scene units, so rotating or framing cannot change a measured span. The orthographic camera removes depth-based enlargement/shrinkage. A bounding sphere derived from the box diagonal keeps full rotations framed; the outline will still change with aspect.

No anatomical axis or biological interpretation is inferred. The Y axis is the turntable axis. Existing scan props remain part of the bounds.

## Lighting

Ambient light plus independent key and opposing directional lights. Azimuth is around Y; elevation is above the XZ plane. Lights stay world-fixed as the model rotates. Intensities are display values, not calibrated lux. Cross-light uses a separate opposing direction at the same elevation. Silhouette is an explicit unlit material override. Material overrides are temporary and original material references are restored when exiting them.

## Comparison

A separate scene/camera/renderer for each view. Lighting and display mode are shared. Linked camera updates copy the direction/up vector, zoom and pan relative to each model radius. Rotation angle, sign and speed are synchronized. Independent view mode disables this linkage. The same hash shares notebook data between views, avoiding conflicting browser records for an identical scan.

## Data integrity

GLB structure and embedded resources are checked before loading. Unsupported compression and animated geometry are rejected. SHA-256 binds records to exact file bytes. Import checks schema, finite 3D positions, text types/lengths, list limits and positive calibration with provenance. Text is inserted using textContent or form values, never parsed as HTML. Catalog assets are restricted to same-origin relative paths.

File reading, rendering and notes remain in the browser. There is no server write route. localStorage failures leave the current in-memory record usable and prompt JSON export. Imports require explicit replacement confirmation; malformed imports do not mutate the existing record. Load sequence tokens prevent stale asynchronous loads from replacing newer choices. Old mesh, material and texture resources are disposed when replaced; no geometry conversion occurs.

## Resource use

No animation starts automatically. Rendering occurs only when dirty or rotating. Hidden-tab animation stops; rotation delta is capped after interruptions. B is created only when comparison is requested and is not rendered while hidden. Pixel ratio is capped at 1.5; shadows/postprocessing are omitted. A modest UI does not guarantee modest GPU memory when scans have large textures; original data takes priority over automatic optimization.

## Deployment

Vite emits local relative assets into dist. Python or any static server can serve that directory. Copying its contents to a new GitHub Pages repository is sufficient. There is no API, database, paid account, key, CDN font or analytics integration.
