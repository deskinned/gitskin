//! Fetches adapter definitions and theme data from skinbank.gitsk.in with ETag caching
import type { Adapter, Catalog, Manifest, PrimerMap, Theme } from '@shared/types';
import { SKINBANK_API_URL, MANIFEST_URL, PRIMER_MAP_URL, CATALOG_URL } from '@shared/constants';
import * as cache from '@shared/cache';

const etags = new Map<string, string>();

async function conditionalFetch(url: string): Promise<{ data: unknown; changed: boolean }> {
  const headers: HeadersInit = {};
  const etag = etags.get(url);
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await fetch(url, { headers });

  if (response.status === 304) {
    return { data: null, changed: false };
  }

  const newEtag = response.headers.get('ETag');
  if (newEtag) {
    etags.set(url, newEtag);
  }

  const data: unknown = await response.json();
  return { data, changed: true };
}

export async function fetchManifest(): Promise<Manifest> {
  const { data, changed } = await conditionalFetch(MANIFEST_URL);
  if (!changed) {
    const cached = await cache.getManifest();
    if (!cached) throw new Error('Manifest cache miss after 304');
    return cached;
  }
  await cache.putManifest(data as Manifest);
  return data as Manifest;
}

export async function fetchPrimerMap(): Promise<PrimerMap> {
  const { data, changed } = await conditionalFetch(PRIMER_MAP_URL);
  if (!changed) {
    const cached = await cache.getPrimerMap();
    if (!cached) throw new Error('PrimerMap cache miss after 304');
    return cached;
  }
  await cache.putPrimerMap(data as PrimerMap);
  return data as PrimerMap;
}

export async function fetchAdapter(name: string): Promise<Adapter> {
  const url = `${SKINBANK_API_URL}/adapters/${name}.json`;
  const { data, changed } = await conditionalFetch(url);
  if (!changed) {
    const cached = await cache.getAdapter(name);
    if (!cached) throw new Error(`Adapter "${name}" cache miss after 304`);
    return cached;
  }
  await cache.putAdapter(name, data as Adapter);
  return data as Adapter;
}

export async function fetchTheme(id: string): Promise<Theme> {
  const url = `${SKINBANK_API_URL}/themes/${id}.json`;
  const { data, changed } = await conditionalFetch(url);
  if (!changed) {
    const cached = await cache.getTheme(id);
    if (!cached) throw new Error(`Theme "${id}" cache miss after 304`);
    return cached;
  }
  await cache.putTheme(id, data as Theme);
  return data as Theme;
}

export async function fetchCatalog(): Promise<Catalog> {
  const { data, changed } = await conditionalFetch(CATALOG_URL);
  if (!changed) {
    const cached = await cache.getCatalog();
    if (!cached) throw new Error('Catalog cache miss after 304');
    return cached;
  }
  await cache.putCatalog(data as Catalog);
  return data as Catalog;
}

export async function getPrimerMap(): Promise<PrimerMap> {
  const cached = await cache.getPrimerMap();
  if (cached) return cached;
  return fetchPrimerMap();
}

export async function getCatalog(): Promise<Catalog> {
  const cached = await cache.getCatalog();
  if (cached) return cached;
  return fetchCatalog();
}

export async function refreshAdapters(): Promise<void> {
  const manifest = await fetchManifest();
  await Promise.all(manifest.adapters.map((name) => fetchAdapter(name)));
  await fetchPrimerMap();
}
