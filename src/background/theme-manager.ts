//! Manages theme install, uninstall, activate, and storage
import type { Theme } from '@shared/types';
import { STORAGE_KEYS } from '@shared/constants';

function themeKey(id: string): string {
  return `theme:${id}`;
}

export async function getActiveThemeId(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.activeThemeId);
  return (result[STORAGE_KEYS.activeThemeId] as string | undefined) ?? null;
}

export async function getActiveTheme(): Promise<Theme | null> {
  const id = await getActiveThemeId();
  if (!id) return null;
  return getTheme(id);
}

export async function setActiveTheme(themeId: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.activeThemeId]: themeId });
}

export async function clearActiveTheme(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.activeThemeId);
}

export async function getTheme(id: string): Promise<Theme | null> {
  const result = await chrome.storage.local.get(themeKey(id));
  return (result[themeKey(id)] as Theme | undefined) ?? null;
}

export async function installTheme(theme: Theme): Promise<void> {
  const id = theme.meta.id ?? theme.meta.name;
  await chrome.storage.local.set({ [themeKey(id)]: theme });

  const listResult = await chrome.storage.local.get(STORAGE_KEYS.installedThemes);
  const list = (listResult[STORAGE_KEYS.installedThemes] as string[] | undefined) ?? [];
  if (!list.includes(id)) {
    list.push(id);
    await chrome.storage.local.set({ [STORAGE_KEYS.installedThemes]: list });
  }
}

export async function uninstallTheme(id: string): Promise<void> {
  const activeId = await getActiveThemeId();
  if (activeId === id) {
    await clearActiveTheme();
  }

  await chrome.storage.local.remove(themeKey(id));

  const listResult = await chrome.storage.local.get(STORAGE_KEYS.installedThemes);
  const list = (listResult[STORAGE_KEYS.installedThemes] as string[] | undefined) ?? [];
  const updated = list.filter((t) => t !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.installedThemes]: updated });
}

export async function getInstalledThemeIds(): Promise<string[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.installedThemes);
  return (result[STORAGE_KEYS.installedThemes] as string[] | undefined) ?? [];
}
