/**
 * filterOs.mjs
 *
 * Remark plugin that filters <Tabs>/<TabItem> JSX blocks, keeping only the
 * content for the requested OS and discarding all others.
 *
 * Visits mdxJsxFlowElement nodes named 'Tabs', finds the child TabItem whose
 * `value` attribute matches the target OS, and replaces the whole <Tabs> node
 * with that TabItem's children (already parsed as remark AST nodes).
 */

import { visit, SKIP } from 'unist-util-visit';

export function remarkFilterOs({ os }) {
  return (tree) => {
    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (node.name !== 'Tabs' || !parent) return;

      // Find the TabItem whose value attribute matches the target OS
      const tabItem = node.children.find(
        (child) =>
          child.type === 'mdxJsxFlowElement' &&
          child.name === 'TabItem' &&
          child.attributes?.some(
            (a) => a.name === 'value' && a.value === os
          )
      );

      if (tabItem && tabItem.children.length > 0) {
        // Replace the entire <Tabs> block with the matching TabItem's children
        parent.children.splice(index, 1, ...tabItem.children);
        return [SKIP, index + tabItem.children.length];
      } else {
        // No matching TabItem — remove the entire <Tabs> block
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
    });
  };
}
