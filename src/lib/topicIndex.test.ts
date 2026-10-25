import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { buildTopicIndex, parseTopics } from './topicIndex';

const timeline = (id: string, title: string, events: string) => parseTimeline(`---\ntitle: ${title}\n---\n\n# Events\n${events}`, id);

const topics = parseTopics(`---
topics:
  - name: 天花
    group: 疫病與災害
    terms: [天花]
    notTerms: [天花板]
    note: 疫苗最早征服的疾病
  - name: 工業革命
    group: 政治與社會
    terms: [工業革命, 蒸汽機]
    timeline: Industry
---
`);

describe('parseTopics', () => {
  it('reads the list with defaults', () => {
    expect(topics[0]).toEqual({
      name: '天花',
      terms: ['天花'],
      notTerms: ['天花板'],
      group: '疫病與災害',
      timeline: undefined,
      note: '疫苗最早征服的疾病',
    });
    expect(topics[1]).toMatchObject({ timeline: 'Industry', notTerms: [], note: '' });
  });

  it('rejects an entry without terms', () => {
    expect(() => parseTopics('---\ntopics:\n  - name: 某主題\n---\n')).toThrow('第 1 筆');
  });
});

describe('buildTopicIndex', () => {
  const index = buildTopicIndex(
    [
      timeline('Science', '科學大事記', '## 1769 | 瓦特改良蒸汽機\n\n## 1796 | 牛痘接種\n可預防天花。\n\n## 1980 | 天花根除\n'),
      timeline('Industry', '工業革命史', '## 1769 | 蒸汽機\n工業革命的起點。\n'),
      timeline('Montaigne', '蒙田生平', '## 1571 | 退隱\n書房的天花板刻著格言。\n'),
    ],
    topics,
  );

  it('collects the events that mention a term, but not inside a notTerms word', () => {
    const [smallpox] = index;
    expect(smallpox.mentions.map((m) => m.timeline.id)).toEqual(['Science']);
    expect(smallpox.mentions[0].events.map((e) => e.title)).toEqual(['牛痘接種', '天花根除']);
    expect(smallpox.count).toBe(2);
  });

  it('links the devoted timeline and leaves its events out', () => {
    const industry = index[1];
    expect(industry.timeline?.id).toBe('Industry');
    expect(industry.mentions.map((m) => m.timeline.id)).toEqual(['Science']);
  });
});
