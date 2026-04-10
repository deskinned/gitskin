//! Strategy S3 — structural heuristic resolution (tag + parent chain + nth-child)
import type { StrategyResolver } from '@shared/types';

export const resolveStructural: StrategyResolver = (selector) => document.querySelector(selector);
