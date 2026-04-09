//! Message type definitions for chrome.runtime messaging
import type { Theme, PrimerMap, Catalog } from './types';

export const enum MessageType {
  GET_ACTIVE_THEME = 'GET_ACTIVE_THEME',
  SET_ACTIVE_THEME = 'SET_ACTIVE_THEME',
  CLEAR_THEME = 'CLEAR_THEME',
  THEME_CHANGED = 'THEME_CHANGED',
  THEME_APPLIED = 'THEME_APPLIED',
  GET_CATALOG = 'GET_CATALOG',
  REFRESH_ADAPTERS = 'REFRESH_ADAPTERS',
  INSTALL_THEME = 'INSTALL_THEME',
  EXTERNAL_INSTALL_THEME = 'EXTERNAL_INSTALL_THEME',
}

export interface GetActiveThemeMessage {
  type: MessageType.GET_ACTIVE_THEME;
}

export interface SetActiveThemeMessage {
  type: MessageType.SET_ACTIVE_THEME;
  themeId: string;
}

export interface ClearThemeMessage {
  type: MessageType.CLEAR_THEME;
}

export interface ThemeChangedMessage {
  type: MessageType.THEME_CHANGED;
  theme: Theme | null;
  primerMap: PrimerMap;
}

export interface ThemeAppliedMessage {
  type: MessageType.THEME_APPLIED;
  themeId: string;
  success: boolean;
}

export interface GetCatalogMessage {
  type: MessageType.GET_CATALOG;
}

export interface RefreshAdaptersMessage {
  type: MessageType.REFRESH_ADAPTERS;
}

export interface InstallThemeMessage {
  type: MessageType.INSTALL_THEME;
  theme: Theme;
}

export interface ExternalInstallThemeMessage {
  type: MessageType.EXTERNAL_INSTALL_THEME;
  themeId: string;
}

export type GitskinMessage =
  | GetActiveThemeMessage
  | SetActiveThemeMessage
  | ClearThemeMessage
  | ThemeChangedMessage
  | ThemeAppliedMessage
  | GetCatalogMessage
  | RefreshAdaptersMessage
  | InstallThemeMessage
  | ExternalInstallThemeMessage;

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ActiveThemeResponse {
  theme: Theme | null;
  primerMap: PrimerMap;
}

export interface CatalogResponse {
  catalog: Catalog;
}

export function sendMessage<T>(message: GitskinMessage): Promise<MessageResponse<T>> {
  return chrome.runtime.sendMessage(message);
}
