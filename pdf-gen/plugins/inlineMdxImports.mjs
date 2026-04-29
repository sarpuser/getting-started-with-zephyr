/**
 * inlineMdxImports.mjs
 *
 * Handles two MDX patterns:
 *
 * 1. Strips all `import X from '...'` lines (both .md and @theme/* imports).
 * 2. For imports from .md files (e.g. `import PreOverlay from './_lab3-pre-overlay.md'`),
 *    replaces self-closing component usages (`<PreOverlay />`) with the processed
 *    content of that file.
 *
 * The `processFileFn` callback is called recursively so that the inlined content
 * goes through the full pipeline (frontmatter stripping, OS filtering, etc.).
 */

import fs from 'fs';
import path from 'path';

export function inlineMdxImports(text, filePath, processFileFn) {
  const fileDir = path.dirname(filePath);

  // Collect only .md imports → component name to absolute path
  const importMap = {};
  const mdImportRegex = /^import\s+(\w+)\s+from\s+['"]([^'"]+\.md)['"]\s*;?\s*$/gm;
  let match;
  while ((match = mdImportRegex.exec(text)) !== null) {
    const [, componentName, importPath] = match;
    importMap[componentName] = path.resolve(fileDir, importPath);
  }

  // Strip ALL import lines (both .md and package imports like @theme/Tabs)
  let result = text.replace(/^import\s+\S+\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');

  // Replace <ComponentName /> usages with inlined processed content
  for (const [name, importedPath] of Object.entries(importMap)) {
    const componentRegex = new RegExp(`^[ \t]*<${name}\\s*/>[ \t]*$`, 'gm');
    result = result.replace(componentRegex, () => {
      const importedContent = fs.readFileSync(importedPath, 'utf8');
      return processFileFn(importedContent, importedPath);
    });
  }

  return result;
}
