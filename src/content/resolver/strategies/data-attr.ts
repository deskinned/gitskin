//! Strategy S2 — data-* attribute resolution
import type { StrategyResolver } from '@shared/types';

export const resolveDataAttr: StrategyResolver = (selector) => document.querySelector(selector);
