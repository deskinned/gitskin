//! IndexedDB cache tests using fake-indexeddb
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdapter,
  putAdapter,
  getTheme,
  putTheme,
  getPrimerMap,
  putPrimerMap,
  getManifest,
  putManifest,
  getCatalog,
  putCatalog,
  clearAll,
} from '@shared/cache';
import type { Adapter, Theme, PrimerMap, Manifest, Catalog } from '@shared/types';

const testAdapter: Adapter = {
  page: 'repository',
  components: {
    header: {
      description: 'Repository header',
      strategies: [
        { type: 'aria', selector: '[aria-label="Repository header"]', confidence: 0.95 },
      ],
    },
  },
};

const testTheme: Theme = {
  meta: {
    name: 'obsidian',
    author: 'deskinned',
    version: '1.0.0',
    description: 'Dark obsidian theme',
    tags: ['dark'],
    level: 0,
  },
  tokens: { 'canvas.default': '#0a0a0f', 'fg.default': '#e8e8ed' },
};

const testPrimerMap: PrimerMap = {
  'canvas.default': '--color-canvas-default',
  'fg.default': '--color-fg-default',
};

const testManifest: Manifest = {
  version: 1,
  adapters: ['repository', 'profile'],
  themes: ['obsidian'],
  built: '2026-04-08T00:00:00Z',
};

const testCatalog: Catalog = {
  themes: [
    {
      id: 'obsidian',
      name: 'obsidian',
      author: 'deskinned',
      version: '1.0.0',
      description: 'Dark obsidian theme',
      tags: ['dark'],
      level: 0,
    },
  ],
  updated: '2026-04-08T00:00:00Z',
};

beforeEach(async () => {
  await clearAll();
});

describe('adapter store', () => {
  it('returns null for missing adapter', async () => {
    expect(await getAdapter('nonexistent')).toBeNull();
  });

  it('stores and retrieves an adapter', async () => {
    await putAdapter('repository', testAdapter);
    const result = await getAdapter('repository');
    expect(result).toEqual(testAdapter);
  });

  it('overwrites existing adapter', async () => {
    await putAdapter('repository', testAdapter);
    const updated = { ...testAdapter, page: 'repository-v2' };
    await putAdapter('repository', updated);
    const result = await getAdapter('repository');
    expect(result?.page).toBe('repository-v2');
  });
});

describe('theme store', () => {
  it('returns null for missing theme', async () => {
    expect(await getTheme('nonexistent')).toBeNull();
  });

  it('stores and retrieves a theme', async () => {
    await putTheme('obsidian', testTheme);
    const result = await getTheme('obsidian');
    expect(result).toEqual(testTheme);
  });
});

describe('meta store', () => {
  it('returns null for missing primer map', async () => {
    expect(await getPrimerMap()).toBeNull();
  });

  it('stores and retrieves primer map', async () => {
    await putPrimerMap(testPrimerMap);
    const result = await getPrimerMap();
    expect(result).toEqual(testPrimerMap);
  });

  it('stores and retrieves manifest', async () => {
    await putManifest(testManifest);
    const result = await getManifest();
    expect(result).toEqual(testManifest);
  });

  it('stores and retrieves catalog', async () => {
    await putCatalog(testCatalog);
    const result = await getCatalog();
    expect(result).toEqual(testCatalog);
  });
});

describe('clearAll', () => {
  it('removes all data from all stores', async () => {
    await putAdapter('repository', testAdapter);
    await putTheme('obsidian', testTheme);
    await putPrimerMap(testPrimerMap);
    await putManifest(testManifest);
    await putCatalog(testCatalog);

    await clearAll();

    expect(await getAdapter('repository')).toBeNull();
    expect(await getTheme('obsidian')).toBeNull();
    expect(await getPrimerMap()).toBeNull();
    expect(await getManifest()).toBeNull();
    expect(await getCatalog()).toBeNull();
  });
});
