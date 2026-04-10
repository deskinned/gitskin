//! Sanity check tests
import { describe, it, expect } from 'vitest';
import { passSanityCheck } from '../../../../src/content/resolver/sanity';

function createElement(tag: string, opts: { text?: string; connected?: boolean } = {}): Element {
  const el = document.createElement(tag);
  if (opts.text) el.textContent = opts.text;
  if (opts.connected !== false) document.body.appendChild(el);
  return el;
}

describe('passSanityCheck', () => {
  it('passes with empty sanity check on connected element', () => {
    const el = createElement('div');
    expect(passSanityCheck(el, {})).toBe(true);
    el.remove();
  });

  it('fails on disconnected element', () => {
    const el = document.createElement('div');
    expect(passSanityCheck(el, {})).toBe(false);
  });

  it('passes when tag matches', () => {
    const el = createElement('header');
    expect(passSanityCheck(el, { tag: 'header' })).toBe(true);
    el.remove();
  });

  it('fails when tag does not match', () => {
    const el = createElement('div');
    expect(passSanityCheck(el, { tag: 'header' })).toBe(false);
    el.remove();
  });

  it('tag check is case-insensitive', () => {
    const el = createElement('HEADER');
    expect(passSanityCheck(el, { tag: 'header' })).toBe(true);
    el.remove();
  });

  it('passes when mustContain text is present', () => {
    const el = createElement('div', { text: 'deskinned / gitskin' });
    expect(passSanityCheck(el, { mustContain: '/' })).toBe(true);
    el.remove();
  });

  it('fails when mustContain text is missing', () => {
    const el = createElement('div', { text: 'gitskin' });
    expect(passSanityCheck(el, { mustContain: '/' })).toBe(false);
    el.remove();
  });

  it('passes when mustNotContain text is absent', () => {
    const el = createElement('div', { text: 'hello' });
    expect(passSanityCheck(el, { mustNotContain: 'forbidden' })).toBe(true);
    el.remove();
  });

  it('fails when mustNotContain text is present', () => {
    const el = createElement('div', { text: 'contains forbidden word' });
    expect(passSanityCheck(el, { mustNotContain: 'forbidden' })).toBe(false);
    el.remove();
  });
});
