//! Strategy S1 — ARIA role/label resolution
import type { StrategyResolver } from '@shared/types';

export const resolveAria: StrategyResolver = (selector) => document.querySelector(selector);
