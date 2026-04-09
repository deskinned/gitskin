//! Adapter fetcher tests — fetch layer with ETag caching + IndexedDB
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Manifest, PrimerMap, Catalog, Adapter, Theme } from '@shared/types';
import * as cache from '@shared/cache';

const testManifest: Manifest = {
  version: 1,
  adapters: ['repository', 'profile'],
  themes: ['obsidian'],
  built: '2026-04-08T00:00:00Z',
};

const testPrimerMap: PrimerMap = {
  'canvas.default': '--color-canvas-default',
  'fg.default': '--color-fg-default',
};

const testCatalog: Catalog = {
  themes: [
    {
      id: 'obsidian',
      name: 'obsidian',
      author: 'deskinned',
      version: '1.0.0',
      description: 'Dark theme',
      tags: ['dark'],
      level: 0,
    },
  ],
  updated: '2026-04-08T00:00:00Z',
};

const testAdapter: Adapter = {
  page: 'repository',
  components: {
    header: {
      description: 'Repo header',
      strategies: [{ type: 'aria', selector: '[aria-label="Header"]', confidence: 0.9 }],
    },
  },
};

const testTheme: Theme = {
  meta: {
    name: 'obsidian',
    author: 'deskinned',
    version: '1.0.0',
    description: 'Dark theme',
    tags: ['dark'],
    level: 0,
  },
  tokens: { 'canvas.default': '#0a0a0f' },
};

function mockResponse(data: unknown, etag?: string) {
  const headers = new Map<string, string>();
  if (etag) headers.set('ETag', etag);
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    headers: { get: (name: string) => headers.get(name) ?? null },
  };
}

function mock304Response() {
  return {
    ok: false,
    status: 304,
    json: () => Promise.reject(new Error('No body on 304')),
    headers: { get: () => null },
  };
}

function mockFetch(data: unknown, etag?: string) {
  return vi.fn(() => Promise.resolve(mockResponse(data, etag))) as unknown as typeof globalThis.fetch;
}

beforeEach(async () => {
  await cache.clearAll();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('fetchManifest', () => {
  it('fetches manifest and caches it', async () => {
    vi.stubGlobal('fetch', mockFetch(testManifest, '"abc123"'));
    const { fetchManifest } = await import('@shared/../background/adapter-fetcher');

    const result = await fetchManifest();
    expect(result).toEqual(testManifest);
    expect(await cache.getManifest()).toEqual(testManifest);
    expect(fetch).toHaveBeenCalledOnce();
  });
});

describe('fetchPrimerMap', () => {
  it('fetches primer map and caches it', async () => {
    vi.stubGlobal('fetch', mockFetch(testPrimerMap));
    const { fetchPrimerMap } = await import('@shared/../background/adapter-fetcher');

    const result = await fetchPrimerMap();
    expect(result).toEqual(testPrimerMap);
    expect(await cache.getPrimerMap()).toEqual(testPrimerMap);
  });
});

describe('fetchAdapter', () => {
  it('fetches adapter by name and caches it', async () => {
    vi.stubGlobal('fetch', mockFetch(testAdapter));
    const { fetchAdapter } = await import('@shared/../background/adapter-fetcher');

    const result = await fetchAdapter('repository');
    expect(result).toEqual(testAdapter);
    expect(await cache.getAdapter('repository')).toEqual(testAdapter);
  });
});

describe('fetchTheme', () => {
  it('fetches theme by id and caches it', async () => {
    vi.stubGlobal('fetch', mockFetch(testTheme));
    const { fetchTheme } = await import('@shared/../background/adapter-fetcher');

    const result = await fetchTheme('obsidian');
    expect(result).toEqual(testTheme);
    expect(await cache.getTheme('obsidian')).toEqual(testTheme);
  });
});

describe('ETag conditional fetch', () => {
  it('sends If-None-Match on second fetch and returns cached on 304', async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(mockResponse(testPrimerMap, '"etag-1"'))
      .mockResolvedValueOnce(mock304Response());
    vi.stubGlobal('fetch', fetchFn as unknown as typeof globalThis.fetch);
    const { fetchPrimerMap } = await import('@shared/../background/adapter-fetcher');

    const first = await fetchPrimerMap();
    expect(first).toEqual(testPrimerMap);

    const second = await fetchPrimerMap();
    expect(second).toEqual(testPrimerMap);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    const secondCallHeaders = fetchFn.mock.calls[1]![1] as { headers: Record<string, string> };
    expect(secondCallHeaders.headers['If-None-Match']).toBe('"etag-1"');
  });
});

describe('getPrimerMap', () => {
  it('returns cached primer map when available', async () => {
    await cache.putPrimerMap(testPrimerMap);
    vi.stubGlobal('fetch', mockFetch({ should: 'not be called' }));
    const { getPrimerMap } = await import('@shared/../background/adapter-fetcher');

    const result = await getPrimerMap();
    expect(result).toEqual(testPrimerMap);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches when cache is empty', async () => {
    vi.stubGlobal('fetch', mockFetch(testPrimerMap));
    const { getPrimerMap } = await import('@shared/../background/adapter-fetcher');

    const result = await getPrimerMap();
    expect(result).toEqual(testPrimerMap);
    expect(fetch).toHaveBeenCalledOnce();
  });
});

describe('getCatalog', () => {
  it('returns cached catalog when available', async () => {
    await cache.putCatalog(testCatalog);
    vi.stubGlobal('fetch', mockFetch({ should: 'not be called' }));
    const { getCatalog } = await import('@shared/../background/adapter-fetcher');

    const result = await getCatalog();
    expect(result).toEqual(testCatalog);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches when cache is empty', async () => {
    vi.stubGlobal('fetch', mockFetch(testCatalog));
    const { getCatalog } = await import('@shared/../background/adapter-fetcher');

    const result = await getCatalog();
    expect(result).toEqual(testCatalog);
    expect(fetch).toHaveBeenCalledOnce();
  });
});

describe('refreshAdapters', () => {
  it('fetches manifest then all adapters and primer map', async () => {
    const responses = new Map<string, unknown>([
      ['manifest.json', testManifest],
      ['adapters/repository.json', testAdapter],
      ['adapters/profile.json', { ...testAdapter, page: 'profile' }],
      ['adapters/primer-map.json', testPrimerMap],
    ]);

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        for (const [key, data] of responses) {
          if (url.includes(key)) {
            return Promise.resolve(mockResponse(data));
          }
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }) as unknown as typeof globalThis.fetch,
    );

    const { refreshAdapters } = await import('@shared/../background/adapter-fetcher');
    await refreshAdapters();

    expect(await cache.getManifest()).toEqual(testManifest);
    expect(await cache.getAdapter('repository')).toEqual(testAdapter);
    expect(await cache.getAdapter('profile')).toEqual({ ...testAdapter, page: 'profile' });
    expect(await cache.getPrimerMap()).toEqual(testPrimerMap);
  });
});
