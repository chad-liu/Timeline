import type { Timeline } from '../types';

/** Earliest date in a timeline; for a composer this is the birth date. */
export function startOf(t: Timeline): number {
  return Math.min(...t.events.map((e) => e.date.start), ...t.periods.map((p) => p.date.start));
}

/** Display order everywhere: by earliest date, with `sortLast` timelines at the end. */
export function compareTimelines(a: Timeline, b: Timeline): number {
  return Number(a.sortLast) - Number(b.sortLast) || startOf(a) - startOf(b);
}
