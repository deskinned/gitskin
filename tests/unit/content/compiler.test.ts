//! Compiler tests — theme → 4-part CSS output
import { describe, it, expect } from 'vitest';
import type { Theme, PrimerMap, ResolutionResult } from '../../../src/shared/types';
import { compileThemeCSS } from '../../../src/content/compiler';

const primerMap: PrimerMap = {
  'canvas.default': '--color-canvas-default',
  'fg.default': '--color-fg-default',
  'border.default': '--color-border-default',
};

function makeResolution(name: string, selector: string, passed: boolean): ResolutionResult {
  return {
    componentName: name,
    selector,
    strategyType: 'aria',
    confidence: 0.9,
    element: passed ? document.createElement('div') : null,
    passed,
  };
}

describe('compileThemeCSS', () => {
  it('produces tokens CSS for Level 0 theme', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 0,
      },
      tokens: { 'canvas.default': '#000', 'fg.default': '#fff' },
    };

    const result = compileThemeCSS(theme, primerMap, new Map());

    expect(result.tokens).toContain('--color-canvas-default: #000;');
    expect(result.tokens).toContain('--color-fg-default: #fff;');
    expect(result.tokens).toContain(':root');
    expect(result.components).toBe('');
    expect(result.custom).toBe('');
    expect(result.fonts).toBe('');
  });

  it('produces scoped component CSS for resolved components', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 2,
      },
      tokens: { 'canvas.default': '#000' },
      components: {
        AppHeader: {
          tokens: { 'canvas.default': '#111' },
        },
      },
    };

    const resolutions = new Map<string, ResolutionResult>();
    resolutions.set('AppHeader', makeResolution('AppHeader', 'header[role="banner"]', true));

    const result = compileThemeCSS(theme, primerMap, resolutions);

    expect(result.components).toContain('header[role="banner"]');
    expect(result.components).toContain('--color-canvas-default: #111;');
  });

  it('skips unresolved components', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 2,
      },
      tokens: { 'canvas.default': '#000' },
      components: {
        AppHeader: {
          tokens: { 'canvas.default': '#111' },
        },
      },
    };

    const resolutions = new Map<string, ResolutionResult>();
    resolutions.set('AppHeader', makeResolution('AppHeader', '', false));

    const result = compileThemeCSS(theme, primerMap, resolutions);

    expect(result.components).toBe('');
  });

  it('unwraps css blocks for Level 3 themes', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 3,
      },
      tokens: {},
      components: {
        AppHeader: {
          css: 'background: #0f0f0f;\n&::after {\n  content: "";\n}',
        },
      },
    };

    const resolutions = new Map<string, ResolutionResult>();
    resolutions.set('AppHeader', makeResolution('AppHeader', '.app-header', true));

    const result = compileThemeCSS(theme, primerMap, resolutions);

    expect(result.components).toContain('.app-header {');
    expect(result.components).toContain('background: #0f0f0f;');
    expect(result.components).toContain('.app-header::after {');
  });

  it('passes through customCSS for Level 4 themes', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 4,
      },
      tokens: {},
      customCSS: 'body::before { content: ""; }',
    };

    const result = compileThemeCSS(theme, primerMap, new Map());

    expect(result.custom).toBe('body::before { content: ""; }');
  });

  it('handles theme with both tokens and css in component', () => {
    const theme: Theme = {
      meta: {
        name: 'test',
        author: 'x',
        version: '1.0.0',
        description: 'Test',
        tags: ['dark'],
        level: 3,
      },
      tokens: { 'canvas.default': '#000' },
      components: {
        RepoHeader: {
          tokens: { 'border.default': '#222' },
          css: '&:hover { opacity: 0.8; }',
        },
      },
    };

    const resolutions = new Map<string, ResolutionResult>();
    resolutions.set('RepoHeader', makeResolution('RepoHeader', '.repo-header', true));

    const result = compileThemeCSS(theme, primerMap, resolutions);

    expect(result.components).toContain('--color-border-default: #222;');
    expect(result.components).toContain('.repo-header:hover {');
  });
});
