//! Resolution engine tests
import { describe, it, expect, beforeEach } from 'vitest';
import type { Adapter } from '../../../../src/shared/types';
import { resolveComponents } from '../../../../src/content/resolver/engine';

function setDOM(html: string): void {
  // Test-only: building DOM from known-safe static strings for jsdom testing
  document.body.innerHTML = html; // eslint-disable-line no-unsanitized/property
}

beforeEach(() => {
  document.body.innerHTML = ''; // eslint-disable-line no-unsanitized/property
});

describe('resolveComponents', () => {
  it('resolves component using highest-confidence strategy first', () => {
    setDOM('<header role="banner">Header</header>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [
            { type: 'structural', selector: 'body > div.header', confidence: 0.5 },
            { type: 'aria', selector: 'header[role="banner"]', confidence: 0.95 },
          ],
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result).toBeDefined();
    expect(result!.passed).toBe(true);
    expect(result!.strategyType).toBe('aria');
    expect(result!.confidence).toBe(0.95);
    expect(result!.selector).toBe('header[role="banner"]');
  });

  it('falls back to lower-confidence strategy when higher fails', () => {
    setDOM('<div class="header">Header</div>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [
            { type: 'aria', selector: 'header[role="banner"]', confidence: 0.95 },
            { type: 'classname', selector: '.header', confidence: 0.3 },
          ],
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result!.passed).toBe(true);
    expect(result!.strategyType).toBe('classname');
    expect(result!.confidence).toBe(0.3);
  });

  it('fails when sanity check rejects matched element', () => {
    setDOM('<div role="banner">Header</div>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [{ type: 'aria', selector: '[role="banner"]', confidence: 0.95 }],
          sanity: { tag: 'header' },
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result!.passed).toBe(false);
    expect(result!.element).toBeNull();
  });

  it('returns failed result when no strategy resolves', () => {
    setDOM('<main>Content</main>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [{ type: 'aria', selector: 'header[role="banner"]', confidence: 0.95 }],
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result!.passed).toBe(false);
    expect(result!.element).toBeNull();
    expect(result!.selector).toBe('');
  });

  it('resolves multiple components independently', () => {
    setDOM('<header role="banner">Header</header><nav aria-label="Global">Sidebar</nav>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [{ type: 'aria', selector: 'header[role="banner"]', confidence: 0.95 }],
          sanity: { tag: 'header' },
        },
        GlobalSidebar: {
          description: 'Sidebar',
          strategies: [{ type: 'aria', selector: 'nav[aria-label="Global"]', confidence: 0.9 }],
          sanity: { tag: 'nav' },
        },
      },
    };

    const results = resolveComponents(adapter);

    expect(results.get('AppHeader')!.passed).toBe(true);
    expect(results.get('GlobalSidebar')!.passed).toBe(true);
  });

  it('falls back past sanity failure to next strategy that passes', () => {
    setDOM('<div class="header">Header</div><header>Header</header>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [
            { type: 'classname', selector: '.header', confidence: 0.95 },
            { type: 'aria', selector: 'header', confidence: 0.5 },
          ],
          sanity: { tag: 'header' },
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result!.passed).toBe(true);
    expect(result!.strategyType).toBe('aria');
    expect(result!.confidence).toBe(0.5);
  });

  it('fails when all strategies fail sanity check', () => {
    setDOM('<header>Header</header>');

    const adapter: Adapter = {
      page: 'global',
      components: {
        AppHeader: {
          description: 'Top nav',
          strategies: [{ type: 'aria', selector: 'header', confidence: 0.95 }],
          sanity: { mustContain: 'NotHere' },
        },
      },
    };

    const results = resolveComponents(adapter);
    const result = results.get('AppHeader');

    expect(result!.passed).toBe(false);
  });
});
