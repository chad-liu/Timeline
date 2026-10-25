import matter from 'gray-matter';

/** A person in the name index without a timeline of their own (Data\index\people.md). */
export interface ExtraPerson {
  name: string;
  /** How the person is written in event texts: name, short name, other spellings. */
  terms: string[];
  /** Longer words that contain a term but mean something else. */
  notNames: string[];
  born: number;
  died?: number;
  /** Dashboard tab name, used by the index's category filter. */
  category: string;
  /** Family or group, e.g. 梅迪奇家族. */
  group?: string;
  /** Id of the most relevant timeline, linked from the index. */
  timeline?: string;
  note: string;
}

const words = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter((s): s is string | number => typeof s === 'string' || typeof s === 'number').map(String);

/** Parse the `people:` list in the frontmatter of Data\index\people.md. */
export function parseExtraPeople(source: string): ExtraPerson[] {
  const list: unknown = matter(source).data.people;
  if (!Array.isArray(list)) return [];
  return list.map((raw: Record<string, unknown>, i) => {
    const name = typeof raw.name === 'string' ? raw.name : '';
    const terms = words(raw.terms);
    if (!name || terms.length === 0 || typeof raw.born !== 'number') {
      throw new Error(`people 第 ${i + 1} 筆需要 name、terms 與 born`);
    }
    return {
      name,
      terms,
      notNames: words(raw.notNames),
      born: raw.born,
      died: typeof raw.died === 'number' ? raw.died : undefined,
      category: typeof raw.category === 'string' ? raw.category : '其他',
      group: typeof raw.group === 'string' ? raw.group : undefined,
      timeline: typeof raw.timeline === 'string' ? raw.timeline : undefined,
      note: typeof raw.note === 'string' ? raw.note : '',
    };
  });
}
