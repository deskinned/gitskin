//! Routes messages between content scripts, popup, and external sources
import type { Theme, PrimerMap } from '@shared/types';
import { MessageType } from '@shared/messages';
import type {
  GitskinMessage,
  MessageResponse,
  ActiveThemeResponse,
  CatalogResponse,
  AdapterResponse,
} from '@shared/messages';
import { getActiveTheme, setActiveTheme, clearActiveTheme, installTheme } from './theme-manager';
import * as fetcher from './adapter-fetcher';
import * as cache from '@shared/cache';

async function broadcastThemeChange(theme: Theme | null, primerMap: PrimerMap): Promise<void> {
  const tabs = await chrome.tabs.query({ url: 'https://github.com/*' });
  for (const tab of tabs) {
    if (tab.id !== undefined) {
      chrome.tabs
        .sendMessage(tab.id, {
          type: MessageType.THEME_CHANGED,
          theme,
          primerMap,
        })
        .catch(() => {
          // Tab may not have content script loaded
        });
    }
  }
}

async function handleMessage(message: GitskinMessage): Promise<MessageResponse> {
  switch (message.type) {
    case MessageType.GET_ACTIVE_THEME: {
      const [theme, primerMap] = await Promise.all([
        getActiveTheme(),
        fetcher.getPrimerMap(),
      ]);
      const data: ActiveThemeResponse = { theme, primerMap };
      return { success: true, data };
    }
    case MessageType.SET_ACTIVE_THEME: {
      await setActiveTheme(message.themeId);
      const [theme, primerMap] = await Promise.all([
        getActiveTheme(),
        fetcher.getPrimerMap(),
      ]);
      await broadcastThemeChange(theme, primerMap);
      return { success: true };
    }
    case MessageType.CLEAR_THEME: {
      await clearActiveTheme();
      const primerMap = await fetcher.getPrimerMap();
      await broadcastThemeChange(null, primerMap);
      return { success: true };
    }
    case MessageType.INSTALL_THEME: {
      await installTheme(message.theme);
      return { success: true };
    }
    case MessageType.THEME_APPLIED: {
      return { success: true };
    }
    case MessageType.GET_CATALOG: {
      const catalog = await fetcher.getCatalog();
      const data: CatalogResponse = { catalog };
      return { success: true, data };
    }
    case MessageType.REFRESH_ADAPTERS: {
      await fetcher.refreshAdapters();
      return { success: true };
    }
    case MessageType.GET_ADAPTER: {
      const adapter = await cache.getAdapter(message.page);
      const data: AdapterResponse = { adapter: adapter ?? null };
      return { success: true, data };
    }
    case MessageType.EXTERNAL_INSTALL_THEME: {
      const theme = await fetcher.fetchTheme(message.themeId);
      await installTheme(theme);
      await setActiveTheme(theme.meta.id ?? message.themeId);
      const primerMap = await fetcher.getPrimerMap();
      await broadcastThemeChange(theme, primerMap);
      return { success: true };
    }
    case MessageType.THEME_CHANGED: {
      return { success: true };
    }
  }
}

function onMessage(
  message: GitskinMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void,
): true {
  handleMessage(message)
    .then(sendResponse)
    .catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    });
  return true;
}

export function initMessageRouter(): void {
  chrome.runtime.onMessage.addListener(onMessage);

  chrome.runtime.onMessageExternal.addListener(
    (message: { action: string; themeId?: string }, _sender, sendResponse) => {
      if (message.action === 'install' && message.themeId) {
        handleMessage({
          type: MessageType.EXTERNAL_INSTALL_THEME,
          themeId: message.themeId,
        })
          .then(sendResponse)
          .catch((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            sendResponse({ success: false, error: errorMessage });
          });
        return true;
      }
      sendResponse({ success: false, error: 'Unknown external action' });
      return false;
    },
  );
}
