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
  /** Events linking the two, both directions together. */
  weight: number;
  /** `person`: a person linked to this person; `topic`: a war, period or family this person's events mention; `mentioner`: a person whose events mention this timeline. */
  kind: 'person' | 'topic' | 'mentioner';
}

/**
 * For a person's timeline: the timelines of the people it is linked to in the relation graph (it mentions them or they mention it)
 * and the timelines nobody owns (a war, a period) that its events mention, strongest first.
 * For a timeline nobody owns: the people whose own timelines mention it.
 * This is name matching, so it can miss or misjudge; `see:` is the reliable way to link.
 * Timelines in `skip` (already shown by `see:`) and a person's own works list are left out.
 */
export function mentionedTimelines(
  timeline: Timeline,
  index: NameEntry[],
  graph: RelationGraph,
  skip: Set<string>,
  timelines: Timeline[] = [],
  limit = 8,
): MentionedTimeline[] {
  const byKey = new Map(index.map((e) => [e.key, e]));
  const byId = new Map(timelines.map((t) => [t.id, t]));
  const owner = index.find((e) => e.links.some((t) => t.id === timeline.id));
  const nodeKey = owner ? owner.key : `t:${timeline.id}`;
  const own = new Set(owner?.links.map((t) => t.id) ?? [timeline.id]);
  const pick = (kind: MentionedTimeline['kind'], found: { timeline?: Timeline; weight: number }[]): MentionedTimeline[] =>
    found
      .flatMap(({ timeline: t, weight }) => (t && weight > 0 && !own.has(t.id) && !skip.has(t.id) ? [{ timeline: t, weight, kind }] : []))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);

  const ends = graph.links
    .filter((l) => l.source === nodeKey || l.target === nodeKey)
    .map((l) => ({ otherKey: l.source === nodeKey ? l.target : l.source, weight: l.weight }));
  const people = ends.filter((e) => byKey.has(e.otherKey)).map((e) => ({ timeline: byKey.get(e.otherKey)!.links[0], weight: e.weight }));
  if (!owner) return pick('mentioner', people);
  const topics = ends.filter((e) => e.otherKey.startsWith('t:')).map((e) => ({ timeline: byId.get(e.otherKey.slice(2)), weight: e.weight }));
  return [...pick('person', people), ...pick('topic', topics)];
}
