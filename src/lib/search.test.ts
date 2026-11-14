import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { highlight, queryTerms, searchTimelines } from './search';

const timeline = (id: string, title: string, events: string) => parseTimeline(`---\ntitle: ${title}\n---\n\n# Events\n${events}`, id);

const timelines = [
  timeline('Bach', '巴赫生平', '## 1723 | 遷居萊比錫\n出任聖多馬教堂的樂長。\n## 1747 | 拜訪波茨坦\n為腓特烈大帝即興演奏。'),
  timeline('Voltaire', '伏爾泰生平', '## 1750 | 前往波茨坦\n應腓特烈大帝之邀，在 Sanssouci 住了三年。\n## 1778 | 逝世於巴黎\n'),
  timeline('Leipzig', '萊比錫大事記', '## 1813 | 民族會戰\n拿破崙在此戰敗。'),
];

describe('queryTerms', () => {
  it('splits on whitespace, lower-cases and drops repeats', () => {
    expect(queryTerms('  Bach　巴赫 bach ')).toEqual(['bach', '巴赫']);
  });
});

describe('highlight', () => {
  it('marks every occurrence, ignoring case', () => {
    expect(highlight('在 Sanssouci 住了三年', ['sans', '三年'])).toEqual([
      { text: '在 ', hit: false },
      { text: 'Sans', hit: true },
      { text: 'souci 住了', hit: false },
      { text: '三年', hit: true },
    ]);
  });
});

describe('searchTimelines', () => {
  it('returns nothing for an empty query', () => {
    expect(searchTimelines(timelines, '  ')).toEqual([]);
  });

  it('finds events by title or body across timelines', () => {
    const groups = searchTimelines(timelines, '腓特烈');
    expect(groups.map((g) => [g.timeline.id, g.hits.map((h) => h.event.title)])).toEqual([
      ['Bach', ['拜訪波茨坦']],
      ['Voltaire', ['前往波茨坦']],
    ]);
    expect(groups[0].hits[0].excerpt).toEqual([
      { text: '為', hit: false },
      { text: '腓特烈', hit: true },
      { text: '大帝即興演奏。', hit: false },
    ]);
  });

  it('requires every term, and is case-insensitive', () => {
    expect(searchTimelines(timelines, '波茨坦 sanssouci').map((g) => g.timeline.id)).toEqual(['Voltaire']);
  });

  it('lets the timeline title supply some of the terms, but not all of them', () => {
    const groups = searchTimelines(timelines, '巴赫 萊比錫');
    expect(groups.map((g) => [g.timeline.id, g.hits.map((h) => h.event.title)])).toEqual([['Bach', ['遷居萊比錫']]]);
  });

  it('lists a timeline whose title matches first, even without matching events', () => {
    const groups = searchTimelines(timelines, '萊比錫');
    expect(groups.map((g) => [g.timeline.id, g.titleHit, g.hits.length])).toEqual([
      ['Leipzig', true, 0],
      ['Bach', false, 1],
    ]);
  });
});
