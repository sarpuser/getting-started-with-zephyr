/**
 * filterOs.mjs
 *
 * Processes <Tabs groupId="os"><TabItem value="..."> blocks in MDX source,
 * keeping only the content for the requested OS and discarding the others.
 *
 * Uses a line-by-line state machine to handle nested content (code blocks,
 * images, etc.) inside each TabItem without needing a full JSX parser.
 */

export function filterOs(text, os) {
  const lines = text.split('\n');
  const result = [];

  // States: 'outside' | 'in_tabs' | 'capturing' | 'skipping'
  let state = 'outside';
  let captureBuffer = [];
  let captureIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (state === 'outside') {
      if (/^<Tabs(\s[^>]*)?>/.test(trimmed)) {
        state = 'in_tabs';
        captureBuffer = [];
      } else {
        result.push(line);
      }
    } else if (state === 'in_tabs') {
      if (/^<\/Tabs>/.test(trimmed)) {
        // Emit captured content, trimming leading/trailing blank lines
        result.push(...trimBlankLines(captureBuffer));
        state = 'outside';
        captureBuffer = [];
      } else if (new RegExp(`<TabItem[^>]*\\bvalue="${os}"[^>]*>`).test(trimmed)) {
        // Detect how many spaces this <TabItem> line is indented
        captureIndent = line.match(/^(\s*)/)[1].length;
        state = 'capturing';
        captureBuffer = [];
      } else if (/<TabItem[^>]*>/.test(trimmed)) {
        state = 'skipping';
      }
      // Other content inside <Tabs> but outside a <TabItem> is ignored
    } else if (state === 'capturing') {
      if (/^<\/TabItem>/.test(trimmed)) {
        state = 'in_tabs';
        // captureBuffer accumulates across multiple TabItem closings
        // (only one is ever kept, so no merging needed)
      } else {
        // Strip the TabItem's own indentation level from each captured line
        const stripped =
          line.length >= captureIndent && line.startsWith(' '.repeat(captureIndent))
            ? line.slice(captureIndent)
            : line;
        captureBuffer.push(stripped);
      }
    } else if (state === 'skipping') {
      if (/^<\/TabItem>/.test(trimmed)) {
        state = 'in_tabs';
      }
      // Discard all other lines
    }
  }

  return result.join('\n');
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length - 1;
  while (start <= end && lines[start].trim() === '') start++;
  while (end >= start && lines[end].trim() === '') end--;
  return lines.slice(start, end + 1);
}
