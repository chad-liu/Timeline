import matter from 'gray-matter';
import type { Timeline } from '../types';

/** A located place of the map view (Data\index\places.md). */
export interface Place {
  name: string;
  /** Other spellings; a place string that contains the name or any alias means this place. */
  aliases: string[];
  lat: number;
  lon: number;
}

/** Parse the `places:` list in the frontmatter of Data\index\places.md. */
export function parsePlaces(source: string): Place[] {
  const list: unknown = matter(source).data.places;
  if (!Array.isArray(list)) return [];
  return list.map((raw: Record<string, unknown>, i) => {
    const { name, lat, lon } = raw;
    if (typeof name !== 'string' || !name || typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error(`places 第 ${i + 1} 筆需要 name、lat、lon`);
    }
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error(`places「${name}」的經緯度超出範圍`);
    const aliases = Array.isArray(raw.aliases) ? raw.aliases.filter((a): a is string => typeof a === 'string') : [];
    return { name, aliases, lat, lon };
  });
}

/** The place strings after the `@` of a period or event title: 「童年@內拉霍澤維斯、茲洛尼采」 gives both villages. */
export function placesInTitle(title: string): string[] {
  const at = title.lastIndexOf('@');
  if (at < 0) return [];
  return title
    .slice(at + 1)
    .split('、')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The title without its `@place` part. */
export function titleWithoutPlace(title: string): string {
  const at = title.lastIndexOf('@');
  return at < 0 ? title : title.slice(0, at).trim();
}

/** The place a string such as 「萊比錫Leipzig」 or 「神聖羅馬帝國埃森納赫（位於今德國圖林根邦）」 refers to: the longest name or alias it contains. */
export function locate(raw: string, places: Place[]): Place | undefined {
  const text = raw.toLowerCase();
  let best: Place | undefined;
  let length = 0;
  for (const place of places) {
    for (const word of [place.name, ...place.aliases]) {
      if (word.length > length && text.includes(word.toLowerCase())) {
        best = place;
        length = word.length;
      }
    }
  }
  return best;
}

/** Somewhere a person was: a period spent there, or a dated event (birth, death) that names the place. */
export interface Stay {
  timelineId: string;
  /** Decimal years; an event's `end` equals its `start`. */
  start: number;
  end: number;
  /** The period or event title without the place, e.g. 萊比錫時期. */
  title: string;
  dateLabel: string;
  place: Place;
  /** Id of the event, when the stay comes from one. */
  eventId?: string;
}

/** A person's stays in date order, and the place strings the table could not locate. */
export function buildStays(timeline: Timeline, places: Place[]): { stays: Stay[]; unknown: string[] } {
  const stays: Stay[] = [];
  const unknown: string[] = [];
  const add = (title: string, start: number, end: number, dateLabel: string, eventId?: string) => {
    for (const raw of placesInTitle(title)) {
      const place = locate(raw, places);
      if (place) stays.push({ timelineId: timeline.id, start, end, title: titleWithoutPlace(title), dateLabel, place, eventId });
      else unknown.push(raw);
    }
  };
  // A period written as 「1810 ~ 1830」 starts on 1 January, before a birth on 1 March of that year: it cannot begin before the birth.
  const born = timeline.born;
  const notBeforeBirth = (start: number) => (born !== undefined && Math.floor(start) === Math.floor(born) ? Math.max(start, born) : start);
  for (const e of timeline.events) add(e.title, e.date.start, e.date.end ?? e.date.start, e.date.label, e.id);
  for (const p of timeline.periods) add(p.title, notBeforeBirth(p.date.start), p.date.end ?? p.date.start, p.date.label);
  // Stable: at the same moment an event (the birth) comes before the period it opens, and places listed together keep their order.
  stays.sort((a, b) => a.start - b.start);
  return { stays, unknown };
}

/** Where the person was during calendar year `year`: the stay overlapping it that began last (the latest move), if any. */
export function stayInYear(stays: Stay[], year: number): Stay | undefined {
  let found: Stay | undefined;
  for (const s of stays) {
    if (s.start < year + 1 && s.end >= year) found = s;
  }
  return found;
}

/** The stops of a person's route: the stays in order, with consecutive stays at one place merged into the first. */
export function routeOf(stays: Stay[]): Stay[] {
  return stays.filter((s, i) => i === 0 || s.place !== stays[i - 1].place);
}

/** The calendar year in which the most people have a known stay; `fallback` when nobody has any. */
export function busiestYear(people: Stay[][], fallback: number): number {
  const all = people.flat();
  if (all.length === 0) return fallback;
  const from = Math.floor(Math.min(...all.map((s) => s.start)));
  const to = Math.floor(Math.max(...all.map((s) => s.end)));
  let best = from;
  let most = 0;
  for (let year = from; year <= to; year++) {
    const count = people.filter((stays) => stayInYear(stays, year)).length;
    if (count > most) {
      most = count;
      best = year;
    }
  }
  return best;
}
