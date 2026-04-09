//! Injects and manages style elements in document head

export function injectCSS(css: string, id: string): void {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (el) {
    el.textContent = css;
    return;
  }
  el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

export function removeCSS(id: string): void {
  document.getElementById(id)?.remove();
}

export function removeAllGitskinStyles(): void {
  for (const el of document.head.querySelectorAll('style[id^="gitskin-"]')) {
    el.remove();
  }
}

export function isInjected(id: string): boolean {
  return document.getElementById(id) !== null;
}
