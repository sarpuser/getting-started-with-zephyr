/**
 * stripMagicComments.mjs
 *
 * Remark plugin that visits `code` AST nodes and processes Docusaurus magic
 * comment directives (add-next-line, highlight-start/end, etc.).
 *
 * For blocks WITH annotations: converts the node to a raw `html` node
 * containing syntax-highlighted HTML with per-line <span> wrappers.
 * highlight.js is used directly so we control per-line rendering.
 *
 * For blocks WITHOUT annotations: updates node.value (deletes hidden lines,
 * applies the language name mapping) and leaves the node as a `code` node
 * for rehype-highlight to handle.
 *
 * Annotation mapping:
 *   add-next-line / add-start/end           → green background (.hl-add)
 *   highlight-next-line / highlight-start/end → yellow background (.hl-highlight)
 *   bold-next-line / bold-start/end         → bold text (.hl-bold)
 *   remove-next-line / remove-start/end     → red background (.hl-remove)
 *   delete-next-line / delete-start/end     → line hidden entirely
 */

import hljs from 'highlight.js';
import { visit } from 'unist-util-visit';

// Map Docusaurus/custom language names → highlight.js language names
const LANG_MAP = {
  'dts': 'c',
};

const NEXT_LINE_RE   = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-next-line\s*$/;
const BLOCK_START_RE = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-start\s*$/;
const BLOCK_END_RE   = /^\s*(\/\/|#)\s*(add|highlight|bold|remove|delete)-end\s*$/;

export function remarkMagicComments() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      const rawLang = node.lang ?? '';
      const lang = LANG_MAP[rawLang] ?? rawLang;

      const inputLines = (node.value ?? '').split('\n');
      const codeLines = [];
      const annotations = []; // null | 'add' | 'highlight' | 'bold' | 'remove'
      let hasAnnotations = false;
      let nextAnn = null;   // annotation for next content line
      let blockAnn = null;  // active block annotation

      for (const line of inputLines) {
        const nextM  = line.match(NEXT_LINE_RE);
        const startM = line.match(BLOCK_START_RE);
        const endM   = line.match(BLOCK_END_RE);

        if (nextM) {
          const type = nextM[2];
          hasAnnotations = true;
          nextAnn = type === 'delete' ? false : type;
        } else if (startM) {
          const type = startM[2];
          hasAnnotations = true;
          blockAnn = type === 'delete' ? false : type;
        } else if (endM) {
          blockAnn = null;
        } else {
          const ann = nextAnn !== null ? nextAnn : blockAnn;
          nextAnn = null;
          if (ann === false) {
            // hidden line — skip
          } else {
            codeLines.push(line);
            annotations.push(ann); // null or 'add'|'highlight'|'bold'|'remove'
            if (ann !== null) hasAnnotations = true;
          }
        }
      }

      if (hasAnnotations) {
        // Annotated blocks: raw HTML with hljs highlighting + per-line spans
        node.type = 'html';
        node.value = renderAnnotatedBlock(lang, codeLines, annotations);
        delete node.lang;
        delete node.meta;
      } else {
        // Plain block: update value (delete lines stripped) and normalize lang
        node.value = codeLines.join('\n');
        if (LANG_MAP[rawLang]) node.lang = lang;
      }
    });
  };
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

/**
 * Split hljs-highlighted HTML at newlines, properly closing and reopening
 * any <span> tags that span across line boundaries. This prevents double-
 * background stacking when a multi-line hljs token (e.g. a C block comment)
 * overlaps with per-line annotation spans.
 */
function splitHlLines(html) {
  const result = [];
  let line = '';
  const openTags = []; // stack of opening <span ...> strings currently open
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      const tagEnd = html.indexOf('>', i);
      const tag = html.slice(i, tagEnd + 1);
      i = tagEnd + 1;

      if (tag.startsWith('</span')) {
        openTags.pop();
      } else if (tag.startsWith('<span')) {
        openTags.push(tag);
      }
      line += tag;
    } else if (html[i] === '\n') {
      // Close all currently open spans before ending the line
      for (let j = openTags.length - 1; j >= 0; j--) {
        line += '</span>';
      }
      result.push(line);
      // Reopen those spans at the start of the next line
      line = openTags.join('');
      i++;
    } else {
      line += html[i];
      i++;
    }
  }

  if (line) result.push(line);
  return result;
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

  const htmlLines = splitHlLines(highlighted);
  const wrapped = htmlLines.map((htmlLine, i) => {
    const ann = annotations[i] ?? null;
    const cls = ann ? ` hl-${ann}` : '';
    return `<span class="code-line${cls}">${htmlLine}</span>`;
  });

  const langClass = lang ? ` language-${lang}` : '';
  return `<pre><code class="hljs${langClass}">${wrapped.join('')}</code></pre>\n`;
}
