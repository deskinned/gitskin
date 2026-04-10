//! SPA observer tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startObserver, stopObserver } from '../../../src/content/observer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  stopObserver();
  vi.useRealTimers();
});

describe('startObserver', () => {
  it('fires callback on turbo:load event after debounce', () => {
    const callback = vi.fn();
    startObserver(callback);

    document.dispatchEvent(new Event('turbo:load'));
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('fires callback on body childList mutation after debounce', async () => {
    const callback = vi.fn();
    startObserver(callback);

    const child = document.createElement('div');
    document.body.appendChild(child);

    // MutationObserver is async even in jsdom — flush microtasks
    await vi.advanceTimersByTimeAsync(50);

    expect(callback).toHaveBeenCalled();
    child.remove();
  });

  it('debounces rapid events into single callback', () => {
    const callback = vi.fn();
    startObserver(callback);

    document.dispatchEvent(new Event('turbo:load'));
    document.dispatchEvent(new Event('turbo:load'));
    document.dispatchEvent(new Event('turbo:load'));

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledOnce();
  });
});

describe('stopObserver', () => {
  it('prevents further callbacks after stop', () => {
    const callback = vi.fn();
    startObserver(callback);
    stopObserver();

    document.dispatchEvent(new Event('turbo:load'));
    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});
