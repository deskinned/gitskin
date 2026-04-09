import { describe, it, expect } from 'vitest';
import { tokensToCSSVars, typographyToCSS } from '@shared/tokens';
import type { PrimerMap, ThemeTokens, ThemeTypography } from '@shared/types';

const primerMap: PrimerMap = {
  'canvas.default': '--color-canvas-default',
  'canvas.subtle': '--color-canvas-subtle',
  'fg.default': '--color-fg-default',
  'fg.muted': '--color-fg-muted',
  'accent.fg': '--color-accent-fg',
  'header.bg': '--color-header-bg',
};

describe('tokensToCSSVars', () => {
  it('maps theme tokens to CSS variable declarations', () => {
    const tokens: ThemeTokens = {
      'canvas.default': '#0a0a0f',
      'fg.default': '#e8e8ed',
    };
    const result = tokensToCSSVars(tokens, primerMap);
    expect(result).toContain('--color-canvas-default: #0a0a0f;');
    expect(result).toContain('--color-fg-default: #e8e8ed;');
  });

  it('skips tokens not in primer map', () => {
    const tokens: ThemeTokens = {
      'canvas.default': '#0a0a0f',
      'nonexistent.token': '#ff0000',
    };
    const result = tokensToCSSVars(tokens, primerMap);
    expect(result).toContain('--color-canvas-default: #0a0a0f;');
    expect(result).not.toContain('nonexistent');
  });

  it('returns empty string for empty tokens', () => {
    const result = tokensToCSSVars({}, primerMap);
    expect(result).toBe('');
  });

  it('returns empty string when no tokens match primer map', () => {
    const tokens: ThemeTokens = { 'fake.token': '#000' };
    const result = tokensToCSSVars(tokens, primerMap);
    expect(result).toBe('');
  });

  it('handles all 50 primer map tokens', () => {
    const fullMap: PrimerMap = {
      'canvas.default': '--color-canvas-default',
      'canvas.subtle': '--color-canvas-subtle',
      'canvas.inset': '--color-canvas-inset',
      'canvas.overlay': '--color-canvas-overlay',
      'fg.default': '--color-fg-default',
      'fg.muted': '--color-fg-muted',
      'fg.subtle': '--color-fg-subtle',
      'fg.onEmphasis': '--color-fg-on-emphasis',
      'accent.fg': '--color-accent-fg',
      'accent.emphasis': '--color-accent-emphasis',
    };
    const tokens: ThemeTokens = {};
    for (const key of Object.keys(fullMap)) {
      tokens[key] = '#123456';
    }
    const result = tokensToCSSVars(tokens, fullMap);
    const lines = result.split('\n').filter((l) => l.trim());
    expect(lines.length).toBe(Object.keys(fullMap).length);
  });
});

describe('typographyToCSS', () => {
  it('generates font-family rule for body', () => {
    const typo: ThemeTypography = { fontFamily: "'Inter', sans-serif" };
    const result = typographyToCSS(typo);
    expect(result).toContain("font-family: 'Inter', sans-serif;");
    expect(result).toContain('body');
  });

  it('generates mono font-family rule', () => {
    const typo: ThemeTypography = { monoFontFamily: "'JetBrains Mono', monospace" };
    const result = typographyToCSS(typo);
    expect(result).toContain("font-family: 'JetBrains Mono', monospace;");
    expect(result).toContain('.blob-code');
  });

  it('generates both font rules when both provided', () => {
    const typo: ThemeTypography = {
      fontFamily: "'Inter', sans-serif",
      monoFontFamily: "'Fira Code', monospace",
    };
    const result = typographyToCSS(typo);
    expect(result).toContain('Inter');
    expect(result).toContain('Fira Code');
  });

  it('returns empty string for empty typography', () => {
    const result = typographyToCSS({});
    expect(result).toBe('');
  });
});
