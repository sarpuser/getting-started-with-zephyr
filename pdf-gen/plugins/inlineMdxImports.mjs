/**
 * inlineMdxImports.mjs
 *
 * Remark plugin that resolves .md component imports in MDX source files.
 *
 * It handles two MDX patterns:
 * 1. `import X from './path.md'` — collected from mdxjsEsm nodes
 * 2. `<X />` — self-closing mdxJsxFlowElement replaced with the processed AST
 *
 * All mdxjsEsm nodes (imports/exports, whether .md or @theme/*) are removed.
 *
 * The `processImportedFile` option is a function (filePath) → mdast tree
 * that runs the full pipeline recursively on imported files.
 */

import fs from 'fs';
import path from 'path';
import { visit, SKIP } from 'unist-util-visit';

export function remarkResolveMdxImports({ processImportedFile }) {
  return (tree, file) => {
    const fileDir = path.dirname(file.path ?? '');

    // 1. Collect .md imports: componentName → absolutePath
    // Use matchAll (with /g) because remark-mdx groups all import statements
    // into a single mdxjsEsm node — match() without /g would only capture the first.
    const importMap = {};
    visit(tree, 'mdxjsEsm', (node) => {
      const matches = node.value?.matchAll(
        /import\s+(\w+)\s+from\s+['"]([^'"]+\.md)['"]/g
      ) ?? [];
      for (const m of matches) {
        importMap[m[1]] = path.resolve(fileDir, m[2]);
      }
    });

    // 2. Remove ALL mdxjsEsm nodes (imports, exports)
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      if (parent) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
    });

    // 3. Replace <ComponentName /> with the processed content of the imported file
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (node.name in importMap && parent) {
        const importedTree = processImportedFile(importMap[node.name]);
        parent.children.splice(index, 1, ...importedTree.children);
        return [SKIP, index + importedTree.children.length];
      }
    });
  };
}
