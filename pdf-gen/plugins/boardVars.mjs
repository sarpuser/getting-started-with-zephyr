/**
 * boardVars.mjs
 *
 * Remark plugin that replaces %PLACEHOLDER% tokens in text, inline code, and
 * fenced code block content based on the target board.
 *
 * Adapted from gh_pages/plugins/remarkBoardVars.mjs.
 */

import { visit } from 'unist-util-visit';

function replaceVars(str, vars) {
  return str.replace(/%(\w+)%/g, (_, key) => vars[key] ?? `%${key}%`);
}

// vars: the substitution map for the current board (from config.mjs).
// Pass an empty object or omit the "vars" key in config to disable substitution.
export function remarkBoardVars({ vars }) {
  return (tree) => {
    if (!vars || Object.keys(vars).length === 0) return;
    visit(tree, (node) => {
      if (
        node.type === 'text' ||
        node.type === 'inlineCode' ||
        node.type === 'code'
      ) {
        node.value = replaceVars(node.value, vars);
      }
    });
  };
}
