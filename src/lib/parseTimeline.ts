import matter from 'gray-matter';
import { Marked } from 'marked';
import type { Period, RelatedLink, Timeline, TimelineEvent } from '../types';
import { parseDate } from './parseDate';

const DEFAULT_COLOR = '#6200ea';
/** Relative asset paths in Data\ are served under this prefix (see vite-plugin-timelines.ts). */
export const ASSET_PREFIX = 'data/';

const markdown = new Marked({ breaks: true });

function resolveAsset(src: string): string {
  if (/^(https?:|data:|\/)/.test(src)) return src;
  return ASSET_PREFIX + src.replace(/^\.\//, '');
}

/** Split a trailing `{key=value key2="value 2"}` attribute block off a heading. */
function splitAttrs(raw: string): { text: string; attrs: Record<string, string> } {
  const m = raw.match(/\{([^{}]*)\}\s*$/);
  if (!m || m.index === undefined) return { text: raw.trim(), attrs: {} };
  const attrs: Record<string, string> = {};
  for (const [, key, value] of m[1].matchAll(/(\w+)=("[^"]*"|\S+)/g)) {
    attrs[key] = value.replace(/^"|"$/g, '');
  }
  return { text: raw.slice(0, m.index).trim(), attrs };
}

interface DraftEvent {
  dateRaw: string;
  title: string;
  attrs: Record<string, string>;
  body: string[];
  line: number;
}

/** Markdown body → html, plain text, and a leading image used as the thumbnail. */
function renderBody(lines: string[]): { html: string; text: string; image?: string } {
  let body = lines.join('\n').trim();
  let image: string | undefined;
  const lead = body.match(/^!\[[^\]]*\]\(([^)\s]+)[^)]*\)[ \t]*(\n|$)/);
  if (lead) {
    image = resolveAsset(lead[1]);
    body = body.slice(lead[0].length).trim();
  }
  body = body.replace(/!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (_all, alt: string, src: string, rest: string) => `![${alt}](${resolveAsset(src)}${rest})`);

  const html = markdown.parse(body, { async: false }) as string;
  const text = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { html, text, image };
}

function buildEvent(draft: DraftEvent, timelineId: string, index: number): TimelineEvent {
  const date = parseDate(draft.dateRaw);
  if (draft.attrs.label) date.label = draft.attrs.label;
  // `{age=17}` states the age outright when the date alone is too vague to compute it.
  if (draft.attrs.age) date.label += `（${draft.attrs.age}歲）`;

  return {
    id: `${timelineId}-${index}`,
    timelineId,
    date,
    title: draft.title,
    ...renderBody(draft.body),
    color: draft.attrs.color,
  };
}

/** Frontmatter `related:` — a list of `- label: url` entries; anything that is not an http(s) link is dropped. */
function relatedLinks(value: unknown): RelatedLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => (item && typeof item === 'object' ? Object.entries(item as Record<string, unknown>) : []))
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && /^https?:\/\//.test(entry[1]))
    .map(([label, url]) => ({ label, url }));
}

/** A frontmatter list of words, e.g. `aliases: [巴哈]`; a single string counts as a one-item list. */
function stringList(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).filter((s): s is string => typeof s === 'string' && s.length > 0);
}

/** A frontmatter date such as `born: 1724-04-22` as text; YAML may already have turned it into a Date. */
function frontmatterDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
}

/**
 * Append the person's age to each event label between `born` and `died`, e.g. 「1781年（57歲）」.
 * Year-only events count the age reached that year, and month-only events count the birthday as passed
 * in the birth month; events before the first birthday or after death get none.
 */
function addAges(events: TimelineEvent[], bornRaw: string, diedRaw?: string): void {
  const born = parseDate(bornRaw);
  const died = diedRaw === undefined ? undefined : parseDate(diedRaw);
  const last = died ? (died.end ?? died.start) : Infinity;
  const bornYear = Math.floor(born.start);
  const bornMonth = (Number(bornRaw.match(/^-?\d+-(\d{1,2})/)?.[1]) || 1) - 1;
  for (const e of events) {
    const { start, precision } = e.date;
    if (precision === 'approx' || precision === 'century' || start > last || e.date.label.endsWith('歲）')) continue;
    const year = Math.floor(start);
    const month = Math.floor((start - year) * 12 + 1e-9);
    const age =
      precision === 'year' ? year - bornYear : precision === 'month' ? year - bornYear - (month < bornMonth ? 1 : 0) : Math.floor(start - born.start + 1e-9);
    if (age > 0) e.date = { ...e.date, label: `${e.date.label}（${age}歲）` };
  }
}

/**
 * Parse one Data\*.md file:
 *   frontmatter (title / color / description / cover / category / tags / related / see / sortLast / follows / squeeze / born / died / aliases / notNames),
 *   `# Periods` list items `- date | title | color`, with indented lines below as the description,
 *   `# Events` with `## date | title {attrs}` headings followed by a markdown body.
 */
export function parseTimeline(source: string, id: string): Timeline {
  const { data, content } = matter(source);
  const color = typeof data.color === 'string' ? data.color : DEFAULT_COLOR;
  const periodDrafts: { period: Omit<Period, 'html' | 'text' | 'image'>; body: string[] }[] = [];
  const drafts: DraftEvent[] = [];
  let section: 'periods' | 'events' | null = null;
  let current: DraftEvent | null = null;

  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    if (h1) {
      current = null;
      const name = h1[1].toLowerCase();
      section = name === 'periods' || name === '時期' ? 'periods' : name === 'events' || name === '事件' ? 'events' : null;
      return;
    }

    if (section === 'periods') {
      const item = line.match(/^[-*]\s+(.+)$/);
      if (!item) {
        // Indented (or blank) lines continue the previous item as its description.
        if (/^\s+\S/.test(line) || line.trim() === '') periodDrafts.at(-1)?.body.push(line.replace(/^(\t| {1,4})/, ''));
        return;
      }
      const { text, attrs } = splitAttrs(item[1]);
      const [dateRaw, title = '', periodColor] = text.split('|').map((s) => s.trim());
      try {
        periodDrafts.push({ period: { date: parseDate(dateRaw), title, color: periodColor || attrs.color || color }, body: [] });
      } catch (err) {
        throw new Error(`第 ${i + 1} 行：${(err as Error).message}`);
      }
      return;
    }

    if (section === 'events') {
      const h2 = line.match(/^##\s+(.+)$/);
      if (h2) {
        const { text, attrs } = splitAttrs(h2[1]);
        const bar = text.indexOf('|');
        current = {
          dateRaw: bar === -1 ? text : text.slice(0, bar).trim(),
          title: bar === -1 ? '' : text.slice(bar + 1).trim(),
          attrs,
          body: [],
          line: i + 1,
        };
        drafts.push(current);
        return;
      }
      (current as DraftEvent | null)?.body.push(line);
    }
  });

  const events = drafts
    .map((draft, index) => {
      try {
        return buildEvent(draft, id, index);
      } catch (err) {
        throw new Error(`第 ${draft.line} 行：${(err as Error).message}`);
      }
    })
    .sort((a, b) => a.date.start - b.date.start);
  const born = frontmatterDate(data.born);
  const died = frontmatterDate(data.died);
  if (born) addAges(events, born, died);

  const periods: Period[] = periodDrafts
    .map(({ period, body }) => ({ ...period, ...renderBody(body) }))
    .sort((a, b) => a.date.start - b.date.start);

  return {
    id,
    title: typeof data.title === 'string' ? data.title : id,
    color,
    description: typeof data.description === 'string' ? data.description : '',
    cover: typeof data.cover === 'string' ? resolveAsset(data.cover) : undefined,
    category: typeof data.category === 'string' ? data.category : undefined,
    tags: stringList(data.tags),
    aliases: stringList(data.aliases),
    notNames: stringList(data.notNames),
    related: relatedLinks(data.related),
    see: stringList(data.see),
    born: born ? parseDate(born).start : undefined,
    died: died ? parseDate(died).start : undefined,
    bornDate: born,
    diedDate: died,
    sortLast: data.sortLast === true,
    follows: typeof data.follows === 'string' && data.follows.length > 0 ? data.follows : undefined,
    squeeze: typeof data.squeeze === 'number' && data.squeeze > 0 ? data.squeeze : undefined,
    periods,
    events,
  };
}
