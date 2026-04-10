//! MutationObserver + turbo:load listener for SPA navigation re-application
import { SPA_DEBOUNCE_MS } from '@shared/constants';

let observer: MutationObserver | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let currentCallback: (() => void) | null = null;

function debounced(): void {
  if (timeoutId !== null) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    timeoutId = null;
    currentCallback?.();
  }, SPA_DEBOUNCE_MS);
}

function onTurboLoad(): void {
  debounced();
}

export function startObserver(callback: () => void): void {
  stopObserver();

  currentCallback = callback;

  document.addEventListener('turbo:load', onTurboLoad);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- document.body is null at document_start
  if (document.body) {
    observer = new MutationObserver(() => {
      debounced();
    });
    observer.observe(document.body, { childList: true, subtree: false });
  }
}

export function stopObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  document.removeEventListener('turbo:load', onTurboLoad);

  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  currentCallback = null;
}
