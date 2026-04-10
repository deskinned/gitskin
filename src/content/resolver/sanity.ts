//! Sanity checks — visibility, tag, text pattern, match count validation
import type { SanityCheck } from '@shared/types';

export function passSanityCheck(element: Element, sanity: SanityCheck): boolean {
  if (!element.isConnected) return false;

  if (sanity.tag && element.tagName.toLowerCase() !== sanity.tag.toLowerCase()) {
    return false;
  }

  const text = element.textContent ?? '';

  if (sanity.mustContain && !text.includes(sanity.mustContain)) {
    return false;
  }

  if (sanity.mustNotContain && text.includes(sanity.mustNotContain)) {
    return false;
  }

  if (sanity.visibleOnly || sanity.minWidth !== undefined || sanity.minHeight !== undefined) {
    const rect = element.getBoundingClientRect();

    if (sanity.visibleOnly && rect.width === 0 && rect.height === 0) {
      return false;
    }

    if (sanity.minWidth !== undefined && rect.width < sanity.minWidth) {
      return false;
    }

    if (sanity.minHeight !== undefined && rect.height < sanity.minHeight) {
      return false;
    }
  }

  return true;
}
