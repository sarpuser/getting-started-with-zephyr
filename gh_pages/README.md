# Docusaurus Site (gh_pages)

The Docusaurus site that serves the lab manuals online. Reads content from `lab_manuals/markdown/` directly — no content duplication.

Live site: [sarpuser.github.io/getting-started-with-zephyr](https://sarpuser.github.io/getting-started-with-zephyr/)

## Setup

```bash
cd gh_pages
pnpm install
```

## Development

```bash
pnpm start     # dev server with hot reload at localhost:3000
pnpm build     # production build → build/
pnpm serve     # serve the built site locally
```

## Deployment

Deployed to GitHub Pages via the `gh-pages` branch. CI handles this automatically on push to `main`. To deploy manually:

```bash
pnpm deploy
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `docusaurus.config.js` | Site config, navbar items, board sidebars, plugins |
| `sidebars.js` | Sidebar structure (auto-generated from `lab_manuals/markdown/<board>/`) |
| `plugins/remarkBoardVars.mjs` | Replaces `%VAR%` tokens based on the file's board directory |

## How Board Routing Works

Docusaurus serves content from `lab_manuals/markdown/` with `shared/` excluded. Each board directory (`same54/`, `pic32bz6/`) becomes its own sidebar section. The `remarkBoardVars` plugin detects which board a file belongs to from its file path and substitutes board-specific variables.

## Adding a New Board

See [`ADDING_BOARDS.md`](../ADDING_BOARDS.md) for the full checklist.
