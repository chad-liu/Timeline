import type { Timeline } from '../types';

/** Earliest date in a timeline; for a composer this is the birth date. */
export function startOf(t: Timeline): number {
  return Math.min(...t.events.map((e) => e.date.start), ...t.periods.map((p) => p.date.start));
}

/** Display order everywhere: by earliest date, with `sortLast` timelines at the end. */
export function compareTimelines(a: Timeline, b: Timeline): number {
  return Number(a.sortLast) - Number(b.sortLast) || startOf(a) - startOf(b);
}

export const UNCATEGORIZED = '未分類';

export interface TimelineGroup {
  category: string;
  timelines: Timeline[];
}

/**
 * Group already-sorted timelines by `category`, keeping their order inside each group.
 * Groups appear in the order of their first timeline; uncategorized ones come last.
 */
export function groupTimelines(timelines: Timeline[]): TimelineGroup[] {
  const groups = new Map<string, Timeline[]>();
  for (const t of timelines) {
    const key = t.category ?? UNCATEGORIZED;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  const result = [...groups].map(([category, list]) => ({ category, timelines: list }));
  return [...result.filter((g) => g.category !== UNCATEGORIZED), ...result.filter((g) => g.category === UNCATEGORIZED)];
}
