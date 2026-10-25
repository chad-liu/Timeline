import type { Period, TimePoint, Timeline, TimelineEvent } from '../types';
import type { ExtraPerson } from './extraPeople';
import { formatYear } from './parseDate';
import { personName } from './peopleIndex';

/** How wide a slice of time the page shows. */
export type Span = 1 | 10 | 100;

/** The slice of time [from, from + span) that contains `year`: the year itself, its decade or its century. */
export function sliceOf(year: number, span: Span): { from: number; to: number } {
  const from = Math.floor(year / span) * span;
  return { from, to: from + span };
}

/** 「1789年」、「1780年代」、「18世紀」（1700–1799）、「前221年」、「前3世紀」. */
export function sliceLabel(from: number, span: Span): string {
  if (span === 1) return `${formatYear(from)}年`;
  if (span === 10) return `${formatYear(from)}年代`;
  return from >= 0 ? `${from / 100 + 1}世紀` : `前${-from / 100}世紀`;
}

/** Does the date span [start, end] touch the slice [from, to)? A single date counts as a point. */
function overlaps(start: number, end: number | undefined, from: number, to: number): boolean {
  return start < to && (end ?? start) >= from;
}

export interface TimelineSlice {
  timeline: Timeline;
  /** Periods of this timeline that the slice falls in, e.g. 「古典與浪漫」. */
  periods: Period[];
  events: TimelineEvent[];
}

/**
 * Every timeline with events in the slice, in the given (dashboard) order, with the periods it falls in.
 * Events lasting about a century or more (「18世紀」, 「1700 ~ 1799」) are too vague for a year or a decade,
 * so they show only in a century slice.
 */
export function eventsInSlice(timelines: Timeline[], from: number, to: number): TimelineSlice[] {
  const vague = (date: TimePoint) => (date.end ?? date.start) - date.start >= 99;
  return timelines
    .map((timeline) => ({
      timeline,
      periods: timeline.periods.filter((p) => overlaps(p.date.start, p.date.end, from, to)),
      events: timeline.events.filter((e) => overlaps(e.date.start, e.date.end, from, to) && (to - from >= 100 || !vague(e.date))),
    }))
    .filter((s) => s.events.length > 0);
}

export interface LivingPerson {
  key: string;
  name: string;
  /** Age reached in the slice's first year, or 0 if born during the slice. */
  age: number;
  /** The person's own timeline, when there is one. */
  timeline?: Timeline;
}

/**
 * People alive at some point in the slice: person timelines (born/died) and the name index's supplementary people.
 * Sorted by birth, so the oldest come first.
 */
export function livingInSlice(timelines: Timeline[], extras: ExtraPerson[], from: number, to: number): LivingPerson[] {
  const people = [
    ...timelines
      .filter((t) => t.born !== undefined && t.died !== undefined)
      .map((t) => ({ key: t.id, name: personName(t), born: t.born!, died: t.died, timeline: t as Timeline | undefined })),
    ...extras.map((p) => ({ key: `extra:${p.name}`, name: p.name, born: p.born, died: p.died, timeline: undefined })),
  ];
  return people
    .filter((p) => Math.floor(p.born) < to && (p.died === undefined || Math.floor(p.died) >= from))
    .sort((a, b) => a.born - b.born)
    .map((p) => ({ key: p.key, name: p.name, age: Math.max(0, from - Math.floor(p.born)), timeline: p.timeline }));
}
