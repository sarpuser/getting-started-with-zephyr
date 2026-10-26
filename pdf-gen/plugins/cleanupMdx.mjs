/**
 * cleanupMdx.mjs
 *
 * Remark plugin that removes any remaining MDX-specific AST nodes before the
 * tree is handed to remark-rehype for HTML conversion.
 *
 * After remarkResolveMdxImports, remarkFilterOs, and other transforms run,
 * there may still be leftover nodes:
 *  - yaml / toml      — frontmatter (parsed by remark-frontmatter)
 *  - mdxjsEsm         — any import/export statements not already stripped
 *  - mdxJsxFlowElement — block-level JSX (unresolved Docusaurus components)
 *  - mdxJsxTextElement — inline JSX
 *  - mdxFlowExpression — block {/* ... *\/} JSX comments
 *  - mdxTextExpression — inline JSX expressions
 *
 * All of these are silently dropped so they don't appear as raw text in the PDF,
 * except native HTML elements listed in KEEP_HTML_ELEMENTS (e.g. <details>),
 * which are converted to plain HTML elements so their content is preserved.
 */

import { visit, SKIP } from 'unist-util-visit';

const REMOVE_TYPES = new Set([
  'yaml',
  'toml',
  'mdxjsEsm',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
]);

// JSX elements that are plain HTML and should survive into the PDF.
const KEEP_HTML_ELEMENTS = new Set(['details', 'summary']);

export function remarkCleanupMdx() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      // A <summary> on its own line is parsed as inline JSX inside a paragraph;
      // unwrap it so the HTML is <details><summary>, not <details><p><summary>.
      if (
        node.type === 'paragraph' &&
        parent &&
        node.children.length === 1 &&
        node.children[0].type === 'mdxJsxTextElement' &&
        KEEP_HTML_ELEMENTS.has(node.children[0].name)
      ) {
        parent.children[index] = node.children[0];
        return [SKIP, index];
      }
      if (
        (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
        KEEP_HTML_ELEMENTS.has(node.name)
      ) {
        // Print has no way to expand a collapsed <details>, so always render it open.
        const hProperties = node.name === 'details' ? { open: true } : {};
        node.data = { ...node.data, hName: node.name, hProperties };
        return;
      }
      if (REMOVE_TYPES.has(node.type) && parent) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
    });
  };
}
