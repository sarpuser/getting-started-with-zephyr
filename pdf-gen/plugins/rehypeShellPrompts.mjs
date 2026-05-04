/**
 * rehypeShellPrompts.mjs
 *
 * Rehype plugin that applies prompt styling to bash-session and ps-session
 * code blocks. Must run after rehype-prism-plus.
 *
 * rehype-prism-plus doesn't know these custom languages, so it leaves them
 * unstyled but still wraps each line in <span class="code-line">. This plugin
 * finds those elements and wraps the prompt portion of each line in
 * <span class="token prompt"> so the CSS can mute it relative to the command.
 *
 * bash-session prompt: anything up to and including $ or # (covers
 *   "$ cmd", "(.venv) $ cmd", "uart:~$ cmd", "root# cmd")
 * ps-session prompt: "PS path> " with optional venv prefix
 */

import { visit } from 'unist-util-visit';

const BASH_PROMPT_RE = /^(.*?[$#]\s?)/;
const PS_PROMPT_RE   = /^((?:.*\s+)?PS\s[^>]+>\s?)/;

export function rehypeShellPrompts() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'code') return;
      const classes = node.properties?.className ?? [];
      const isBash = classes.includes('language-bash-session');
      const isPs   = classes.includes('language-ps-session');
      if (!isBash && !isPs) return;

      const promptRe = isPs ? PS_PROMPT_RE : BASH_PROMPT_RE;

      for (const lineSpan of node.children) {
        if (
          lineSpan.type !== 'element' ||
          lineSpan.tagName !== 'span' ||
          !lineSpan.properties?.className?.includes('code-line')
        ) continue;

        const text = lineSpan.children.map(n => n.value ?? '').join('');
        const m = text.match(promptRe);
        if (!m) continue;

        const prompt  = m[1];
        const command = text.slice(prompt.length);
        lineSpan.children = [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['token', 'prompt'] },
            children: [{ type: 'text', value: prompt }],
          },
          { type: 'text', value: command },
        ];
      }
    });
  };
}
