import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addFavourite,
  getFavourites,
  removeFavourite,
} from './favouritesHandler';

/**
 * Minimal in-memory localStorage so these run without pulling in jsdom.
 */
class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const event = (id: number): Events =>
  ({
    id,
    created_at: '2026-07-01T00:00:00Z',
    desc: `Special ${id}`,
    venue: "Tony's Bar",
    when: 'Tuesday',
    special_price: '$12',
    event_time: 'All day',
  }) as unknown as Events;

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('getFavourites', () => {
  it('starts empty', () => {
    expect(getFavourites()).toEqual([]);
  });

  // The try/catch swallows parse errors — this is the behaviour that keeps a
  // corrupted key from breaking the whole events list.
  it('returns empty rather than throwing on corrupted JSON', () => {
    localStorage.setItem('favourites', '{not json');
    expect(getFavourites()).toEqual([]);
  });

  it('returns empty when localStorage itself throws', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('access denied');
      },
    });
    expect(getFavourites()).toEqual([]);
  });
});

describe('addFavourite', () => {
  it('stores an event and reads it back', () => {
    addFavourite(event(1));
    expect(getFavourites().map((e) => e.id)).toEqual([1]);
  });

  it('appends without dropping what is already there', () => {
    addFavourite(event(1));
    addFavourite(event(2));
    expect(getFavourites().map((e) => e.id)).toEqual([1, 2]);
  });

  // Documenting current behaviour, not endorsing it: there is no de-duping,
  // so favouriting twice stores the event twice.
  it('does not de-duplicate the same event', () => {
    addFavourite(event(1));
    addFavourite(event(1));
    expect(getFavourites()).toHaveLength(2);
  });
});

describe('removeFavourite', () => {
  it('removes by id and leaves the rest', () => {
    addFavourite(event(1));
    addFavourite(event(2));
    removeFavourite(event(1));
    expect(getFavourites().map((e) => e.id)).toEqual([2]);
  });

  it('removes every copy when one was favourited twice', () => {
    addFavourite(event(1));
    addFavourite(event(1));
    removeFavourite(event(1));
    expect(getFavourites()).toEqual([]);
  });

  it('is a no-op for an event that was never favourited', () => {
    addFavourite(event(1));
    removeFavourite(event(99));
    expect(getFavourites().map((e) => e.id)).toEqual([1]);
  });
});
