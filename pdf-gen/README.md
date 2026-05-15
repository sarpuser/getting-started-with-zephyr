# PDF Generator

Generates printable PDF lab manuals from the Markdown/MDX source in `lab_manuals/markdown/`. Produces one PDF per board/OS combination (6 total by default: 2 boards × 3 OSes).

To adapt this for a different lab manual, edit **`config.mjs`** only — see [`README-ADAPTING.md`](../README-ADAPTING.md).

## Requirements

- Node.js >= 20
- Google Chrome (system install — Puppeteer uses it directly)

## Setup

```bash
cd pdf-gen
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

`PUPPETEER_SKIP_DOWNLOAD=true` skips the automatic Chromium download and uses your system Chrome instead.

## Usage

```bash
# All PDFs
node generate.mjs

# All OSes for one board
node generate.mjs --board same54

# Single PDF
node generate.mjs --board same54 --os windows
```

Output: `lab_manuals/pdf/<board>/Zephyr-Getting-Started_<board>_<os>.pdf`

## Pipeline

Each source file is processed through:

1. **String pre-processing** — normalizes admonition title syntax for remark-directive
2. **Remark parse** — MDX + GFM + frontmatter + directives
3. **Remark transforms** (in order):
   - `inlineMdxImports` — resolves `_*.md` component imports, strips ESM nodes
   - `filterOs` — filters `<Tabs>`/`<TabItem>` blocks to the target OS
   - `boardVars` — replaces `%VAR%` tokens with board-specific values
   - `admonitions` — converts `:::type{title="..."}` containers to styled divs
   - `stripMagicComments` — processes code block line annotations
   - `pdfPageBreaks` — converts `{/* pdf-page-break */}` markers to PDF page breaks
   - `cleanupMdx` — removes remaining MDX AST nodes
   - `collectH1s` — adds `id` attributes to headings, collects TOC data
4. **remark-rehype** — converts Markdown AST to HTML AST
5. **Rehype transforms** — base64-embed images, syntax highlight, annotate lines
6. **Page assembly** — sections joined with page breaks, cover page and CSS TOC prepended
7. **pagedjs-cli** — renders final PDF using CSS Paged Media

## Key Files

| File | Purpose |
|------|---------|
| `config.mjs` | **All user configuration**: cover text, boards, OS list, page sequence |
| `generate.mjs` | Entry point: processor factory, TOC/cover builder |
| `style.css` | PDF stylesheet (CSS Paged Media: margins, page numbers, TOC) |
| `plugins/boardVars.mjs` | Variable substitution plugin |
| `plugins/filterOs.mjs` | OS tab filtering |
| `plugins/inlineMdxImports.mjs` | MDX import resolution |
| `plugins/admonitions.mjs` | Admonition rendering |

## PDF-Only Page Breaks

Add this marker anywhere in the Markdown/MDX source to force a page break in the generated PDF:

```md
{/* pdf-page-break */}
```

Docusaurus treats the marker as an MDX comment, so it does not render on the website. The PDF generator converts it to a hidden page-break element before pagedjs renders the PDF.

## System Chrome

The generator looks for Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS default). Override with:

```bash
PUPPETEER_EXECUTABLE_PATH="/path/to/chrome" node generate.mjs
```

## Adding a New Board

See [`ADDING_BOARDS.md`](../ADDING_BOARDS.md) for the full checklist.

## Adapting for a Different Lab Manual

See [`ADAPTING_TO_OTHER_LAB_MANUALS.md`](../ADAPTING_TO_OTHER_LAB_MANUALS.md).
