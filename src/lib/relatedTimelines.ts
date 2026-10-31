import type { Timeline } from '../types';
import type { NameEntry } from './nameIndex';
import type { RelationGraph } from './relationGraph';

/** Every `see:` id that names no timeline, as `Leonardo → Medic1`, so a typo fails the build instead of silently dropping the link. */
export function unknownSeeIds(timelines: Timeline[]): string[] {
  const known = new Set(timelines.map((t) => t.id));
  return timelines.flatMap((t) => t.see.filter((id) => !known.has(id)).map((id) => `${t.id} → ${id}`));
}

/**
 * The timelines `timeline` points to with `see:` and those that point to it, whatever their category,
 * in the order of `timelines`. A link written on one side shows on both.
 */
export function seeAlso(timeline: Timeline, timelines: Timeline[]): Timeline[] {
  return timelines.filter((t) => t.id !== timeline.id && (timeline.see.includes(t.id) || t.see.includes(timeline.id)));
}

export interface MentionedTimeline {
  timeline: Timeline;
  /** Events linking the two people, both directions together. */
  weight: number;
}

/**
 * For a person's timeline: the timelines of the people it is linked to in the relation graph (it mentions them or they mention it),
 * strongest first. This is name matching, so it can miss or misjudge; `see:` is the reliable way to link.
 * Timelines in `skip` (already shown by `see:`) and a person's own works list are left out.
 */
export function mentionedTimelines(timeline: Timeline, index: NameEntry[], graph: RelationGraph, skip: Set<string>, limit = 8): MentionedTimeline[] {
  const owner = index.find((e) => e.links.some((t) => t.id === timeline.id));
  if (!owner) return [];
  const byKey = new Map(index.map((e) => [e.key, e]));
  const own = new Set(owner.links.map((t) => t.id));
  return graph.links
    .filter((l) => l.source === owner.key || l.target === owner.key)
    .map((l) => ({ other: byKey.get(l.source === owner.key ? l.target : l.source), weight: l.weight }))
    .flatMap(({ other, weight }) => (other?.links[0] && !own.has(other.links[0].id) && !skip.has(other.links[0].id) ? [{ timeline: other.links[0], weight }] : []))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
