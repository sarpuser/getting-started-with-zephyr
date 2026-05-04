# Lab Manual Source

This directory is the single source of truth for all lab manual content, consumed by both the Docusaurus site (`gh_pages/`) and the PDF generator (`pdf-gen/`).

## Directory Structure

```
src/
├── home.md                       # Intro/cover page (all boards)
├── shared/                       # Content shared across all boards
│   ├── lab1.md
│   ├── lab2.md
│   ├── _lab3-pre-overlay.md      # MDX import fragment — shared lab 3 intro (no H1)
│   └── _lab3-post-overlay.md     # MDX import fragment — shared lab 3 closing content
├── same54/                       # SAM E54 board-specific content
│   ├── index.md                  # Board overview (sidebar_position: 1)
│   └── lab3.md                   # Board-specific lab (imports shared overlays)
├── pic32bz6/                     # PIC32BZ6 board-specific content
│   ├── index.md
│   ├── additional-software-setup.md
│   └── lab3.md
└── appendices/
    ├── appendix-a.md
    ├── appendix-b.md
    ├── appendix-c.md
    └── appendix-d.md
```

Files prefixed with `_` are MDX import fragments and are excluded from the Docusaurus sidebar automatically.

## Board Variables

Placeholders in the form `%VAR%` are substituted at build time with board-specific values:

| Variable | Example value |
|----------|---------------|
| `%BOARD%` | `same54_xpro` |
| `%BOARD_NAME%` | `SAM E54 Xplained Pro` |
| `%FLASH_ARGS_LINUX%` | `--openocd ...` or empty |
| `%FLASH_ARGS_MACOS%` | `--openocd ...` or empty |
| `%FLASH_ARGS_WIN%` | `--openocd ...` or empty |

Variable values are defined in two places (keep them in sync):
- `gh_pages/plugins/remarkBoardVars.mjs`
- `pdf-gen/plugins/boardVars.mjs`

## OS Tabs

Content that differs by OS is wrapped in MDX `<Tabs>`/`<TabItem>` blocks with `value` set to `linux`, `macos`, or `windows`. Docusaurus renders them as interactive tabs; the PDF generator filters them to produce one PDF per OS.

## Images

Images live in `../static/images/` and are referenced in markdown as `/images/<path>`:

```
lab_manuals/static/images/
├── lab1/       # Images for shared/lab1.md
├── lab2/       # Images for shared/lab2.md
├── lab3/       # Images for lab3.md files
└── same54/     # Board-specific images
```

Add a `<board>/` subdirectory here for any new board's images.

## Adding a New Board

See [`ADDING_BOARDS.md`](../../ADDING_BOARDS.md) for the full checklist.
