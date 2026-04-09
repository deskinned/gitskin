//! Maps theme token names to Primer CSS variable declarations
import type { PrimerMap, ThemeTokens, ThemeTypography } from './types';

export function tokensToCSSVars(tokens: ThemeTokens, primerMap: PrimerMap): string {
  const declarations: string[] = [];
  for (const [tokenName, value] of Object.entries(tokens)) {
    const cssVar = primerMap[tokenName];
    if (cssVar) {
      declarations.push(`  ${cssVar}: ${value};`);
    }
  }
  return declarations.join('\n');
}

export function typographyToCSS(typography: ThemeTypography): string {
  const rules: string[] = [];

  if (typography.fontFamily) {
    rules.push(`body, .markdown-body { font-family: ${typography.fontFamily}; }`);
  }

  if (typography.monoFontFamily) {
    rules.push(
      `.blob-code, .highlight pre, code, .CodeMirror, .cm-editor { font-family: ${typography.monoFontFamily}; }`,
    );
  }

  return rules.join('\n');
}
