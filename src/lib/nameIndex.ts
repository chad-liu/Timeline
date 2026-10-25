import type { Timeline, TimelineEvent } from '../types';
import type { ExtraPerson } from './extraPeople';
import { formatYear } from './parseDate';
import { personName } from './peopleIndex';
import { UNCATEGORIZED } from './timelineOrder';

export interface NameEntry {
  key: string;
  name: string;
  /** Other spellings shown next to the name. */
  aliases: string[];
  /** e.g. `1685–1750`, or `1931–` for someone alive. */
  years: string;
  born: number;
  category: string;
  color: string;
  /** Family or group (supplementary entries only). */
  group?: string;
  /** One-line description (supplementary entries only). */
  note?: string;
  /** The person's own timelines (biography and works), or the most relevant one for a supplementary entry. */
  links: Timeline[];
  /** Timelines that mention this person, in dashboard order, each with the events that do. */
  mentions: { timeline: Timeline; events: TimelineEvent[] }[];
  /** Total number of mentioning events. */
  count: number;
}

/**
 * Does `text` mention one of `names` outside every `notNames` word?
 * 「巴洛克」 contains 洛克 but is not Locke, so an occurrence inside a notNames match does not count.
 */
export function mentions(text: string, names: string[], notNames: string[]): boolean {
  const blocked: [number, number][] = [];
  for (const word of notNames) {
    for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) blocked.push([i, i + word.length]);
  }
  return names.some((name) => {
    for (let i = text.indexOf(name); i !== -1; i = text.indexOf(name, i + 1)) {
      const end = i + name.length;
      if (!blocked.some(([a, b]) => a <= i && end <= b)) return true;
    }
    return false;
  });
}

function findMentions(timelines: Timeline[], names: string[], notNames: string[], skip: Set<string>) {
  const found = timelines
    .filter((t) => !skip.has(t.id))
    .map((timeline) => ({ timeline, events: timeline.events.filter((e) => mentions(`${e.title}\n${e.text}`, names, notNames)) }))
    .filter((m) => m.events.length > 0);
  return { mentions: found, count: found.reduce((n, m) => n + m.events.length, 0) };
}

const lifeYears = (born: number, died?: number) => `${formatYear(Math.floor(born))}–${died === undefined ? '' : formatYear(Math.floor(died))}`;

/**
 * The name index: every person timeline (one with `born`/`died`) plus the supplementary people of
 * Data\index\people.md, each with the events that mention them by name, `aliases` or `terms`.
 * A person timeline's own events and those of the works list that `follows` it are left out,
 * since every one of them is about the person anyway.
 */
export function buildNameIndex(timelines: Timeline[], extras: ExtraPerson[] = []): NameEntry[] {
  const people = timelines
    .filter((t) => t.born !== undefined && t.died !== undefined)
    .map((person): NameEntry => {
      const name = personName(person);
      const own = timelines.filter((t) => t.id === person.id || t.follows === person.id);
      return {
        key: person.id,
        name,
        aliases: person.aliases,
        years: lifeYears(person.born!, person.died),
        born: person.born!,
        category: person.category ?? UNCATEGORIZED,
        color: person.color,
        links: own,
        ...findMentions(timelines, [name, ...person.aliases], person.notNames, new Set(own.map((t) => t.id))),
      };
    });
  const supplementary = extras.map(
    (p): NameEntry => ({
      key: `extra:${p.name}`,
      name: p.name,
      aliases: p.terms.filter((t) => !p.name.includes(t)),
      years: lifeYears(p.born, p.died),
      born: p.born,
      category: p.category,
      color: '#868e96',
      group: p.group,
      note: p.note,
      links: timelines.filter((t) => t.id === p.timeline),
      ...findMentions(timelines, p.terms, p.notNames, new Set()),
    }),
  );
  return [...people, ...supplementary];
}
