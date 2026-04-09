//! Fetches adapter definitions and theme data from skinbank.gitsk.in with ETag caching
import type { Adapter, Catalog, Manifest, PrimerMap, Theme } from '@shared/types';
import { SKINBANK_API_URL, MANIFEST_URL, PRIMER_MAP_URL, CATALOG_URL } from '@shared/constants';
import * as cache from '@shared/cache';

const etags = new Map<string, string>();

async function conditionalFetch<T>(url: string): Promise<{ data: T; changed: boolean }> {
  const headers: HeadersInit = {};
  const etag = etags.get(url);
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await fetch(url, { headers });

  if (response.status === 304) {
    return { data: null as unknown as T, changed: false };
  }

  const newEtag = response.headers.get('ETag');
  if (newEtag) {
    etags.set(url, newEtag);
  }

  const data = (await response.json()) as T;
  return { data, changed: true };
}

export async function fetchManifest(): Promise<Manifest> {
  const { data, changed } = await conditionalFetch<Manifest>(MANIFEST_URL);
  if (!changed) {
    const cached = await cache.getManifest();
    return cached!;
  }
  await cache.putManifest(data);
  return data;
}

export async function fetchPrimerMap(): Promise<PrimerMap> {
  const { data, changed } = await conditionalFetch<PrimerMap>(PRIMER_MAP_URL);
  if (!changed) {
    const cached = await cache.getPrimerMap();
    return cached!;
  }
  await cache.putPrimerMap(data);
  return data;
}

export async function fetchAdapter(name: string): Promise<Adapter> {
  const url = `${SKINBANK_API_URL}/adapters/${name}.json`;
  const { data, changed } = await conditionalFetch<Adapter>(url);
  if (!changed) {
    const cached = await cache.getAdapter(name);
    return cached!;
  }
  await cache.putAdapter(name, data);
  return data;
}

export async function fetchTheme(id: string): Promise<Theme> {
  const url = `${SKINBANK_API_URL}/themes/${id}.json`;
  const { data, changed } = await conditionalFetch<Theme>(url);
  if (!changed) {
    const cached = await cache.getTheme(id);
    return cached!;
  }
  await cache.putTheme(id, data);
  return data;
}

export async function fetchCatalog(): Promise<Catalog> {
  const { data, changed } = await conditionalFetch<Catalog>(CATALOG_URL);
  if (!changed) {
    const cached = await cache.getCatalog();
    return cached!;
  }
  await cache.putCatalog(data);
  return data;
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
