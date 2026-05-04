/**
 * generate.mjs
 *
 * Entry point for PDF generation.
 *
 * Usage:
 *   node generate.mjs                              # generate all 6 PDFs
 *   node generate.mjs --board same54               # all OSes for one board
 *   node generate.mjs --board same54 --os windows  # single PDF
 *
 * Output: lab_manuals/pdf/<board>/Zephyr-Getting-Started_<board>_<os>.pdf
 *
 * Pipeline (per source file):
 *   1. String pre-processing: normalize admonition titles
 *   2. unified parse: remark-parse + remark-mdx + remark-gfm +
 *      remark-frontmatter + remark-directive
 *   3. Remark transforms (AST visitors):
 *      remarkResolveMdxImports → remarkFilterOs → remarkBoardVars →
 *      remarkAdmonitions → remarkMagicComments → remarkCleanupMdx →
 *      remarkCollectH1s (adds id attrs + collects headings for TOC)
 *   4. remark-rehype (mdast → hast)
 *   5. Rehype transforms: rehypeEmbedImages → rehype-highlight
 *   6. rehype-stringify → HTML string
 *   7. Sections joined with <hr> (CSS page-break-after: always)
 *   8. Cover page + TOC (using CSS target-counter for page numbers) prepended
 *   9. Full HTML written to temp file → pagedjs-cli renders PDF
 */

import fs from 'fs';
import nodeOs from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { VFile } from 'vfile';
import { visit } from 'unist-util-visit';

import { remarkResolveMdxImports } from './plugins/inlineMdxImports.mjs';
import { remarkFilterOs } from './plugins/filterOs.mjs';
import { remarkBoardVars, boardMap } from './plugins/boardVars.mjs';
import { remarkAdmonitions } from './plugins/admonitions.mjs';
import { remarkMagicComments } from './plugins/stripMagicComments.mjs';
import { remarkCleanupMdx } from './plugins/cleanupMdx.mjs';

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname     = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT     = path.resolve(__dirname, '..');
const LAB_MANUALS_SRC = path.join(REPO_ROOT, 'lab_manuals', 'src');
const IMAGES_BASE   = path.join(REPO_ROOT, 'lab_manuals', 'static', 'images');
const STYLE_PATH    = path.join(__dirname, 'style.css');
const OUTPUT_BASE   = path.join(REPO_ROOT, 'lab_manuals', 'pdf');
const PAGEDJS_BIN   = path.join(__dirname, 'node_modules', '.bin', 'pagedjs-cli');

// ---------------------------------------------------------------------------
// Page assembly order per board
// ---------------------------------------------------------------------------

const PAGE_SEQUENCE = {
  same54: [
    'home.md',
    'same54/index.md',
    'shared/lab1.md',
    'shared/lab2.md',
    'same54/lab3.md',
    'appendices/appendix-a.md',
    'appendices/appendix-b.md',
    'appendices/appendix-c.md',
    'appendices/appendix-d.md',
  ],
  pic32bz6: [
    'home.md',
    'pic32bz6/index.md',
    'pic32bz6/additional-software-setup.md',
    'shared/lab1.md',
    'shared/lab2.md',
    'pic32bz6/lab3.md',
    'appendices/appendix-a.md',
    'appendices/appendix-b.md',
    'appendices/appendix-c.md',
    'appendices/appendix-d.md',
  ],
};

const BOARDS  = Object.keys(PAGE_SEQUENCE);
const OS_LIST = ['linux', 'macos', 'windows'];

// MIME types for base64 image embedding
const MIME = {
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  gif:  'image/gif',
  svg:  'image/svg+xml',
  webp: 'image/webp',
};

// ---------------------------------------------------------------------------
// String pre-processing: normalize admonition title syntax
//
// remark-directive expects :::type{title="..."}
// Docusaurus source files use    :::type Some title
// ---------------------------------------------------------------------------

function normalizeAdmonitionTitles(text) {
  return text.replace(/^:::([\w]+)(?:\s+(.+))?$/gm, (match, type, title) =>
    title ? `:::${type}{title="${title}"}` : match
  );
}

// ---------------------------------------------------------------------------
// Custom highlight.js language definitions for shell sessions
// ---------------------------------------------------------------------------

// bash-session: matches any prompt ending in $ or # (covers "$ ", "(.venv) $ ",
// "uart:~$ ", "root# ", etc.) then highlights the rest as bash
function bashSession(hljs) {
  return {
    name: 'Bash Session',
    contains: [{
      className: 'meta.prompt',
      begin: /^.*?[$#]\s?/,
      starts: { end: /[^\\](?=\s*$)/, subLanguage: 'bash' },
    }],
  };
}

// ps-session: matches optional venv prefix + "PS path> " then highlights as powershell
function psSession(hljs) {
  return {
    name: 'PowerShell Session',
    contains: [{
      className: 'meta.prompt',
      begin: /^(?:.*\s+)?PS\s[^>]+>\s?/,
      starts: { end: /[^\\](?=\s*$)/, subLanguage: 'powershell' },
    }],
  };
}

// ---------------------------------------------------------------------------
// Rehype plugin: embed /images/... as base64 data URIs
// ---------------------------------------------------------------------------

function rehypeEmbedImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const src = node.properties?.src;
      if (!src?.startsWith('/images/')) return;
      const imgPath = path.join(IMAGES_BASE, src.slice('/images/'.length));
      if (!fs.existsSync(imgPath)) return;
      const ext  = path.extname(imgPath).toLowerCase().slice(1);
      const mime = MIME[ext] ?? 'application/octet-stream';
      const data = fs.readFileSync(imgPath).toString('base64');
      node.properties.src = `data:${mime};base64,${data}`;
    });
  };
}

// ---------------------------------------------------------------------------
// Remark plugin: collect h1 headings and add id attributes
// ---------------------------------------------------------------------------

function extractNodeText(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.children) return node.children.map(extractNodeText).join('');
  return '';
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function remarkCollectH1s({ headingsArr }) {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      if (node.depth !== 1) return;
      const text = extractNodeText(node);
      const id   = slugify(text);
      node.data = node.data ?? {};
      node.data.hProperties = { ...(node.data.hProperties ?? {}), id };
      headingsArr.push({ text, id });
    });
  };
}

// ---------------------------------------------------------------------------
// Unified processor factory
// ---------------------------------------------------------------------------

/**
 * Returns a processor that parses and applies all remark transforms.
 * Does NOT include the rehype conversion — used for imported .md files
 * (which need to be inlined as AST nodes, not serialised to HTML).
 */
function createTransformProcessor(board, targetOs) {
  // processImportedFile is defined inside the factory so it can close over
  // createTransformProcessor for recursive imports without a circular dep.
  function processImportedFile(filePath) {
    const content    = fs.readFileSync(filePath, 'utf8');
    const normalized = normalizeAdmonitionTitles(content);
    const file       = new VFile({ path: filePath, value: normalized });
    const proc       = createTransformProcessor(board, targetOs);
    const tree       = proc.parse(file);
    proc.runSync(tree, file);
    return tree;
  }

  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkDirective)
    .use(remarkResolveMdxImports, { processImportedFile })
    .use(remarkFilterOs, { os: targetOs })
    .use(remarkBoardVars, { board })
    .use(remarkAdmonitions)
    .use(remarkMagicComments)
    .use(remarkCleanupMdx);
}

// ---------------------------------------------------------------------------
// Process a single source file → { html, headings }
// ---------------------------------------------------------------------------

function processSourceFile(filePath, board, targetOs) {
  const content    = fs.readFileSync(filePath, 'utf8');
  const normalized = normalizeAdmonitionTitles(content);
  const file       = new VFile({ path: filePath, value: normalized });

  const headingsArr = [];

  const result = createTransformProcessor(board, targetOs)
    .use(remarkCollectH1s, { headingsArr })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeEmbedImages)
    .use(rehypeHighlight, {
      ignoreMissing: true,
      languages: { 'bash-session': bashSession, 'ps-session': psSession },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(file);

  return { html: String(result), headings: headingsArr };
}

// ---------------------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------------------

function buildCoverPage(board, targetOs) {
  const vars   = boardMap[board];
  const osName = targetOs.charAt(0).toUpperCase() + targetOs.slice(1);
  return [
    '<div class="cover-page">',
    '  <p class="cover-label">Microchip Technology</p>',
    '  <h1 class="cover-title">Getting Started<br>with Zephyr RTOS</h1>',
    `  <p class="cover-board">${vars.BOARD_NAME}</p>`,
    `  <p class="cover-os">${osName}</p>`,
    '</div>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Table of contents — page numbers via CSS target-counter (pagedjs)
// ---------------------------------------------------------------------------

function buildToc(headings) {
  const items = headings
    .map(
      ({ text, id }) =>
        `  <li class="toc-entry">` +
        `<a class="toc-title" href="#${id}">${text}</a>` +
        `<span class="toc-fill"></span>` +
        `<span class="toc-num" data-ref="#${id}"></span>` +
        `</li>`
    )
    .join('\n');

  return [
    '<nav class="toc">',
    '<h1>Table of Contents</h1>',
    '<ul>',
    items,
    '</ul>',
    '</nav>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Render PDF with pagedjs-cli
// ---------------------------------------------------------------------------

// Path to system Chrome — pagedjs-cli uses puppeteer which respects this env var
const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function renderPdf(htmlPath, outputPath) {
  await execFileAsync(
    PAGEDJS_BIN,
    ['--inputs', htmlPath, '--output', outputPath, '--timeout', '120000'],
    {
      cwd: __dirname,
      env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: CHROME_PATH },
    }
  );
}

// ---------------------------------------------------------------------------
// PDF generation for one board+OS combination
// ---------------------------------------------------------------------------

async function generatePdf(board, targetOs) {
  console.log(`Generating ${board} / ${targetOs} ...`);

  const allHeadings      = [];
  const sectionHtmlParts = [];

  for (const relPath of PAGE_SEQUENCE[board]) {
    const filePath = path.join(LAB_MANUALS_SRC, relPath);
    const { html, headings } = processSourceFile(filePath, board, targetOs);
    allHeadings.push(...headings);
    sectionHtmlParts.push(html);
  }

  const css   = fs.readFileSync(STYLE_PATH, 'utf8');
  const cover = buildCoverPage(board, targetOs);
  const toc   = buildToc(allHeadings);
  // Sections separated by <hr> — CSS renders hr as page-break-after: always
  const body  = sectionHtmlParts.join('\n<hr>\n');

  // cover → toc and toc → body page breaks come from the named page transitions
  // (page: cover / page: toc in CSS). Only body sections need explicit <hr>.
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>${css}</style>
</head>
<body>
${cover}
${toc}
${body}
</body>
</html>`;

  const outputDir = path.join(OUTPUT_BASE, board);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    `Zephyr-Getting-Started_${board}_${targetOs}.pdf`
  );

  const tmpPath = path.join(
    nodeOs.tmpdir(),
    `pdf-gen-${board}-${targetOs}-${Date.now()}.html`
  );
  fs.writeFileSync(tmpPath, fullHtml, 'utf8');

  try {
    await renderPdf(tmpPath, outputPath);
    console.log(`  → ${path.relative(REPO_ROOT, outputPath)}`);
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

// ---------------------------------------------------------------------------
// CLI argument parsing & validation
// ---------------------------------------------------------------------------

const args   = process.argv.slice(2);
let boards   = BOARDS;
let osList   = OS_LIST;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--board' && args[i + 1]) boards = [args[++i]];
  if (args[i] === '--os'    && args[i + 1]) osList = [args[++i]];
}

for (const b of boards) {
  if (!PAGE_SEQUENCE[b]) {
    console.error(`Unknown board: "${b}". Valid boards: ${BOARDS.join(', ')}`);
    process.exit(1);
  }
}
for (const o of osList) {
  if (!OS_LIST.includes(o)) {
    console.error(`Unknown OS: "${o}". Valid options: ${OS_LIST.join(', ')}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

for (const board of boards) {
  for (const targetOs of osList) {
    await generatePdf(board, targetOs);
  }
}
