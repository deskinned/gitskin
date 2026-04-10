//! IndexedDB cache for adapters, themes, and metadata
import type { Adapter, PrimerMap, Theme, Manifest, Catalog } from './types';

const DB_NAME = 'gitskin';
const DB_VERSION = 1;

const STORES = {
  adapters: 'adapters',
  themes: 'themes',
  meta: 'meta',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.adapters)) {
        db.createObjectStore(STORES.adapters);
      }
      if (!db.objectStoreNames.contains(STORES.themes)) {
        db.createObjectStore(STORES.themes);
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'IndexedDB open failed'));
    };
  });
}

function dbGet<T>(store: string, key: string): Promise<T | null> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => {
          resolve((req.result as T | undefined) ?? null);
        };
        req.onerror = () => {
          reject(new Error(req.error?.message ?? 'IndexedDB get failed'));
        };
      }),
  );
}

function dbPut(store: string, key: string, value: unknown): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).put(value, key);
        req.onsuccess = () => {
          resolve();
        };
        req.onerror = () => {
          reject(new Error(req.error?.message ?? 'IndexedDB put failed'));
        };
      }),
  );
}

export function getAdapter(name: string): Promise<Adapter | null> {
  return dbGet(STORES.adapters, name);
}

export function putAdapter(name: string, adapter: Adapter): Promise<void> {
  return dbPut(STORES.adapters, name, adapter);
}

export function getTheme(id: string): Promise<Theme | null> {
  return dbGet(STORES.themes, id);
}

export function putTheme(id: string, theme: Theme): Promise<void> {
  return dbPut(STORES.themes, id, theme);
}

export function getPrimerMap(): Promise<PrimerMap | null> {
  return dbGet(STORES.meta, 'primer-map');
}

export function putPrimerMap(map: PrimerMap): Promise<void> {
  return dbPut(STORES.meta, 'primer-map', map);
}

export function getManifest(): Promise<Manifest | null> {
  return dbGet(STORES.meta, 'manifest');
}

export function putManifest(manifest: Manifest): Promise<void> {
  return dbPut(STORES.meta, 'manifest', manifest);
}

export function getCatalog(): Promise<Catalog | null> {
  return dbGet(STORES.meta, 'catalog');
}

export function putCatalog(catalog: Catalog): Promise<void> {
  return dbPut(STORES.meta, 'catalog', catalog);
}

export function clearAll(): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction([STORES.adapters, STORES.themes, STORES.meta], 'readwrite');
        tx.objectStore(STORES.adapters).clear();
        tx.objectStore(STORES.themes).clear();
        tx.objectStore(STORES.meta).clear();
        tx.oncomplete = () => {
          resolve();
        };
        tx.onerror = () => {
          reject(new Error(tx.error?.message ?? 'IndexedDB clear failed'));
        };
      }),
  );
}
