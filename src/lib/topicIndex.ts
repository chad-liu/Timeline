import matter from 'gray-matter';
import type { Timeline, TimelineEvent } from '../types';
import { mentions } from './nameIndex';

/** A topic of the topic index (Data\index\topics.md). */
export interface Topic {
  name: string;
  /** Words that mark an event as being about the topic. */
  terms: string[];
  /** Longer words that contain a term but mean something else, e.g. 天花板 for 天花. */
  notTerms: string[];
  /** Topic group, used by the index's filter, e.g. 疫病與災害. */
  group: string;
  /** Id of a timeline devoted to the topic: linked from the index, and its events are not listed again. */
  timeline?: string;
  note: string;
}

const words = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter((s): s is string | number => typeof s === 'string' || typeof s === 'number').map(String);

/** Parse the `topics:` list in the frontmatter of Data\index\topics.md. */
export function parseTopics(source: string): Topic[] {
  const list: unknown = matter(source).data.topics;
  if (!Array.isArray(list)) return [];
  return list.map((raw: Record<string, unknown>, i) => {
    const name = typeof raw.name === 'string' ? raw.name : '';
    const terms = words(raw.terms);
    if (!name || terms.length === 0) throw new Error(`topics 第 ${i + 1} 筆需要 name 與 terms`);
    return {
      name,
      terms,
      notTerms: words(raw.notTerms),
      group: typeof raw.group === 'string' ? raw.group : '其他',
      timeline: typeof raw.timeline === 'string' ? raw.timeline : undefined,
      note: typeof raw.note === 'string' ? raw.note : '',
    };
  });
}

export interface TopicEntry {
  name: string;
  group: string;
  note: string;
  /** The timeline devoted to the topic, when there is one. */
  timeline?: Timeline;
  /** Other timelines that touch the topic, in dashboard order, each with the events that do. */
  mentions: { timeline: Timeline; events: TimelineEvent[] }[];
  /** Total number of mentioning events. */
  count: number;
}

/** Every topic, in the list's order, with the events whose title or text contain one of its terms. */
export function buildTopicIndex(timelines: Timeline[], topics: Topic[]): TopicEntry[] {
  return topics.map((topic) => {
    const found = timelines
      .filter((t) => t.id !== topic.timeline)
      .map((timeline) => ({
        timeline,
        events: timeline.events.filter((e) => mentions(`${e.title}\n${e.text}`, topic.terms, topic.notTerms)),
      }))
      .filter((m) => m.events.length > 0);
    return {
      name: topic.name,
      group: topic.group,
      note: topic.note,
      timeline: timelines.find((t) => t.id === topic.timeline),
      mentions: found,
      count: found.reduce((n, m) => n + m.events.length, 0),
    };
  });
}
