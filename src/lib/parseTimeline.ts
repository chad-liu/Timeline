import matter from 'gray-matter';
import { Marked } from 'marked';
import type { Period, Timeline, TimelineEvent, TimePoint } from '../types';
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

  return {
    id: `${timelineId}-${index}`,
    timelineId,
    date,
    title: draft.title,
    ...renderBody(draft.body),
    color: draft.attrs.color,
  };
}

/** A frontmatter date such as `born: 1724-04-22`; YAML may already have turned it into a Date. */
function frontmatterDate(value: unknown): TimePoint | undefined {
  if (value instanceof Date) return parseDate(value.toISOString().slice(0, 10));
  if (typeof value === 'string' || typeof value === 'number') return parseDate(String(value));
  return undefined;
}

/**
 * Append the person's age to each event label between `born` and `died`, e.g. 「1781年（57歲）」.
 * Year-only events count the age reached that year; events before the first birthday or after death get none.
 */
function addAges(events: TimelineEvent[], born: TimePoint, died?: TimePoint): void {
  const last = died ? (died.end ?? died.start) : Infinity;
  for (const e of events) {
    const { start, precision } = e.date;
    if (precision === 'approx' || precision === 'century' || start > last) continue;
    const age = precision === 'year' ? Math.floor(start) - Math.floor(born.start) : Math.floor(start - born.start + 1e-9);
    if (age > 0) e.date = { ...e.date, label: `${e.date.label}（${age}歲）` };
  }
}

/**
 * Parse one Data\*.md file:
 *   frontmatter (title / color / description / cover / category / tags / sortLast / born / died),
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
  if (born) addAges(events, born, frontmatterDate(data.died));

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
    tags: (Array.isArray(data.tags) ? data.tags : [data.tags]).filter((t): t is string => typeof t === 'string' && t.length > 0),
    sortLast: data.sortLast === true,
    periods,
    events,
  };
}
