//! Compiles theme tokens + component definitions into injectable CSS
import type { Theme, PrimerMap, ResolutionResult, CompiledCSS } from '@shared/types';
import { buildTokenCSS, buildComponentCSS } from '@lib/css-builder';
import { unwrapNesting } from './nesting';

export function compileThemeCSS(
  theme: Theme,
  primerMap: PrimerMap,
  resolutions: Map<string, ResolutionResult>,
): CompiledCSS {
  const fonts = buildFontsCSS(theme);
  const tokens = buildTokenCSS(theme, primerMap);
  const components = buildComponentsCSS(theme, primerMap, resolutions);
  const custom = theme.customCSS ?? '';

  return { fonts, tokens, components, custom };
}

function buildFontsCSS(theme: Theme): string {
  if (!theme.typography) return '';

  const imports: string[] = [];

  if (theme.typography.fontFamily) {
    const url = extractFontURL(theme.typography.fontFamily);
    if (url) imports.push(`@import url('${url}');`);
  }

  if (theme.typography.monoFontFamily) {
    const url = extractFontURL(theme.typography.monoFontFamily);
    if (url) imports.push(`@import url('${url}');`);
  }

  return imports.join('\n');
}

function extractFontURL(_fontFamily: string): string | null {
  // TODO: parse Google Fonts URL from font family string
  void _fontFamily;
  return null;
}

function buildComponentsCSS(
  theme: Theme,
  primerMap: PrimerMap,
  resolutions: Map<string, ResolutionResult>,
): string {
  if (!theme.components) return '';

  const parts: string[] = [];

  for (const [name, override] of Object.entries(theme.components)) {
    const resolution = resolutions.get(name);
    if (!resolution?.passed) continue;

    if (override.tokens) {
      const css = buildComponentCSS(resolution.selector, override.tokens, primerMap);
      if (css) parts.push(css);
    }

    if (override.css) {
      parts.push(unwrapNesting(override.css, resolution.selector));
    }
  }

  return parts.join('\n\n');
}
