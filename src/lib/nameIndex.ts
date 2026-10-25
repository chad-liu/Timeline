import type { Timeline, TimelineEvent } from '../types';
import { personName } from './peopleIndex';

export interface NameEntry {
  person: Timeline;
  name: string;
  /** Other timelines that mention this person, in dashboard order, each with the events that do. */
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

/**
 * The name index: every person timeline (one with `born`/`died`) and the events of other timelines
 * that mention the person by name or `aliases`. The person's own timeline and the works list that
 * `follows` it are left out, since every event there is about the person anyway.
 */
export function buildNameIndex(timelines: Timeline[]): NameEntry[] {
  return timelines
    .filter((t) => t.born !== undefined && t.died !== undefined)
    .map((person) => {
      const name = personName(person);
      const names = [name, ...person.aliases];
      const mentioning = timelines
        .filter((t) => t.id !== person.id && t.follows !== person.id)
        .map((timeline) => ({
          timeline,
          events: timeline.events.filter((e) => mentions(`${e.title}\n${e.text}`, names, person.notNames)),
        }))
        .filter((m) => m.events.length > 0);
      return { person, name, mentions: mentioning, count: mentioning.reduce((n, m) => n + m.events.length, 0) };
    });
}
