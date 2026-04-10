//! Fingerprint detection tests
import { describe, it, expect, beforeEach } from 'vitest';
import { detectVariant } from '../../../src/content/fingerprint';

beforeEach(() => {
  // Safe: clearing DOM between tests in jsdom
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

describe('detectVariant', () => {
  it('detects react-app when #__next is present', () => {
    const el = document.createElement('div');
    el.id = '__next';
    document.body.appendChild(el);

    expect(detectVariant()).toBe('react-app');
  });

  it('detects react-app when data-reactroot is present', () => {
    const el = document.createElement('div');
    el.setAttribute('data-reactroot', '');
    document.body.appendChild(el);

    expect(detectVariant()).toBe('react-app');
  });

  it('returns default when no markers present', () => {
    expect(detectVariant()).toBe('default');
  });

  it('returns default for standard GitHub pages', () => {
    const el = document.createElement('div');
    el.setAttribute('data-turbo-body', '');
    document.body.appendChild(el);

    expect(detectVariant()).toBe('default');
  });
});
