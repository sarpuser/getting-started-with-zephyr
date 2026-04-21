/**
 * CodeBlock/Content/String.js  (swizzled – wrap)
 *
 * Wraps the original String renderer with a ShellCopyContext provider that
 * controls what the Copy button puts on the clipboard:
 *
 *   • Shell blocks (bash-session / ps-session)
 *       → copy the full code with prompts stripped  (existing behaviour)
 *
 *   • Any block that contains highlighted (yellow) or added (green) lines
 *       → copy only those lines, discarding unmarked lines
 *
 *   • Everything else
 *       → null in context → CopyButton falls back to its default behaviour
 */
import React from 'react';
import OriginalStringContent from '@theme-original/CodeBlock/Content/String';
import {
  ShellCopyContext,
  stripShellPrompts,
  getHighlightedOnlyCode,
} from '@site/src/shellCopyContext';

function getLanguage(className, language) {
  if (language) return language;
  const match = /language-(\S+)/.exec(className ?? '');
  return match ? match[1] : null;
}

export default function CodeBlockContentString({children, ...props}) {
  const lang    = getLanguage(props.className, props.language);
  const isShell = lang === 'bash-session' || lang === 'ps-session';

  let copyContent = null;

  if (typeof children === 'string') {
    try {
      if (isShell) {
        // Shell blocks: always strip prompts from the full code.
        copyContent = stripShellPrompts(children, lang);
      } else {
        // Non-shell blocks: if any lines are highlighted/added, copy only those.
        copyContent = getHighlightedOnlyCode(children, props.metastring);
        // Returns null when no highlighted lines exist → default copy behaviour.
      }
    } catch (e) {
      // Safety net: if anything goes wrong, fall back to default copy behaviour.
      copyContent = null;
    }
  }

  return (
    <ShellCopyContext.Provider value={copyContent}>
      <OriginalStringContent {...props}>{children}</OriginalStringContent>
    </ShellCopyContext.Provider>
  );
}
