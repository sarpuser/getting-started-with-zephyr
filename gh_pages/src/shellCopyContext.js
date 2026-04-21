/**
 * shellCopyContext.js
 *
 * A lightweight React context that lets us pass a custom copy string from
 * the CodeBlock wrapper down to the CopyButton without touching Docusaurus
 * internal APIs.
 *
 * Both the provider (CodeBlock/Content/String.js swizzle) and the consumer
 * (CodeBlock/Buttons/CopyButton/index.js swizzle) import from THIS file so
 * they always share the exact same context object.
 *
 * Context value:
 *   null   → no custom copy behaviour; CopyButton uses the default.
 *   string → copy this string instead of the full code block content.
 *
 * The provider computes the value with the following priority:
 *   1. Shell block  → strip prompts from every line (existing behaviour).
 *   2. Block with highlighted/added lines → copy only those lines.
 *   3. Otherwise   → null (default copy).
 */
import {createContext, useContext} from 'react';

export const ShellCopyContext = createContext(null);

export function useShellCopyCode() {
  return useContext(ShellCopyContext);
}

// ── Shell prompt stripping ───────────────────────────────────────────────────
// Patterns kept in sync with prism-include-languages.js.

const BASH_PROMPT_RE = /^(?:\([^)]+\)\s+)?[^\s$#%!"'<>|\\]*[$#%]\s+/;
const PS_PROMPT_RE   = /^(?:\([^)]+\)\s+)?PS\s+[^\r\n>]*>\s+/i;

export function stripShellPrompts(code, language) {
  if (language === 'bash-session') {
    return code.split('\n').map((l) => l.replace(BASH_PROMPT_RE, '')).join('\n');
  }
  if (language === 'ps-session') {
    return code.split('\n').map((l) => l.replace(PS_PROMPT_RE, '')).join('\n');
  }
  return null; // not a shell-session language
}

// ── Highlighted-lines-only extraction ───────────────────────────────────────
//
// We reproduce just enough of Docusaurus's parseLines logic to identify the
// lines marked with a "copy" colour (yellow = highlight, green = add).
// Red (error) and bold lines are intentionally excluded from the copy.
//
// Two strategies, matching Docusaurus's own priority:
//   1. Metastring ranges  {1,3-5}  — assumed to be yellow highlights.
//   2. Magic comments     // highlight-next-line, // add-next-line, etc.
//
// The two strategies are mutually exclusive in the same block, exactly as
// Docusaurus enforces.

/** Parse a metastring like `{1,3-5}` into a Set of 0-based line indices. */
function parseMetastringRanges(metastring) {
  if (!metastring) return null;
  const match = /\{([\d,\-\s]+)\}/.exec(metastring);
  if (!match) return null;

  const ranges = new Set();
  match[1].split(',').forEach((part) => {
    const trimmed = part.trim();
    const rangeMatch = /^(\d+)-(\d+)$/.exec(trimmed);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10) - 1;
      const end   = parseInt(rangeMatch[2], 10) - 1;
      for (let i = start; i <= end; i++) ranges.add(i);
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n)) ranges.add(n - 1);
    }
  });

  return ranges.size > 0 ? ranges : null;
}

// Matches any magic comment line we recognise (both // and # comment styles).
const ANY_MAGIC_RE = /^\s*(?:\/\/|#)\s*(?:highlight-next-line|highlight-start|highlight-end|add-next-line|add-start|add-end|bold-next-line|bold-start|bold-end|delete-next-line|delete-start|delete-end|remove-next-line|remove-start|remove-end)\s*$/;

// Matches only the "copy" directives (yellow + green).
const COPY_NEXT_RE  = /^\s*(?:\/\/|#)\s*(?:highlight-next-line|add-next-line)\s*$/;
const COPY_START_RE = /^\s*(?:\/\/|#)\s*(?:highlight-start|add-start)\s*$/;
const COPY_END_RE   = /^\s*(?:\/\/|#)\s*(?:highlight-end|add-end)\s*$/;

/**
 * Return a string containing only the highlighted/added lines from rawCode,
 * or null if no such lines exist (caller should fall back to copying everything).
 *
 * @param {string} rawCode   - The raw code string as received by Content/String
 *                             (magic comment lines are still present).
 * @param {string} metastring - The metastring from the code fence, e.g. `{1,3-5}`.
 */
export function getHighlightedOnlyCode(rawCode, metastring) {
  if (typeof rawCode !== 'string') return null;

  const code  = rawCode.replace(/\r?\n$/, '');
  const lines = code.split(/\r?\n/);

  // ── Strategy 1: metastring ranges ─────────────────────────────────────────
  const metaRanges = parseMetastringRanges(metastring);
  if (metaRanges !== null) {
    const highlighted = lines.filter((_, i) => metaRanges.has(i));
    return highlighted.length > 0 ? highlighted.join('\n') : null;
  }

  // ── Strategy 2: magic comments ────────────────────────────────────────────
  const resultLines = [];
  let inCopyBlock   = 0;     // depth of nested highlight-start / add-start blocks
  let nextLineCopy  = false; // set true by highlight-next-line / add-next-line
  let hasAny        = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (ANY_MAGIC_RE.test(line)) {
      // Update copy-block state for the directives we care about.
      if (COPY_NEXT_RE.test(line))       nextLineCopy = true;
      else if (COPY_START_RE.test(line)) inCopyBlock++;
      else if (COPY_END_RE.test(line) && inCopyBlock > 0) inCopyBlock--;
      // All magic comment lines are skipped from the output.
      continue;
    }

    // Regular line: include it if flagged by a "copy" directive.
    if (nextLineCopy || inCopyBlock > 0) {
      resultLines.push(line);
      hasAny = true;
    }
    nextLineCopy = false; // consumed by the first non-magic line after it
  }

  return hasAny ? resultLines.join('\n') : null;
}
