import { describe, it, expect, beforeEach } from 'vitest';
import { injectCSS, removeCSS, removeAllGitskinStyles, isInjected } from '../../../src/content/injector';

beforeEach(() => {
  while (document.head.firstChild) {
    document.head.removeChild(document.head.firstChild);
  }
});

describe('injectCSS', () => {
  it('creates a new style element', () => {
    injectCSS('body { color: red; }', 'gitskin-test');
    const el = document.getElementById('gitskin-test');
    expect(el).toBeTruthy();
    expect(el!.tagName).toBe('STYLE');
    expect(el!.textContent).toBe('body { color: red; }');
  });

  it('updates existing style element', () => {
    injectCSS('body { color: red; }', 'gitskin-test');
    injectCSS('body { color: blue; }', 'gitskin-test');
    const elements = document.querySelectorAll('#gitskin-test');
    expect(elements.length).toBe(1);
    expect(elements[0]!.textContent).toBe('body { color: blue; }');
  });

  it('supports multiple style elements with different IDs', () => {
    injectCSS('.a {}', 'gitskin-a');
    injectCSS('.b {}', 'gitskin-b');
    expect(document.getElementById('gitskin-a')).toBeTruthy();
    expect(document.getElementById('gitskin-b')).toBeTruthy();
  });
});

describe('removeCSS', () => {
  it('removes a style element by ID', () => {
    injectCSS('.test {}', 'gitskin-remove');
    removeCSS('gitskin-remove');
    expect(document.getElementById('gitskin-remove')).toBeNull();
  });

  it('does nothing if element does not exist', () => {
    removeCSS('gitskin-nonexistent');
  });
});

describe('removeAllGitskinStyles', () => {
  it('removes all gitskin-prefixed style elements', () => {
    injectCSS('.a {}', 'gitskin-tokens');
    injectCSS('.b {}', 'gitskin-typography');
    injectCSS('.c {}', 'gitskin-component-header');

    const other = document.createElement('style');
    other.id = 'other-lib';
    document.head.appendChild(other);

    removeAllGitskinStyles();
    expect(document.getElementById('gitskin-tokens')).toBeNull();
    expect(document.getElementById('gitskin-typography')).toBeNull();
    expect(document.getElementById('gitskin-component-header')).toBeNull();
    expect(document.getElementById('other-lib')).toBeTruthy();
  });
});

describe('isInjected', () => {
  it('returns true when style element exists', () => {
    injectCSS('.x {}', 'gitskin-check');
    expect(isInjected('gitskin-check')).toBe(true);
  });

  it('returns false when style element does not exist', () => {
    expect(isInjected('gitskin-missing')).toBe(false);
  });
});
