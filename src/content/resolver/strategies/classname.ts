//! Strategy S4 — class name resolution (lowest confidence, last resort)
import type { StrategyResolver } from '@shared/types';

export const resolveClassname: StrategyResolver = (selector) => document.querySelector(selector);
