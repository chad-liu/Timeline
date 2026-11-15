import { describe, expect, it } from 'vitest';
import { JAPAN_EMPERORS, JAPAN_ERAS, japanInSlice } from './japanRulers';

const year = (y: number) => japanInSlice(y, y + 1);

describe('the tables', () => {
  it('keep every era and reign in order within its court, never ending before it starts', () => {
    for (const list of [JAPAN_ERAS, JAPAN_EMPERORS]) {
      for (const r of list) expect(r.end, r.name).toBeGreaterThanOrEqual(r.start);
      for (const court of new Set(list.map((r) => r.dynasty))) {
        const line = list.filter((r) => r.dynasty === court);
        for (let i = 1; i < line.length; i++) expect(line[i].start, line[i].name).toBeGreaterThanOrEqual(line[i - 1].start);
      }
    }
  });

  it('count 248 era names, the two courts included', () => {
    // 建武 and 明德 are entered twice (once per court), 天平感寶 and the like once.
    expect(JAPAN_ERAS.length).toBe(250);
    expect(new Set(JAPAN_ERAS.map((r) => r.name)).size).toBe(248);
  });
});

describe('japanInSlice', () => {
  it('names the era year and the emperor of a single year', () => {
    expect(year(1789)).toEqual(['日本寬政元年（光格天皇）']);
    expect(year(1603)).toEqual(['日本慶長8年（後陽成天皇）']);
    expect(year(1945)).toEqual(['日本昭和20年（昭和天皇）']);
    expect(year(2026)).toEqual(['日本令和8年（德仁天皇）']);
  });

  it('takes the new era in a year of change and lists both emperors', () => {
    expect(year(1989)).toEqual(['日本平成元年（昭和天皇、明仁天皇）']);
    expect(year(1868)).toEqual(['日本明治元年（明治天皇）']);
    expect(year(1817)).toEqual(['日本文化14年（光格天皇、仁孝天皇）']);
  });

  it('names the emperor alone where there is no era', () => {
    expect(year(600)).toEqual(['日本 推古天皇（593–628 在位）']);
    expect(year(654)).toEqual(['日本白雉5年（孝德天皇）']);
    expect(year(660)).toEqual(['日本 齊明天皇（655–661 在位）']);
    expect(year(400)).toEqual([]);
  });

  it('gives both courts between 1336 and 1392, and one again afterwards', () => {
    expect(year(1335)).toEqual(['日本建武2年（後醍醐天皇）']);
    expect(year(1350)).toEqual(['日本南朝正平5年（後村上天皇）', '日本北朝觀應元年（崇光天皇）']);
    expect(year(1337)).toEqual(['日本南朝延元2年（後醍醐天皇）', '日本北朝建武4年（光明天皇）']);
    expect(year(1392)).toEqual(['日本南朝元中9年（後龜山天皇）', '日本北朝明德3年（後小松天皇）']);
    expect(year(1393)).toEqual(['日本明德4年（後小松天皇）']);
  });

  it('lists the eras and emperors of a decade, and only the emperors of a century', () => {
    expect(japanInSlice(1780, 1790)).toEqual(['日本：安永、天明、寬政（光格天皇）']);
    expect(japanInSlice(1700, 1800)).toEqual(['日本：東山天皇、中御門天皇、櫻町天皇、桃園天皇、後櫻町天皇、後桃園天皇、光格天皇']);
  });
});
