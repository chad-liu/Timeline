import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { buildWorkIndex, worksInText } from './workIndex';

const timeline = (id: string, title: string, events: string) => parseTimeline(`---\ntitle: ${title}\n---\n\n# Events\n${events}`, id);

const timelines = [
  timeline(
    'Bach',
    '巴赫生平',
    '## 1727 | 《馬太受難曲》首演\n在萊比錫首演。\n## 1741 | 《郭德堡變奏曲》\n出版《郭德堡變奏曲》。\n## 1829 | 復演\n孟德爾頌復演《馬太受難曲》。',
  ),
  timeline('Mendelssohn', '孟德爾頌生平', '## 1829 | 指揮《馬太受難曲》\n距巴赫去世已 79 年。\n## 1826 | 《仲夏夜之夢》序曲\n'),
  timeline('Shakespeare', '莎士比亞生平', '## 1595 | 《仲夏夜之夢》\n寫成喜劇《仲夏夜之夢》。'),
];

describe('worksInText', () => {
  it('returns the distinct titles in order', () => {
    expect(worksInText('先寫《甲》，再寫《乙》與《甲》。沒有書名號的不算，《》也不算。')).toEqual(['甲', '乙']);
  });
});

describe('buildWorkIndex', () => {
  const index = buildWorkIndex(timelines);
  const work = (title: string) => index.find((w) => w.title === title)!;

  it('lists every title once, ordered by its first appearance in its main timeline', () => {
    expect(index.map((w) => [w.title, Math.floor(w.first.date.start)])).toEqual([
      ['仲夏夜之夢', 1595],
      ['馬太受難曲', 1727],
      ['郭德堡變奏曲', 1741],
    ]);
  });

  it('counts an event once even when it names the work in both title and body', () => {
    expect(work('郭德堡變奏曲')).toMatchObject({ count: 1, mentions: [{ events: [{ id: 'Bach-1' }] }] });
  });

  it('takes the timeline with the most mentioning events as the main one, listed first', () => {
    const passion = work('馬太受難曲');
    expect(passion.main.id).toBe('Bach');
    expect(passion.count).toBe(3);
    expect(passion.mentions.map((m) => [m.timeline.id, m.events.length])).toEqual([
      ['Bach', 2],
      ['Mendelssohn', 1],
    ]);
  });

  it('breaks a tie by the earliest mention', () => {
    expect(work('仲夏夜之夢').main.id).toBe('Shakespeare');
  });

  it('prefers any other timeline to a travel timeline as the main one', () => {
    const travels = parseTimeline(
      '---\ntitle: 巴赫行旅\nrouteOf: Bach\n---\n\n# Events\n## 1727 | 《馬太受難曲》\n## 1728 | 再演《馬太受難曲》\n## 1729 | 三演《馬太受難曲》\n## 1730 | 《咖啡清唱劇》\n',
      'BachTravels',
    );
    const withTravels = buildWorkIndex([travels, ...timelines]);
    expect(withTravels.find((w) => w.title === '馬太受難曲')).toMatchObject({ main: { id: 'Bach' }, count: 6 });
    expect(withTravels.find((w) => w.title === '咖啡清唱劇')?.main.id).toBe('BachTravels');
  });
});
