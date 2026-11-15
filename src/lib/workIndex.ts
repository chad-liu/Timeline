import type { Timeline, TimelineEvent } from '../types';

/** A title written in book-title marks, 《…》: a composition, a book, a painting, but also a treaty or a law. */
export interface WorkEntry {
  title: string;
  /** The timeline that mentions it in the most events (the earliest such event breaks a tie; travel timelines come last): most likely its author's. */
  main: Timeline;
  /** The earliest event of the main timeline that mentions it, taken as when the work appeared. */
  first: TimelineEvent;
  /** Every timeline that mentions it, the main one first and the others in dashboard order, each with the events that do. */
  mentions: { timeline: Timeline; events: TimelineEvent[] }[];
  /** Total number of mentioning events. */
  count: number;
}

/** The distinct titles in book-title marks in a text, in order of appearance. */
export function worksInText(text: string): string[] {
  return [...new Set([...text.matchAll(/《([^《》]+)》/g)].map((m) => m[1].trim()).filter(Boolean))];
}

/**
 * Every title in book-title marks found in an event's title or body, with the events that mention it, in the order of each
 * work's first appearance in its main timeline. The same title by different authors (安魂曲, 夜曲) is one entry: its timelines tell them apart.
 */
export function buildWorkIndex(timelines: Timeline[]): WorkEntry[] {
  const byTitle = new Map<string, Map<Timeline, TimelineEvent[]>>();
  for (const timeline of timelines) {
    for (const event of timeline.events) {
      for (const title of worksInText(`${event.title}\n${event.text}`)) {
        const found = byTitle.get(title) ?? new Map<Timeline, TimelineEvent[]>();
        byTitle.set(title, found);
        found.set(timeline, [...(found.get(timeline) ?? []), event]);
      }
    }
  }

  const earliest = (events: TimelineEvent[]) => events.reduce((a, b) => (b.date.start < a.date.start ? b : a));
  const entries: WorkEntry[] = [];
  for (const [title, found] of byTitle) {
    const all = [...found].map(([timeline, events]) => ({ timeline, events }));
    // A travel timeline (`routeOf:`) says where a work was written, not whose it is: it is the main one only when nothing else mentions the work.
    const candidates = all.some((m) => !m.timeline.routeOf) ? all.filter((m) => !m.timeline.routeOf) : all;
    const main = candidates.reduce((a, b) =>
      b.events.length > a.events.length ||
      (b.events.length === a.events.length && earliest(b.events).date.start < earliest(a.events).date.start)
        ? b
        : a,
    );
    entries.push({
      title,
      main: main.timeline,
      first: earliest(main.events),
      mentions: [main, ...all.filter((m) => m !== main)],
      count: all.reduce((n, m) => n + m.events.length, 0),
    });
  }
  return entries.sort((a, b) => a.first.date.start - b.first.date.start);
}
