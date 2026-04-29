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
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mdToPdf } from 'md-to-pdf';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

import { filterOs } from './plugins/filterOs.mjs';
import { applyBoardVars, boardMap } from './plugins/boardVars.mjs';
import { inlineMdxImports } from './plugins/inlineMdxImports.mjs';
import { processAdmonitions } from './plugins/admonitions.mjs';
import { stripMagicComments } from './plugins/stripMagicComments.mjs';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const LAB_MANUALS_SRC = path.join(REPO_ROOT, 'lab_manuals', 'src');
const IMAGES_BASE = path.join(REPO_ROOT, 'lab_manuals', 'static', 'images');
const STYLE_PATH = path.join(__dirname, 'style.css');
const OUTPUT_BASE = path.join(REPO_ROOT, 'lab_manuals', 'pdf');

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

const BOARDS = Object.keys(PAGE_SEQUENCE);
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
// Per-file preprocessing pipeline
// ---------------------------------------------------------------------------

function processFile(content, filePath, board, os) {
  // 1. Strip YAML frontmatter (--- ... ---)
  content = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // 2. Inline MDX .md imports (<PreOverlay />, <PostOverlay />) and strip
  //    all import lines (including @theme/Tabs etc.)
  content = inlineMdxImports(content, filePath, (importedContent, importedPath) =>
    processFile(importedContent, importedPath, board, os)
  );

  // 3. Belt-and-suspenders: strip any remaining import lines
  content = content.replace(/^import\s+\S+\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');

  // 4. Remove JSX comments {/* ... */}
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // 5. Filter <Tabs>/<TabItem> blocks — keep only the target OS
  content = filterOs(content, os);

  // 6. Strip Docusaurus magic comment directives and {highlight} fence syntax
  content = stripMagicComments(content);

  // 7. Apply board variable substitutions (%BOARD%, %BOARD_NAME%, etc.)
  content = applyBoardVars(content, board);

  // 8. Convert :::admonition blocks to styled HTML divs
  content = processAdmonitions(content);

  // 9. Embed images as base64 data URIs so Chromium can always load them
  content = embedImages(content);

  return content;
}

// ---------------------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------------------

function buildCoverPage(board, os) {
  const vars = boardMap[board];
  const osName = os.charAt(0).toUpperCase() + os.slice(1);
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
// Table of contents
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .replace(/<[^>]+>/g, '')   // strip HTML tags
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // remove punctuation
    .trim()
    .replace(/\s+/g, '-');     // spaces → hyphens
}

// A4 full page height in CSS pixels at 96 dpi — used for page number calculation
const A4_PAGE_HEIGHT_PX = 297 * (96 / 25.4); // ≈ 1122 px

/**
 * Render the combined markdown to HTML, open it in a headless browser in print
 * mode, and measure each h1's offsetTop to derive its page number.
 *
 * Returns a Map<headingText, pageNumber>.
 */
async function measureHeadingPages(markdown, css) {
  const html = marked.parse(markdown);
  const fullHtml = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <style>${css}</style>
  </head><body>${html}</body></html>`;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const measurements = await page.evaluate((pageH) => {
      return Array.from(document.querySelectorAll('h1')).map(el => ({
        text: el.textContent.trim(),
        page: Math.floor(el.offsetTop / pageH) + 1,
      }));
    }, A4_PAGE_HEIGHT_PX);

    return new Map(measurements.map(m => [m.text, m.page]));
  } finally {
    await browser.close();
  }
}

function buildToc(markdown, pageMap) {
  const headingRe = /^#{1}\s+(.+)$/gm;
  const items = [];
  let match;
  while ((match = headingRe.exec(markdown)) !== null) {
    const text = match[1].trim();
    items.push({ text, id: slugify(text), page: pageMap?.get(text) ?? null });
  }

  const out = ['<ul class="toc">'];
  for (const { text, id, page } of items) {
    const pageHtml = page != null
      ? `<span class="toc-dots"></span><span class="toc-page">${page}</span>`
      : '';
    out.push(
      `  <li class="toc-h1"><a href="#${id}" class="toc-row">` +
      `<span class="toc-text">${text}</span>${pageHtml}</a></li>`
    );
  }
  out.push('</ul>');

  return `<h1>Table of Contents</h1>\n${out.join('\n')}`;
}

// ---------------------------------------------------------------------------
// Embed images as base64 data URIs
// ---------------------------------------------------------------------------

function embedImages(content) {
  return content.replace(/!\[([^\]]*)\]\(\/images\/([^)]+)\)/g, (match, alt, imgPath) => {
    const fullPath = path.join(IMAGES_BASE, imgPath);
    if (!fs.existsSync(fullPath)) return match; // leave broken ref as-is
    const ext = path.extname(imgPath).toLowerCase().replace('.', '');
    const mime = MIME[ext] ?? 'application/octet-stream';
    const data = fs.readFileSync(fullPath).toString('base64');
    return `![${alt}](data:${mime};base64,${data})`;
  });
}

// ---------------------------------------------------------------------------
// PDF generation for one board+OS combination
// ---------------------------------------------------------------------------

async function generatePdf(board, os) {
  console.log(`Generating ${board} / ${os} ...`);

  const sections = [];
  for (const relPath of PAGE_SEQUENCE[board]) {
    const filePath = path.join(LAB_MANUALS_SRC, relPath);
    const raw = fs.readFileSync(filePath, 'utf8');
    sections.push(processFile(raw, filePath, board, os).trim());
  }

  // --- between sections becomes a CSS page break
  const combined = sections.join('\n\n---\n\n');

  const css = fs.readFileSync(STYLE_PATH, 'utf8');

  // Pass 1: measure heading page numbers from the body content alone,
  // then offset by 2 (cover page + TOC page) to get final page numbers.
  const rawPageMap = await measureHeadingPages(combined, css);
  const FRONT_MATTER_PAGES = 2; // cover + TOC
  const pageMap = new Map([...rawPageMap].map(([k, v]) => [k, v + FRONT_MATTER_PAGES]));

  const cover = buildCoverPage(board, os);
  const toc   = buildToc(combined, pageMap);
  const full  = `${cover}\n\n---\n\n${toc}\n\n---\n\n${combined}`;

  const outputDir = path.join(OUTPUT_BASE, board);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(
    outputDir,
    `Zephyr-Getting-Started_${board}_${os}.pdf`
  );

  await mdToPdf(
    { content: full },
    {
      dest: outputPath,
      css,
      launch_options: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      pdf_options: {
        format: 'A4',
        margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' },
        printBackground: true,
      },
    }
  );

  console.log(`  → ${path.relative(REPO_ROOT, outputPath)}`);
}

// ---------------------------------------------------------------------------
// CLI argument parsing & validation
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let boards = BOARDS;
let osList = OS_LIST;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--board' && args[i + 1]) boards = [args[++i]];
  if (args[i] === '--os' && args[i + 1]) osList = [args[++i]];
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
  for (const os of osList) {
    await generatePdf(board, os);
  }
}
