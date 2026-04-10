//! Content script entry point — fingerprint, resolve, compile, inject, observe
import { MessageType, sendMessage } from '@shared/messages';
import type { ActiveThemeResponse, AdapterResponse, ThemeChangedMessage } from '@shared/messages';
import type { Adapter, ResolutionResult } from '@shared/types';
import {
  FONTS_STYLE_ID,
  TOKENS_STYLE_ID,
  COMPONENTS_STYLE_ID,
  CUSTOM_CSS_STYLE_ID,
} from '@shared/constants';
import { compileThemeCSS } from './compiler';
import { resolveComponents } from './resolver/engine';
import { detectVariant } from './fingerprint';
import { injectCSS, removeCSS, removeAllGitskinStyles } from './injector';
import { startObserver } from './observer';

function detectPageType(): string {
  const path = window.location.pathname;
  if (/^\/[^/]+\/[^/]+\/pull\//.test(path)) return 'pull-request';
  if (/^\/[^/]+\/[^/]+\/issues/.test(path)) return 'issues';
  if (/^\/[^/]+\/[^/]+\/actions/.test(path)) return 'actions';
  if (/^\/[^/]+\/[^/]+/.test(path)) return 'repository';
  if (/^\/[^/]+\/?$/.test(path)) return 'profile';
  return 'global';
}

async function requestAdapter(page: string): Promise<Adapter | null> {
  const response = await sendMessage<AdapterResponse>({
    type: MessageType.GET_ADAPTER,
    page,
  });
  return response.success ? (response.data?.adapter ?? null) : null;
}

function mergeAdapters(global: Adapter | null, page: Adapter | null): Adapter | null {
  if (!global && !page) return null;
  if (!global) return page;
  if (!page) return global;

  return {
    page: page.page,
    components: { ...global.components, ...page.components },
  };
}

async function applyTheme(): Promise<void> {
  const themeResponse = await sendMessage<ActiveThemeResponse>({
    type: MessageType.GET_ACTIVE_THEME,
  });

  if (!themeResponse.success || !themeResponse.data?.theme) {
    removeAllGitskinStyles();
    return;
  }

  const { theme, primerMap } = themeResponse.data;

  detectVariant();

  const pageType = detectPageType();
  const [globalAdapter, pageAdapter] = await Promise.all([
    requestAdapter('global'),
    pageType !== 'global' ? requestAdapter(pageType) : Promise.resolve(null),
  ]);

  const merged = mergeAdapters(globalAdapter, pageAdapter);
  let resolutions = new Map<string, ResolutionResult>();
  if (merged) {
    resolutions = resolveComponents(merged);
  }

  const compiled = compileThemeCSS(theme, primerMap, resolutions);

  if (compiled.fonts) {
    injectCSS(compiled.fonts, FONTS_STYLE_ID);
  } else {
    removeCSS(FONTS_STYLE_ID);
  }

  if (compiled.tokens) {
    injectCSS(compiled.tokens, TOKENS_STYLE_ID);
  } else {
    removeCSS(TOKENS_STYLE_ID);
  }

  if (compiled.components) {
    injectCSS(compiled.components, COMPONENTS_STYLE_ID);
  } else {
    removeCSS(COMPONENTS_STYLE_ID);
  }

  if (compiled.custom) {
    injectCSS(compiled.custom, CUSTOM_CSS_STYLE_ID);
  } else {
    removeCSS(CUSTOM_CSS_STYLE_ID);
  }
}

chrome.runtime.onMessage.addListener((message: ThemeChangedMessage) => {
  if (message.type === MessageType.THEME_CHANGED) {
    applyTheme().catch(console.error);
  }
});

applyTheme()
  .then(() => {
    startObserver(() => {
      applyTheme().catch(console.error);
    });
  })
  .catch(console.error);
