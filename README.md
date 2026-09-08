# Vertex Mods

A static Minecraft mod download hub with a red lava theme.

## Files
- `index.html` — homepage: hero, mod grid, Fabric API section
- `downloads.html` — standalone version-picker + download page
- `tutorials.html` — step-by-step install guide + interactive demos + Modrinth App recommendation
- `faq.html` — FAQ page with animated accordion
- `terms.html` — Terms of Service
- `styles.css` — shared styling, layout, and animations for index/tutorials/faq/terms (downloads.html is self-contained)
- `script.js` — shared behavior: ember background, parallax, click sparks, download feedback, FAQ accordion, tutorial demos, scroll-reveal (downloads.html has its own inline script)

## Deploy to GitHub Pages
1. Create a new GitHub repository (e.g. `vertex-mods`).
2. Push all seven files (`index.html`, `downloads.html`, `tutorials.html`, `faq.html`, `terms.html`, `styles.css`, `script.js`) to the repo root.
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Save — your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

No build step, no dependencies — it's plain HTML/CSS/JS.
