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
 * All of these are silently dropped so they don't appear as raw text in the PDF.
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

export function remarkCleanupMdx() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (REMOVE_TYPES.has(node.type) && parent) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
    });
  };
}
