<!--
Project: 3d-uy-platforma
Purpose: Guidance for GitHub Copilot / automated assistants and contributors when editing or extending this static website.
--> 

# Copilot / Agent Instructions

Short: This is a small static web app (vanilla HTML/CSS/JS) that lists demo houses, supports search/filters, favorites, orders (localStorage), a simple rule-based assistant, and a Three.js 3D viewer with a fallback geometry when a GLTF model is not available.

Please follow these rules when making changes or producing pull requests:

- Work in the workspace root. There is no bundler or build step. Files of interest:
  - `index.html` — main UI and DOM ids used by the JS.
  - `style.css` — visual styles and responsive rules.
  - `script.js` — application logic (state, rendering, filters, orders, 3D viewer, assistant). This file must be a single coherent module (no duplicate declarations).
  - `images/` — SVG/PNG placeholders used by cards.
  - `models/` — optional GLTF models used by the Three.js viewer.

Important runtime notes
- Serve the site over HTTP when testing (Three.js GLTFLoader requires it). Example (developer):
  - `python3 -m http.server 8000` (or any other static server). The project was recently tested on port 8001.
- Browser console errors are the fastest way to detect broken JS; fix any uncaught exceptions before opening a PR.

Conventions and API surface
- Vanilla JS, no modules. Keep changes minimal and explicit.
- Key DOM ids and keys used by the code (do not rename unless you update `script.js` accordingly):
  - Controls: `search`, `rooms-filter`, `max-price`, `sort`, `clear-filters`, `export-orders`, `clear-orders`
  - Lists / UI: `house-list`, `info`, `orders-list`, `favorites-list`, `toast`
  - Viewer modal: `viewer-modal`, `viewer`, `close-viewer`
  - Assistant: `assistant-query`, `assistant-send`, `assistant-output`
- localStorage keys:
  - `orders` — JSON array of order objects
  - `favorites` — JSON array of favorite indices or IDs

What to implement / preserve in `script.js`
- Single source of truth: initialize state once (const houses = [...]; let orders = [...]; let favorites = [...])
- DOM-ready initialization: wire event listeners on DOMContentLoaded
- Render functions: `showHouses(list)`, `showHouse(index)` (detail), `showOrders()`, `showFavorites()`
- Actions: `submitOrder(houseName)`, `deleteOrder(idx)`, `exportOrdersCSV()`, `toggleFavorite(index)`
- Filters/sorting: `applyAllFilters()` should combine search, rooms, price, and sort.
- Viewer: `openViewerModal(index)`, `closeViewerModal()`, `start3DViewerModal(house)`; gracefully fall back to placeholder geometry if `models/house.glb` is missing.
- Assistant: keep the rule-based assistant simple and deterministic; calls may invoke existing filter helpers.

Testing checklist (manual smoke tests to run locally)
1. Start a static server: `python3 -m http.server 8000` and open `http://localhost:8000`.
2. Confirm the house cards render with images and titles.
3. Use the search box and filters — ensure results update without console errors.
4. Toggle favorites, open the Orders panel, submit a sample order, then export CSV.
5. Open the 3D viewer for a house. If no `models/house.glb` is present, a placeholder geometry should display.
6. Test the assistant panel text inputs and ensure it suggests valid filter actions.

PR & Commit guidance for autopilot
- Keep changes focused and small. If changing `script.js`, prefer a single replacement (overwrite) with a clean, well-documented implementation rather than piecemeal duplicated edits.
- Include a short description of runtime behavior and manual test steps in the PR body.
- Use commit messages like: `feat(ui): implement XYZ` or `fix(script): remove duplicate declarations and fix runtime errors`.

If you encounter a broken `script.js` (duplicate declarations or many lint/compile errors):
- Recreate a single coherent `script.js` that implements the functions listed above. Do not leave duplicate `let`/`const` or repeated function names.
- After saving, run the manual smoke tests and confirm no uncaught exceptions in the browser console.

Assumptions
- This repository intentionally uses vanilla JS and no package manager. Contributors should not add heavy toolchains unless a follow-up PR introduces them and documents how to use them.

Contact
- If you’re an automated assistant: prefer minimal, reversible edits; add tests or a short manual verification checklist to your PR.

-- End --
