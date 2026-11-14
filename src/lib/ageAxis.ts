import type { TimePoint, Timeline } from '../types';

/** Whether these timelines can share an age axis: at least two, all of them people (`born:`). */
export function canAlignByAge(timelines: Timeline[]): boolean {
  return timelines.length > 1 && timelines.every((t) => t.born !== undefined);
}

/**
 * The same timeline with every date counted from the person's birth, so `start` is an age in decimal years
 * (negative before birth). Labels keep the calendar date; ids are unchanged. A timeline without `born:` is returned as is.
 */
export function toAgeAxis(timeline: Timeline): Timeline {
  const born = timeline.born;
  if (born === undefined) return timeline;
  const shift = (date: TimePoint): TimePoint => ({
    ...date,
    start: date.start - born,
    ...(date.end === undefined ? {} : { end: date.end - born }),
  });
  return {
    ...timeline,
    events: timeline.events.map((e) => ({ ...e, date: shift(e.date) })),
    periods: timeline.periods.map((p) => ({ ...p, date: shift(p.date) })),
  };
}

/** Axis label for an age: 「30歲」, 「出生」 at zero, 「出生前5年」 below. */
export function formatAge(age: number): string {
  if (age === 0) return '出生';
  return age < 0 ? `出生前${-age}年` : `${age}歲`;
}
