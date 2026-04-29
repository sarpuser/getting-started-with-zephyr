/**
 * stripMagicComments.mjs
 *
 * Processes fenced code blocks to strip Docusaurus magic comment directives
 * and apply per-line colour/bold annotations for PDF output.
 *
 * When a block contains any magic comments, it is emitted as a raw HTML
 * <pre><code> block with syntax highlighting applied via highlight.js and
 * per-line <span> wrappers for colour annotations.
 *
 * When a block has no magic comments, it is emitted unchanged so that
 * md-to-pdf's built-in highlight.js renderer handles it normally.
 *
 * Annotation mapping:
 *   add-next-line / add-start/end           → green background
 *   highlight-next-line / highlight-start/end → yellow background
 *   bold-next-line / bold-start/end         → bold text
 *   remove-next-line / remove-start/end     → red background (line IS shown)
 *   delete-next-line / delete-start/end     → line hidden entirely
 */

import hljs from 'highlight.js';

// Map Docusaurus/custom language names → highlight.js language names
const LANG_MAP = {
  'bash-session': 'bash',
  'ps-session':   'powershell',
  'dts':          'c',
};

const NEXT_LINE_RE  = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-next-line\s*$/;
const BLOCK_START_RE = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-start\s*$/;
const BLOCK_END_RE  = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-end\s*$/;

export function stripMagicComments(text) {
  const lines = text.split('\n');
  const result = [];

  let inCodeBlock = false;
  let closingFenceRe = null;
  let fencePrefix = '';
  let fenceLang = '';

  // Buffered block state
  let blockLines = [];
  let lineAnnotations = []; // null | 'add' | 'highlight' | 'bold' | 'remove'
  let hasAnnotations = false;

  // null = not set; false = hide; string = annotation type
  let nextAnn = null;
  let blockAnn = null;

  for (const line of lines) {
    if (!inCodeBlock) {
      const m = line.match(/^(\s*)(`{3,}|~{3,})([\w-]*)(\s*\{[^}]*\})?(.*)/);
      if (m) {
        const [, indent, fence, lang, , rest] = m;
        const fc = fence[0];
        fenceLang = LANG_MAP[lang] ?? lang;
        closingFenceRe = new RegExp(`^\\s*${fc === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
        fencePrefix = `${indent}${fence}${fenceLang}${rest || ''}`;
        inCodeBlock = true;
        blockLines = [];
        lineAnnotations = [];
        hasAnnotations = false;
        nextAnn = null;
        blockAnn = null;
      } else {
        result.push(line);
      }
      continue;
    }

    // ── Inside a code block ──────────────────────────────────────────────

    if (closingFenceRe.test(line)) {
      inCodeBlock = false;
      if (hasAnnotations) {
        result.push(renderAnnotatedBlock(fenceLang, blockLines, lineAnnotations));
      } else {
        result.push(fencePrefix);
        result.push(...blockLines);
        result.push(line);
      }
      continue;
    }

    const nextM  = line.match(NEXT_LINE_RE);
    const startM = line.match(BLOCK_START_RE);
    const endM   = line.match(BLOCK_END_RE);

    if (nextM) {
      const type = nextM[2];
      hasAnnotations = true;
      nextAnn = (type === 'delete') ? false : type;
    } else if (startM) {
      const type = startM[2];
      hasAnnotations = true;
      blockAnn = (type === 'delete') ? false : type;
    } else if (endM) {
      blockAnn = null;
    } else {
      // Content line — resolve annotation
      const ann = nextAnn !== null ? nextAnn : blockAnn;
      nextAnn = null;
      if (ann === false) {
        // hidden — skip
      } else {
        blockLines.push(line);
        lineAnnotations.push(ann); // null or 'add'|'highlight'|'bold'|'remove'
        if (ann !== null) hasAnnotations = true;
      }
    }
  }

  return result.join('\n');
}

// ---------------------------------------------------------------------------
// Render an annotated block as syntax-highlighted HTML with coloured lines
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAnnotatedBlock(lang, lines, annotations) {
  const code = lines.join('\n');

  let highlighted;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(code, { language: lang }).value;
    } else {
      highlighted = escapeHtml(code);
    }
  } catch {
    highlighted = escapeHtml(code);
  }

  const htmlLines = highlighted.split('\n');
  const wrapped = htmlLines.map((htmlLine, i) => {
    const ann = annotations[i] ?? null;
    const cls = ann ? ` hl-${ann}` : '';
    return `<span class="code-line${cls}">${htmlLine}</span>`;
  });

  const langClass = lang ? ` language-${lang}` : '';
  return `<pre><code class="hljs${langClass}">${wrapped.join('')}</code></pre>\n`;
}
