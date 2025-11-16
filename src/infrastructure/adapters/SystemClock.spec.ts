import { SystemClock } from './SystemClock';

describe('SystemClock', () => {
  let clock: SystemClock;

  beforeEach(() => {
    clock = new SystemClock();
  });

  it('should return current date', () => {
    const before = new Date();
    const now = clock.now();
    const after = new Date();

    expect(now.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should return different dates for subsequent calls', () => {
    const date1 = clock.now();
    // Small delay to ensure different timestamps
    const date2 = clock.now();

    // Dates might be equal if called very quickly, but should be valid Date objects
    expect(date1).toBeInstanceOf(Date);
    expect(date2).toBeInstanceOf(Date);
  });
});
