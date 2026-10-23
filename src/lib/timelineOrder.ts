import type { Timeline } from '../types';

/** Earliest date in a timeline; for a composer this is the birth date. */
export function startOf(t: Timeline): number {
  return Math.min(...t.events.map((e) => e.date.start), ...t.periods.map((p) => p.date.start));
}

/** Display order everywhere: by earliest date, with `sortLast` timelines at the end. */
export function compareTimelines(a: Timeline, b: Timeline): number {
  return Number(a.sortLast) - Number(b.sortLast) || startOf(a) - startOf(b);
}

/**
 * Sort with compareTimelines, then move each timeline with `follows: <id>` right after that timeline,
 * so a works list (貝多芬主要曲目, which starts with his first work) stays next to the biography it belongs to.
 * A `follows` naming a missing timeline is ignored.
 */
export function orderTimelines(timelines: Timeline[]): Timeline[] {
  const ids = new Set(timelines.map((t) => t.id));
  const isFollower = (t: Timeline) => t.follows !== undefined && t.follows !== t.id && ids.has(t.follows);
  const ordered = timelines.filter((t) => !isFollower(t)).sort(compareTimelines);
  const followers = timelines.filter(isFollower).sort(compareTimelines);
  // Keep placing followers whose target is already in the list (a follower may itself be followed).
  while (followers.length > 0) {
    const i = followers.findIndex((f) => ordered.some((t) => t.id === f.follows));
    if (i === -1) {
      ordered.push(...followers);
      break;
    }
    const [f] = followers.splice(i, 1);
    const at = ordered.findIndex((t) => t.id === f.follows);
    let end = at + 1;
    while (end < ordered.length && ordered[end].follows === f.follows) end++;
    ordered.splice(end, 0, f);
  }
  return ordered;
}

export const UNCATEGORIZED = '未分類';

export interface TimelineGroup {
  category: string;
  timelines: Timeline[];
}

/** Tab order of the known categories; any other category follows them, and 未分類 comes last. */
export const CATEGORY_ORDER = ['世界史', '西方歷史', '東方歷史', '音樂家', '思想家', '文學家'];

function categoryRank(category: string): number {
  if (category === UNCATEGORIZED) return CATEGORY_ORDER.length + 1;
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

/**
 * Group already-sorted timelines by `category`, keeping their order inside each group.
 * Groups follow CATEGORY_ORDER; other categories keep the order of their first timeline.
 */
export function groupTimelines(timelines: Timeline[]): TimelineGroup[] {
  const groups = new Map<string, Timeline[]>();
  for (const t of timelines) {
    const key = t.category ?? UNCATEGORIZED;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  return [...groups].map(([category, list]) => ({ category, timelines: list })).sort((a, b) => categoryRank(a.category) - categoryRank(b.category));
}

/** All tags used by these (already-sorted) timelines, in the order they first appear. */
export function tagsOf(timelines: Timeline[]): string[] {
  return [...new Set(timelines.flatMap((t) => t.tags))];
}

export interface TagGroup {
  /** Empty when none of the timelines has a tag. */
  tag: string;
  timelines: Timeline[];
}

/**
 * Split (already-sorted) timelines by tag; a timeline with several tags appears under each.
 * Untagged timelines go last under「其他」, or form a single untitled group when nothing is tagged.
 */
export function groupByTag(timelines: Timeline[]): TagGroup[] {
  const tags = tagsOf(timelines);
  if (tags.length === 0) return [{ tag: '', timelines }];
  const groups = tags.map((tag) => ({ tag, timelines: timelines.filter((t) => t.tags.includes(tag)) }));
  const untagged = timelines.filter((t) => t.tags.length === 0);
  return untagged.length > 0 ? [...groups, { tag: '其他', timelines: untagged }] : groups;
}
