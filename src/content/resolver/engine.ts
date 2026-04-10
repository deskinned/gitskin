//! Resolution engine — tries strategies in confidence order, applies sanity checks
import type { Adapter, AdapterStrategy, ResolutionResult, StrategyResolver } from '@shared/types';
import { passSanityCheck } from './sanity';
import { resolveAria } from './strategies/aria';
import { resolveDataAttr } from './strategies/data-attr';
import { resolveStructural } from './strategies/structural';
import { resolveClassname } from './strategies/classname';

const resolvers: Record<AdapterStrategy['type'], StrategyResolver> = {
  aria: resolveAria,
  'data-attr': resolveDataAttr,
  structural: resolveStructural,
  classname: resolveClassname,
};

function resolveComponent(
  name: string,
  strategies: AdapterStrategy[],
  sanity: Adapter['components'][string]['sanity'],
): ResolutionResult {
  const sorted = strategies
    .map((s, i) => ({ ...s, _idx: i }))
    .sort((a, b) => b.confidence - a.confidence || a._idx - b._idx);

  for (const strategy of sorted) {
    const resolver = resolvers[strategy.type];
    const element = resolver(strategy.selector);

    if (!element) continue;

    if (sanity && !passSanityCheck(element, sanity)) continue;

    return {
      componentName: name,
      selector: strategy.selector,
      strategyType: strategy.type,
      confidence: strategy.confidence,
      element,
      passed: true,
    };
  }

  return {
    componentName: name,
    selector: '',
    strategyType: '',
    confidence: 0,
    element: null,
    passed: false,
  };
}

export function resolveComponents(adapter: Adapter): Map<string, ResolutionResult> {
  const results = new Map<string, ResolutionResult>();

  for (const [name, component] of Object.entries(adapter.components)) {
    results.set(name, resolveComponent(name, component.strategies, component.sanity));
  }

  return results;
}
