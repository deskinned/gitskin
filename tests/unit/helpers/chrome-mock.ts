//! Stub chrome.* extension APIs for unit testing
import { vi } from 'vitest';

const storage = new Map<string, unknown>();

const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

function makeEvent(name: string) {
  if (!listeners.has(name)) listeners.set(name, new Set());
  return {
    addListener(fn: (...args: unknown[]) => void) {
      listeners.get(name)!.add(fn);
    },
    removeListener(fn: (...args: unknown[]) => void) {
      listeners.get(name)!.delete(fn);
    },
    hasListener(fn: (...args: unknown[]) => void) {
      return listeners.get(name)!.has(fn);
    },
  };
}

export function fireEvent(name: string, ...args: unknown[]) {
  for (const fn of listeners.get(name) ?? []) {
    fn(...args);
  }
}

export const chromeMock = {
  runtime: {
    sendMessage: vi.fn((_message: unknown) => Promise.resolve({})),
    onMessage: makeEvent('runtime.onMessage'),
    onMessageExternal: makeEvent('runtime.onMessageExternal'),
    onInstalled: makeEvent('runtime.onInstalled'),
    getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
    id: 'fake-extension-id',
  },
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const result: Record<string, unknown> = {};
        const keyArray = typeof keys === 'string' ? [keys] : keys;
        for (const key of keyArray) {
          if (storage.has(key)) result[key] = storage.get(key);
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(items)) {
          storage.set(key, value);
        }
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyArray = typeof keys === 'string' ? [keys] : keys;
        for (const key of keyArray) {
          storage.delete(key);
        }
        return Promise.resolve();
      }),
    },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve()),
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: makeEvent('alarms.onAlarm'),
  },
};

export function installChromeMock() {
  vi.stubGlobal('chrome', chromeMock);
}

export function resetChromeMock() {
  storage.clear();
  listeners.clear();
  vi.restoreAllMocks();
}
