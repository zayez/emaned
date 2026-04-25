const PREFIX = 'emaned:';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createPersistence(storage: StorageLike | null = defaultStorage()) {
  return {
    get<T>(key: string, fallback: T): T {
      if (!storage) return fallback;
      try {
        const raw = storage.getItem(PREFIX + key);
        if (raw == null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): void {
      if (!storage) return;
      try {
        storage.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        /* quota or serialization — silent per PRD */
      }
    },
  };
}

export type Persistence = ReturnType<typeof createPersistence>;
