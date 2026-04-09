import { describe, it, expect } from 'vitest';
import { buildTokenCSS, buildComponentCSS, buildFullCSS } from '@lib/css-builder';
import type { Theme, PrimerMap } from '@shared/types';

const primerMap: PrimerMap = {
  'canvas.default': '--color-canvas-default',
  'canvas.subtle': '--color-canvas-subtle',
  'fg.default': '--color-fg-default',
  'fg.muted': '--color-fg-muted',
  'accent.fg': '--color-accent-fg',
  'border.default': '--color-border-default',
};

const obsidianTheme: Theme = {
  meta: {
    name: 'obsidian',
    author: 'deskinned',
    version: '1.0.0',
    description: 'Test theme',
    tags: ['dark'],
    level: 2,
  },
  tokens: {
    'canvas.default': '#0a0a0f',
    'fg.default': '#e8e8ed',
    'accent.fg': '#4d9eff',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    monoFontFamily: "'JetBrains Mono', monospace",
  },
  components: {
    RepoHeader: {
      tokens: {
        'canvas.default': '#06060a',
        'border.default': '#1a1a24',
      },
    },
  },
};

describe('buildTokenCSS', () => {
  it('wraps token vars in :root', () => {
    const css = buildTokenCSS(obsidianTheme, primerMap);
    expect(css).toMatch(/^:root \{/);
    expect(css).toContain('--color-canvas-default: #0a0a0f;');
    expect(css).toContain('--color-fg-default: #e8e8ed;');
    expect(css).toMatch(/\}$/);
  });

  it('returns empty string when no tokens match', () => {
    const noMatchTheme: Theme = {
      ...obsidianTheme,
      tokens: { 'fake.token': '#000' },
    };
    const css = buildTokenCSS(noMatchTheme, primerMap);
    expect(css).toBe('');
  });
});

describe('buildComponentCSS', () => {
  it('scopes token overrides to a selector', () => {
    const css = buildComponentCSS(
      '[data-testid="repo-header"]',
      { 'canvas.default': '#06060a' },
      primerMap,
    );
    expect(css).toContain('[data-testid="repo-header"]');
    expect(css).toContain('--color-canvas-default: #06060a;');
  });

  it('returns empty string for empty tokens', () => {
    const css = buildComponentCSS('.selector', {}, primerMap);
    expect(css).toBe('');
  });
});

describe('buildFullCSS', () => {
  it('combines tokens, typography, components, and customCSS', () => {
    const themeWithCustom: Theme = {
      ...obsidianTheme,
      customCSS: '.custom { color: red; }',
    };
    const css = buildFullCSS(themeWithCustom, primerMap);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-canvas-default: #0a0a0f;');
    expect(css).toContain("font-family: 'Inter', sans-serif;");
    expect(css).toContain('.custom { color: red; }');
  });

  it('scopes component tokens to resolved selectors', () => {
    const resolved = new Map([['RepoHeader', '[data-testid="repo-header"]']]);
    const css = buildFullCSS(obsidianTheme, primerMap, resolved);
    expect(css).toContain('[data-testid="repo-header"]');
    expect(css).toContain('--color-canvas-default: #06060a;');
  });

  it('falls back to :root when no selector resolved', () => {
    const css = buildFullCSS(obsidianTheme, primerMap);
    const rootBlocks = css.match(/:root \{/g);
    expect(rootBlocks).toBeTruthy();
    expect(rootBlocks!.length).toBeGreaterThanOrEqual(2);
  });

  it('works with token-only theme (no typography, no components)', () => {
    const minimal: Theme = {
      meta: { name: 'min', author: 'x', version: '1.0.0', description: '', tags: [], level: 0 },
      tokens: { 'canvas.default': '#000' },
    };
    const css = buildFullCSS(minimal, primerMap);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-canvas-default: #000;');
    expect(css).not.toContain('font-family');
  });
});
