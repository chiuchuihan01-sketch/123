# FJCU imMBA (Demo) Website

This is a lightweight, static front-end mock that mirrors the **content structure** and **navigation (including dropdown menus)** of the Fu Jen College of Management imMBA site, with **synchronized bilingual (ZH/EN)** switching and an international-looking UI.

Reference site: `https://www.management.fju.edu.tw/subweb/immba/`

## Run locally

Because this is a pure static site, you can run it with any simple HTTP server.

### Option A (Python)

```bash
python -m http.server 5173
```

Then open `http://localhost:5173/`.

### Option B (Node)

```bash
npx serve .
```

### Option C (Python SPA history fallback)

When refreshing routes like `/admin`, a plain static server may return `404`.
This option always falls back to `index.html` for unknown routes, which avoids error responses in SPA mode.

```bash
python server.py 5173
```

Then open `http://localhost:5173/`.

## Notes

- Opening `index.html` directly also works (file mode uses hash routing), but running via a local server is recommended.
- Content strings live in `src/content.js` (ZH/EN are kept in the same keys so the UI stays in sync).
