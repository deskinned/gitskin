//! Content script entry point — requests active theme, builds CSS, injects into GitHub
import { MessageType, sendMessage } from '@shared/messages';
import type { ActiveThemeResponse, ThemeChangedMessage } from '@shared/messages';
import { TOKENS_STYLE_ID } from '@shared/constants';
import { buildFullCSS } from '@lib/css-builder';
import { injectCSS, removeAllGitskinStyles } from './injector';

function applyTheme(response: ActiveThemeResponse): void {
  if (!response.theme) {
    removeAllGitskinStyles();
    return;
  }

  const css = buildFullCSS(response.theme, response.primerMap);
  injectCSS(css, TOKENS_STYLE_ID);
}

async function init(): Promise<void> {
  const response = await sendMessage<ActiveThemeResponse>({
    type: MessageType.GET_ACTIVE_THEME,
  });

  if (response.success && response.data) {
    applyTheme(response.data);
  }
}

chrome.runtime.onMessage.addListener((message: ThemeChangedMessage) => {
  if (message.type === MessageType.THEME_CHANGED) {
    applyTheme({ theme: message.theme, primerMap: message.primerMap });
  }
});

init().catch(console.error);
