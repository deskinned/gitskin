//! Extension-wide constants — URLs, timing, limits, element IDs
export const SKINBANK_API_URL = 'https://skinbank.gitsk.in/v1';
export const ADAPTER_REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000;
export const SPA_DEBOUNCE_MS = 50;

export const FONTS_STYLE_ID = 'gitskin-fonts';
export const TOKENS_STYLE_ID = 'gitskin-tokens';
export const COMPONENTS_STYLE_ID = 'gitskin-components';
export const CUSTOM_CSS_STYLE_ID = 'gitskin-custom';

export const PRIMER_MAP_URL = `${SKINBANK_API_URL}/adapters/primer-map.json`;
export const MANIFEST_URL = `${SKINBANK_API_URL}/manifest.json`;
export const CATALOG_URL = `${SKINBANK_API_URL}/catalog.json`;

export const STORAGE_KEYS = {
  activeThemeId: 'gitskin:activeThemeId',
  primerMap: 'gitskin:primerMap',
  installedThemes: 'gitskin:installedThemes',
} as const;

export const ALARM_NAMES = {
  adapterRefresh: 'gitskin:adapter-refresh',
} as const;
