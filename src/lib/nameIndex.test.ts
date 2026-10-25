import { describe, expect, it } from 'vitest';
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
  });
});
