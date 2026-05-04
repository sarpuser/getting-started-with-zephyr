/**
 * rehypeAnnotateLines.mjs
 *
 * Rehype plugin that applies Docusaurus magic-comment annotation classes to
 * per-line spans. Must run after rehype-prism-plus.
 *
 * remarkMagicComments (remark phase) strips magic comment lines from the code
 * and stores the per-line annotation array as a hProperty (ANNOTATIONS_PROP).
 * mdast-util-to-hast passes that through to the hast code element unchanged.
 * rehype-prism-plus then highlights the block and wraps each line in
 * <span class="code-line">. This plugin reads the annotation array and pushes
 * hl-add / hl-highlight / hl-bold / hl-remove onto the matching line spans.
 */

import { visit } from 'unist-util-visit';
import { ANNOTATIONS_PROP } from './stripMagicComments.mjs';

export function rehypeAnnotateLines() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'code') return;
      const json = node.properties?.[ANNOTATIONS_PROP];
      if (!json) return;

      const annotations = JSON.parse(json);
      delete node.properties[ANNOTATIONS_PROP];

      let lineIdx = 0;
      for (const child of node.children) {
        if (
          child.type === 'element' &&
          child.tagName === 'span' &&
          Array.isArray(child.properties?.className) &&
          child.properties.className.includes('code-line')
        ) {
          const ann = annotations[lineIdx];
          if (ann) child.properties.className.push(`hl-${ann}`);
          lineIdx++;
        }
      }
    });
  };
}
