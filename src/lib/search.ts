import type { Timeline, TimelineEvent } from '../types';

/** A piece of text, `hit` when it is one of the search terms. */
export interface Segment {
  text: string;
  hit: boolean;
}

export interface SearchHit {
  event: TimelineEvent;
  title: Segment[];
  /** The part of the body around the first term found there, or its beginning when the terms are only in the title. */
  excerpt: Segment[];
}

export interface SearchGroup {
  timeline: Timeline;
  /** Every term is in the timeline's title, aliases or tags. */
  titleHit: boolean;
  hits: SearchHit[];
}

/** Characters of body text kept before the first term, and the excerpt's whole length. */
const EXCERPT_LEAD = 24;
const EXCERPT_LENGTH = 90;

/** The words of a query: split on whitespace, lower-cased, without repeats. */
export function queryTerms(query: string): string[] {
  return [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))];
}

/** `text` cut into segments, marking every occurrence of a term (case-insensitive). */
export function highlight(text: string, terms: string[]): Segment[] {
  const lower = text.toLowerCase();
  const segments: Segment[] = [];
  let pos = 0;
  while (pos < text.length) {
    let at = -1;
    let length = 0;
    for (const term of terms) {
      const i = lower.indexOf(term, pos);
      if (i >= 0 && (at < 0 || i < at || (i === at && term.length > length))) {
        at = i;
        length = term.length;
      }
    }
    if (at < 0) break;
    if (at > pos) segments.push({ text: text.slice(pos, at), hit: false });
    segments.push({ text: text.slice(at, at + length), hit: true });
    pos = at + length;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), hit: false });
  return segments;
}

function excerpt(text: string, terms: string[]): Segment[] {
  const lower = text.toLowerCase();
  const found = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
  const start = found.length > 0 ? Math.max(0, Math.min(...found) - EXCERPT_LEAD) : 0;
  const end = start + EXCERPT_LENGTH;
  const cut = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  return highlight(cut, terms);
}

/**
 * Full-text search over every timeline. An event matches when each term is in its date, title or body, or in its timeline's
 * title, aliases or tags, and at least one term is in the event itself (so `巴赫 萊比錫` finds the Leipzig events of Bach's timeline).
 * Timelines whose own title matches come first, then those with the most matching events.
 */
export function searchTimelines(timelines: Timeline[], query: string): SearchGroup[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const groups: SearchGroup[] = [];
  for (const timeline of timelines) {
    const own = [timeline.title, ...timeline.aliases, ...timeline.tags].join('\n').toLowerCase();
    const inOwn = terms.map((t) => own.includes(t));
    const hits: SearchHit[] = [];
    for (const event of timeline.events) {
      const hay = `${event.date.label}\n${event.title}\n${event.text}`.toLowerCase();
      const inEvent = terms.map((t) => hay.includes(t));
      if (!inEvent.some(Boolean) || !terms.every((_, i) => inEvent[i] || inOwn[i])) continue;
      hits.push({ event, title: highlight(event.title, terms), excerpt: excerpt(event.text, terms) });
    }
    const titleHit = inOwn.every(Boolean);
    if (titleHit || hits.length > 0) groups.push({ timeline, titleHit, hits });
  }
  return groups.sort((a, b) => Number(b.titleHit) - Number(a.titleHit) || b.hits.length - a.hits.length);
}
