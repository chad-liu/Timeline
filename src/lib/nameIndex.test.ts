import { describe, expect, it } from 'vitest';
import { parseExtraPeople } from './extraPeople';
import { buildNameIndex, mentions } from './nameIndex';
import { parseTimeline } from './parseTimeline';

const timeline = (id: string, frontmatter: string, events: string) => parseTimeline(`---\n${frontmatter}\n---\n\n# Events\n${events}`, id);

describe('mentions', () => {
  it('finds a name or an alias', () => {
    expect(mentions('洛克的《政府論》', ['洛克'], [])).toBe(true);
    expect(mentions('巴哈與韓德爾同年誕生', ['巴赫', '巴哈'], [])).toBe(true);
    expect(mentions('牛頓與萊布尼茲', ['洛克'], [])).toBe(false);
  });

  it('ignores a name inside a notNames word, but not elsewhere in the same text', () => {
    expect(mentions('巴洛克繪畫', ['洛克'], ['巴洛克'])).toBe(false);
    expect(mentions('巴洛克繪畫影響了洛克', ['洛克'], ['巴洛克'])).toBe(true);
    expect(mentions('奧芬巴哈的歌劇', ['巴赫', '巴哈'], ['奧芬巴哈'])).toBe(false);
  });
});

describe('buildNameIndex', () => {
  const index = buildNameIndex([
    timeline('Locke', 'title: 洛克生平\nborn: 1632\ndied: 1704\nnotNames: [巴洛克]', '## 1690 | 《政府論》\n洛克出版《政府論》。\n'),
    timeline('LockeWorks', 'title: 洛克主要作品\nfollows: Locke', '## 1690 | 《人類理解論》\n洛克的知識論。\n'),
    timeline('Art', 'title: 藝術史', '## 1600 | 巴洛克\n巴洛克藝術興起。\n\n## 1700 | 啟蒙\n洛克影響了啟蒙運動。\n'),
    timeline('Music', 'title: 音樂史', '## 1685 | 誕生\n巴哈出生。\n'),
  ]);

  it('lists only people', () => {
    expect(index.map((e) => e.name)).toEqual(['洛克']);
  });

  it('collects mentions from other timelines but not from the person own works list', () => {
    const [locke] = index;
    expect(locke.mentions.map((m) => m.timeline.id)).toEqual(['Art']);
    expect(locke.mentions[0].events.map((e) => e.title)).toEqual(['啟蒙']);
    expect(locke.count).toBe(1);
    expect(locke.links.map((t) => t.id)).toEqual(['Locke', 'LockeWorks']);
    expect(locke.years).toBe('1632–1704');
  });
});

describe('supplementary people', () => {
  const timelines = [
    timeline('Medici', 'title: 梅迪奇家族', '## 1464 | 科西莫去世\n科西莫被尊為祖國之父。\n\n## 1569 | 托斯卡尼大公\n科西莫一世受封大公。\n'),
    timeline('TSMC', 'title: 台積電', '## 1987 | 台積電成立\n張忠謀任董事長。\n'),
  ];
  const extras = parseExtraPeople(`---
people:
  - name: 科西莫·德·梅迪奇（老科西莫）
    terms: [科西莫]
    notNames: [科西莫一世]
    born: 1389
    died: 1464
    category: 西方歷史
    group: 梅迪奇家族
    timeline: Medici
    note: 祖國之父
  - name: 張忠謀
    terms: [張忠謀]
    born: 1931
    category: 經濟商業
---
`);
  const index = buildNameIndex(timelines, extras);

  it('parses the list', () => {
    expect(extras[0]).toMatchObject({ terms: ['科西莫'], notNames: ['科西莫一世'], born: 1389, died: 1464, group: '梅迪奇家族' });
    expect(extras[1].died).toBeUndefined();
  });

  it('matches terms, skips notNames and includes the linked timeline itself', () => {
    const cosimo = index.find((e) => e.name.startsWith('科西莫'))!;
    expect(cosimo.mentions.map((m) => m.timeline.id)).toEqual(['Medici']);
    expect(cosimo.mentions[0].events.map((e) => e.title)).toEqual(['科西莫去世']);
    expect(cosimo.links.map((t) => t.id)).toEqual(['Medici']);
    expect(cosimo.aliases).toEqual([]);
  });

  it('shows an open end for someone alive', () => {
    expect(index.find((e) => e.name === '張忠謀')!.years).toBe('1931–');
  });

  it('rejects an entry without terms', () => {
    expect(() => parseExtraPeople('---\npeople:\n  - name: 某人\n    born: 1900\n---\n')).toThrow('第 1 筆');
  });
});
