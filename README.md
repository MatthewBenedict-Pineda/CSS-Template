# Clinical Systems Support – Templates Hub

A static web app (no server, no build step). Open `index.html`, or host the folder on GitHub Pages / SharePoint / any web server.

## Files
- `index.html`, `styles.css`, `app.js` – the application
- `data.js` – the published templates and signatures (the single source of truth)

## Using it
- Click any item in the **Template index** or the sidebar to jump to that template.
- Fill in the highlighted fields; the preview updates live.
- **Copy formatted** pastes into Outlook with bold text and clickable links intact. **Open in Outlook** starts a mail with To / Cc / Subject / body filled in.

## Updating templates
1. Turn on **Edit mode** (top right). Use **Edit, Duplicate, Move, Delete** on any template, or **New template**.
2. In the editor: `{{Field}}` = fill-in box, `{{Type|A;B;C}}` = dropdown, `{{Notes|multiline}}` = large box,
   `**bold**`, `[text](https://link)`, `- bullet`, `## Heading` = separately copyable blocks,
   `{{signature}}` / `{{fullSignature}}` = signatures from Settings.
3. Edits are saved in your browser. To publish for everyone: **Settings & data → Export data.js**, replace `data.js` in this folder
   (or the GitHub repo), and redeploy. Anyone with older local edits is offered "Use published version / Keep my edits".
4. **Export JSON backup / Import JSON** moves your edits between browsers; **Reset** returns to the published version.

You can also edit `data.js` directly in any text editor – keep the `window.TEMPLATE_DATA = {...};` structure and bump `version`.
