/**
 * stripMagicComments.mjs
 *
 * Remark plugin that visits `code` AST nodes and processes Docusaurus magic
 * comment directives (add-next-line, highlight-start/end, etc.).
 *
 * Magic comment lines are stripped from node.value. For annotated blocks,
 * the per-line annotation array is stored as a hProperty (key: ANNOTATIONS_PROP)
 * so that rehypeAnnotateLines can apply per-line class
 * names after rehype-prism-plus wraps each line in <span class="code-line">.
 * The node stays as a `code` node in both cases.
 *
 * Annotation mapping:
 *   add-next-line / add-start/end           → green background (.hl-add)
 *   highlight-next-line / highlight-start/end → yellow background (.hl-highlight)
 *   bold-next-line / bold-start/end         → bold text (.hl-bold)
 *   remove-next-line / remove-start/end     → red background (.hl-remove)
 *   delete-next-line / delete-start/end     → line hidden entirely
 */

import { visit } from 'unist-util-visit';

// Shared key used to pass annotation data from this remark plugin through
// mdast-util-to-hast hProperties and into the rehypeAnnotateLines rehype plugin.
// mdast-util-to-hast spreads hProperties via Object.assign (no normalisation),
// so the key must be identical in both places — this export enforces that.
export const ANNOTATIONS_PROP = 'dataAnnotations';

// Map Docusaurus/custom language names → Prism language names
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

      // Strip magic comment lines and update the code value
      node.value = codeLines.join('\n');
      // Normalize language name (e.g. 'dts' → 'c' for Prism)
      if (LANG_MAP[rawLang]) node.lang = lang;

      if (hasAnnotations) {
        // Store annotation array as a hast property so rehypeAnnotateLines
        // can apply per-line classes after rehype-prism-plus highlights the block.
        node.data = node.data ?? {};
        node.data.hProperties = node.data.hProperties ?? {};
        node.data.hProperties[ANNOTATIONS_PROP] = JSON.stringify(annotations);
      }
    });
  };
}
