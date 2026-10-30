import { describe, expect, it } from 'vitest';
import { createSeedState } from './seed';
import {
  createDemoRepository,
  DEMO_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  type StorageLike,
} from './repository';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('demo repository', () => {
  it('falls back safely to a fresh seed when storage is empty or malformed', () => {
    const storage = new MemoryStorage();
    const repository = createDemoRepository(storage);

    expect(repository.load()).toEqual(createSeedState());

    storage.setItem(DEMO_STORAGE_KEY, '{bad json');
    expect(repository.load()).toEqual(createSeedState());
  });

  it('saves and reloads a versioned state', () => {
    const storage = new MemoryStorage();
    const repository = createDemoRepository(storage);
    const state = createSeedState();
    state.funnel.courseDetailViews += 1;

    repository.save(state);

    expect(repository.load().funnel.courseDetailViews).toBe(59);
  });

  it('migrates the original prototype storage key without losing settings', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        settings: { commission: 12, payFee: 2.5, proPrice: 129000 },
        coaches: [],
        courses: [],
        enrollments: [],
        regs: [],
        tournaments: [],
        subs: [],
        funnel: { view: 61, checkout: 27, paid: 18 },
        assume: { 0: 'Đã xác nhận' },
        log: [],
      }),
    );

    const repository = createDemoRepository(storage);
    const migrated = repository.load();

    expect(migrated.version).toBe(2);
    expect(migrated.settings).toEqual({
      commissionPercent: 12,
      paymentFeePercent: 2.5,
      coachProMonthlyPrice: 129000,
    });
    expect(migrated.funnel).toEqual({
      courseDetailViews: 61,
      checkoutStarts: 27,
      paymentsCompleted: 18,
    });
    expect(storage.getItem(DEMO_STORAGE_KEY)).not.toBeNull();
  });

  it('reset removes the legacy key and persists a clean seed', () => {
    const storage = new MemoryStorage();
    const repository = createDemoRepository(storage);
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ v: 1 }));

    const reset = repository.reset();

    expect(reset).toEqual(createSeedState());
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(storage.getItem(DEMO_STORAGE_KEY)!)).toEqual(createSeedState());
  });
});
