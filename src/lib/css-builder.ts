//! Builds CSS strings from theme tokens, typography, components, and custom CSS
import type { Theme, PrimerMap } from '@shared/types';
import { tokensToCSSVars, typographyToCSS } from '@shared/tokens';

export function buildTokenCSS(theme: Theme, primerMap: PrimerMap): string {
  const vars = tokensToCSSVars(theme.tokens, primerMap);
  if (!vars) return '';
  return `:root {\n${vars}\n}`;
}

export function buildComponentCSS(
  selector: string,
  tokens: Record<string, string>,
  primerMap: PrimerMap,
): string {
  const vars = tokensToCSSVars(tokens, primerMap);
  if (!vars) return '';
  return `${selector} {\n${vars}\n}`;
}

export function buildFullCSS(
  theme: Theme,
  primerMap: PrimerMap,
  resolvedSelectors?: Map<string, string>,
): string {
  const parts: string[] = [];

  const tokenCSS = buildTokenCSS(theme, primerMap);
  if (tokenCSS) parts.push(tokenCSS);

  if (theme.typography) {
    const typoCSS = typographyToCSS(theme.typography);
    if (typoCSS) parts.push(typoCSS);
  }

  if (theme.components) {
    for (const [name, override] of Object.entries(theme.components)) {
      const selector = resolvedSelectors?.get(name) ?? ':root';
      if (override.tokens) {
        const compCSS = buildComponentCSS(selector, override.tokens, primerMap);
        if (compCSS) parts.push(compCSS);
      }
      if (override.css) {
        parts.push(override.css);
      }
    }
  }

  if (theme.customCSS) {
    parts.push(theme.customCSS);
  }

  return parts.join('\n\n');
}
