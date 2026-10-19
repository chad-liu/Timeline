import type { RelatedLink, Timeline } from '../types';
import { formatYear } from './parseDate';
import { groupTimelines } from './timelineOrder';

/** One person in `people.json`. */
export interface PersonEntry {
  id: string;
  /** Display name without the 「生平」/「大事記」 suffix, e.g. 康德. */
  name: string;
  title: string;
  category: string;
  tags: string[];
  /** As written in the frontmatter: `1724-04-22`, `1685`, or a negative year for BC. */
  born: string;
  died: string;
  /** e.g. `1724–1804`, `前469–前399`. */
  years: string;
  /** Vertical view of this timeline. */
  url: string;
  /** The timeline's `related:` links, so a linked site can find which of its pages mention this person. */
  related: RelatedLink[];
  /** Absolute URL of the cover image, when the timeline has one. */
  cover?: string;
}

export interface PeopleIndex {
  source: string;
  site: string;
  count: number;
  people: PersonEntry[];
}

/** 「巴赫生平」→「巴赫」、「蘇東坡生平大事記」→「蘇東坡」 */
export function personName(t: Timeline): string {
  return t.title.replace(/(生平|大事記).*$/, '') || t.title;
}

/**
 * Every timeline with `born`/`died`, in dashboard category order and then by birth,
 * as a small public index other sites can read (published as `people.json`).
 */
export function buildPeopleIndex(timelines: Timeline[], site: string): PeopleIndex {
  const people = groupTimelines(timelines.filter((t) => t.bornDate && t.diedDate && t.born !== undefined && t.died !== undefined)).flatMap((g) =>
    [...g.timelines]
      .sort((a, b) => (a.born ?? 0) - (b.born ?? 0))
      .map((t): PersonEntry => {
        const entry: PersonEntry = {
          id: t.id,
          name: personName(t),
          title: t.title,
          category: g.category,
          tags: t.tags,
          born: t.bornDate!,
          died: t.diedDate!,
          years: `${formatYear(Math.floor(t.born!))}–${formatYear(Math.floor(t.died!))}`,
          url: `${site}#v=vertical&t=${encodeURIComponent(t.id)}`,
          related: t.related,
        };
        if (t.cover) entry.cover = new URL(t.cover, site).href;
        return entry;
      }),
  );
  return { source: "Liu's Timeline", site, count: people.length, people };
}
