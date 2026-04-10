//! CSS nesting unwrap tests
import { describe, it, expect } from 'vitest';
import { unwrapNesting } from '../../../src/content/nesting';

describe('unwrapNesting', () => {
  it('wraps top-level declarations in selector', () => {
    const css = 'background: #0f0f0f;\ncolor: white;';
    const result = unwrapNesting(css, '.header');

    expect(result).toContain('.header {');
    expect(result).toContain('background: #0f0f0f;');
    expect(result).toContain('color: white;');
  });

  it('replaces & with selector in pseudo-element block', () => {
    const css = '&::after {\n  content: "";\n  position: absolute;\n}';
    const result = unwrapNesting(css, 'header[role="banner"]');

    expect(result).toContain('header[role="banner"]::after {');
    expect(result).toContain('content: "";');
  });

  it('replaces & with selector in descendant block', () => {
    const css = '& .selected {\n  color: green;\n}';
    const result = unwrapNesting(css, 'nav.repo-nav');

    expect(result).toContain('nav.repo-nav .selected {');
    expect(result).toContain('color: green;');
  });

  it('handles mixed declarations and nested blocks', () => {
    const css = [
      'background: #0f0f0f;',
      'border-bottom: 1px solid #333;',
      '&::after {',
      '  content: "";',
      '}',
      '& .child {',
      '  color: red;',
      '}',
    ].join('\n');

    const result = unwrapNesting(css, '.parent');

    expect(result).toContain('.parent {');
    expect(result).toContain('background: #0f0f0f;');
    expect(result).toContain('.parent::after {');
    expect(result).toContain('.parent .child {');
  });

  it('handles css with no & — wraps everything in selector', () => {
    const css = 'color: red;\nfont-size: 14px;';
    const result = unwrapNesting(css, 'div.test');

    expect(result).toBe('div.test {\n  color: red;\n  font-size: 14px;\n}');
  });

  it('handles pseudo-class blocks', () => {
    const css = '&:hover {\n  opacity: 1;\n}';
    const result = unwrapNesting(css, '.btn');

    expect(result).toContain('.btn:hover {');
    expect(result).toContain('opacity: 1;');
  });
});
