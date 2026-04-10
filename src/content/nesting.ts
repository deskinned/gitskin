//! CSS nesting resolver — replaces & with resolved selectors, splits blocks
export function unwrapNesting(css: string, selector: string): string {
  const lines = css.split('\n');
  const topLevel: string[] = [];
  const blocks: string[] = [];

  let depth = 0;
  let currentBlock: string[] = [];
  let inNestedBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!inNestedBlock && depth === 0 && trimmed.startsWith('&')) {
      inNestedBlock = true;
      currentBlock = [trimmed];
      depth += countBraces(trimmed);
      if (depth <= 0) {
        blocks.push(finishBlock(currentBlock, selector));
        inNestedBlock = false;
        depth = 0;
        currentBlock = [];
      }
      continue;
    }

    if (inNestedBlock) {
      currentBlock.push(trimmed);
      depth += countBraces(trimmed);
      if (depth <= 0) {
        blocks.push(finishBlock(currentBlock, selector));
        inNestedBlock = false;
        depth = 0;
        currentBlock = [];
      }
      continue;
    }

    topLevel.push(trimmed);
  }

  const parts: string[] = [];

  if (topLevel.length > 0) {
    parts.push(`${selector} {\n  ${topLevel.join('\n  ')}\n}`);
  }

  parts.push(...blocks);

  return parts.join('\n\n');
}

function countBraces(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch === '{') count++;
    else if (ch === '}') count--;
  }
  return count;
}

function finishBlock(lines: string[], selector: string): string {
  return lines
    .map((line, i) => {
      if (i === 0 || line.trim() === '}' || line.trim().endsWith('{')) {
        return line.replaceAll('&', selector);
      }
      return line;
    })
    .join('\n');
}
