//! Shared type definitions for themes, adapters, messages, and resolution results

export type PrimerMap = Record<string, string>;

export type ThemeTokens = Record<string, string>;

export interface ThemeMeta {
  id?: string;
  name: string;
  author: string;
  version: string;
  description: string;
  tags: string[];
  level: number;
}

export interface ThemeTypography {
  fontFamily?: string;
  monoFontFamily?: string;
}

export interface ComponentOverride {
  tokens?: ThemeTokens;
  css?: string;
}

export interface Theme {
  meta: ThemeMeta;
  tokens: ThemeTokens;
  typography?: ThemeTypography;
  components?: Record<string, ComponentOverride>;
  customCSS?: string;
}

export interface AdapterStrategy {
  type: 'aria' | 'data-attr' | 'structural' | 'classname';
  selector: string;
  confidence: number;
}

export interface SanityCheck {
  tag?: string;
  mustContain?: string;
  mustNotContain?: string;
  minWidth?: number;
  minHeight?: number;
  visibleOnly?: boolean;
}

export interface AdapterComponent {
  description: string;
  strategies: AdapterStrategy[];
  sanity?: SanityCheck;
}

export interface Adapter {
  page: string;
  components: Record<string, AdapterComponent>;
}

export interface Manifest {
  version: number;
  adapters: string[];
  themes: string[];
  built: string;
}

export interface CatalogEntry extends ThemeMeta {
  id: string;
}

export interface Catalog {
  themes: CatalogEntry[];
  updated: string;
}

export interface ResolutionResult {
  componentName: string;
  selector: string;
  strategyType: string;
  confidence: number;
  element: Element | null;
  passed: boolean;
}

export type StrategyResolver = (selector: string) => Element | null;

export interface CompiledCSS {
  fonts: string;
  tokens: string;
  components: string;
  custom: string;
}
