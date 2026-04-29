/**
 * admonitions.mjs
 *
 * Converts Docusaurus admonition syntax into styled HTML <div> blocks so that
 * different admonition types can be coloured independently in the PDF.
 *
 * Input:
 *   :::warning Some title
 *   Content with **bold** and `inline code`.
 *
 *   Second paragraph.
 *   :::
 *
 * Output (raw HTML passed through md-to-pdf / marked):
 *   <div class="admonition admonition-warning">
 *   <p class="admonition-title">⚠ Warning</p>
 *   <p>Content with <strong>bold</strong> and <code>inline code</code>.</p>
 *   <p>Second paragraph.</p>
 *   </div>
 */

const ICONS = {
  info:    'ℹ',
  note:    '✎',
  tip:     '✔',
  warning: '⚠',
  caution: '⚠',
  danger:  '⛔',
};

export function processAdmonitions(text) {
  const lines = text.split('\n');
  const result = [];
  let inAdmonition = false;
  let admonitionType = '';
  let admonitionLabel = '';
  let contentLines = [];

  for (const line of lines) {
    const openMatch = line.match(/^:::([\w]+)(?:\s+(.+))?$/);
    const isClose = !openMatch && /^:::\s*$/.test(line);

    if (!inAdmonition && openMatch) {
      inAdmonition = true;
      admonitionType = openMatch[1];
      admonitionLabel =
        openMatch[2] ?? admonitionType.charAt(0).toUpperCase() + admonitionType.slice(1);
      contentLines = [];
    } else if (inAdmonition && isClose) {
      result.push(renderAdmonition(admonitionType, admonitionLabel, contentLines.join('\n')));
      inAdmonition = false;
      contentLines = [];
    } else if (inAdmonition) {
      contentLines.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAdmonition(type, label, rawContent) {
  const icon = ICONS[type] ?? 'ℹ';
  const paragraphs = rawContent
    .trim()
    .split(/\n\n+/)
    .filter(p => p.trim());
  const htmlBody = paragraphs
    .map(p => `<p>${inlineMd(p.trim().replace(/\n/g, ' '))}</p>`)
    .join('\n');
  return [
    `<div class="admonition admonition-${type}">`,
    `<p class="admonition-title">${icon} ${label}</p>`,
    htmlBody,
    `</div>`,
    '',
  ].join('\n');
}

/** Convert the most common inline Markdown to HTML. */
function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
