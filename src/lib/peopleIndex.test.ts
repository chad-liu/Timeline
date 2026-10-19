import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { buildPeopleIndex } from './peopleIndex';

const timeline = (id: string, frontmatter: string) => parseTimeline(`---\n${frontmatter}\n---\n\n# Events\n## 1800 | 事件\n`, id);

describe('buildPeopleIndex', () => {
  const index = buildPeopleIndex(
    [
      timeline('Kant', 'title: 康德生平\ncategory: 思想家\ntags: [德意志觀念論]\nborn: 1724-04-22\ndied: 1804-02-12\ncover: images/kant.jpg'),
      timeline('Socrates', 'title: 蘇格拉底生平\ncategory: 思想家\nborn: -469\ndied: -399'),
      timeline('Bach', 'title: 巴赫生平\ncategory: 音樂家\nborn: 1685-03-21\ndied: 1750-07-28'),
      timeline('Japan', 'title: 日本史\ncategory: 東方歷史'),
    ],
    'https://example.com/Timeline/',
  );

  it('lists only people, in category order and then by birth', () => {
    expect(index.count).toBe(3);
    expect(index.people.map((p) => p.id)).toEqual(['Bach', 'Socrates', 'Kant']);
  });

  it('describes each person with names, dates and absolute links', () => {
    expect(index.people[2]).toEqual({
      id: 'Kant',
      name: '康德',
      title: '康德生平',
      category: '思想家',
      tags: ['德意志觀念論'],
      born: '1724-04-22',
      died: '1804-02-12',
      years: '1724–1804',
      url: 'https://example.com/Timeline/#v=vertical&t=Kant',
      cover: 'https://example.com/Timeline/data/images/kant.jpg',
    });
    expect(index.people[1]).toMatchObject({ name: '蘇格拉底', born: '-469', years: '前469–前399' });
    expect(index.people[1].cover).toBeUndefined();
  });
});
