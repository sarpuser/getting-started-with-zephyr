/**
 * admonitions.mjs
 *
 * Remark plugin that converts containerDirective nodes (from remark-directive)
 * into styled HTML <div> blocks for PDF output.
 *
 * Requires remark-directive to run first during parsing.
 *
 * Because the source files use Docusaurus-style admonition titles like:
 *   :::warning Some title
 * (plain text after the type name), generate.mjs pre-processes the raw source
 * to convert that to remark-directive's attribute syntax:
 *   :::warning{title="Some title"}
 * before parsing.
 *
 * This plugin then sets node.data.hName/hProperties so that remark-rehype
 * produces the correct <div> element, and prepends a title paragraph child.
 */

import { visit } from 'unist-util-visit';

const ICONS = {
  info:    'ℹ',
  note:    '✎',
  tip:     '✔',
  warning: '⚠',
  caution: '⚠',
  danger:  '⛔',
};

export function remarkAdmonitions() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      const type = node.name;
      const icon = ICONS[type] ?? 'ℹ';
      const label =
        node.attributes?.title ??
        type.charAt(0).toUpperCase() + type.slice(1);

      // Tell remark-rehype to render this node as a <div>
      node.data = {
        hName: 'div',
        hProperties: {
          className: ['admonition', `admonition-${type}`],
        },
      };

      // Prepend the title as a <p class="admonition-title"> child
      node.children.unshift({
        type: 'paragraph',
        data: {
          hName: 'p',
          hProperties: { className: ['admonition-title'] },
        },
        children: [{ type: 'text', value: `${icon} ${label}` }],
      });
    });
  };
}
