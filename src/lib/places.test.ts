import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { buildStays, busiestYear, locate, parsePlaces, placesInTitle, routeOf, stayInYear, titleWithoutPlace } from './places';

const places = parsePlaces(`---
places:
  - { name: 萊比錫, aliases: [Leipzig], lat: 51.34, lon: 12.37 }
  - { name: 埃森納赫, aliases: [Eisenach], lat: 50.97, lon: 10.32 }
  - { name: 威瑪, aliases: [Weimar], lat: 50.98, lon: 11.33 }
  - { name: 彼得堡, lat: 1, lon: 1 }
  - { name: 聖彼得堡, aliases: [Saint Petersburg], lat: 59.94, lon: 30.31 }
---
`);

const bach = parseTimeline(
  `---
title: 巴赫生平
born: 1685-03-21
died: 1750-07-28
---

# Periods
- 1685 ~ 1695 | 幼年@埃森納赫(Eisenach)
- 1700 ~ 1702 | 開始自力
- 1708 ~ 1717 | 威瑪時期@Weimar
- 1717 ~ 1723 | 科騰時期@科騰
- 1723 ~ 1750 | 萊比錫時期@Leipzig

# Events
## 1685-03-21 | 出生@神聖羅馬帝國埃森納赫（位於今德國圖林根邦）
## 1750-07-28 | 逝世@萊比錫Leipzig
`,
  'Bach',
);

describe('parsePlaces', () => {
  it('reads names, aliases and coordinates', () => {
    expect(places[0]).toEqual({ name: '萊比錫', aliases: ['Leipzig'], lat: 51.34, lon: 12.37 });
    expect(places[3].aliases).toEqual([]);
  });

  it('rejects an entry without coordinates', () => {
    expect(() => parsePlaces('---\nplaces:\n  - { name: 某地 }\n---\n')).toThrow('第 1 筆');
  });
});

describe('titles', () => {
  it('splits the places after @', () => {
    expect(placesInTitle('童年@內拉霍澤維斯、茲洛尼采')).toEqual(['內拉霍澤維斯', '茲洛尼采']);
    expect(placesInTitle('開始自力')).toEqual([]);
    expect(titleWithoutPlace('萊比錫時期@Leipzig')).toBe('萊比錫時期');
  });
});

describe('locate', () => {
  it('matches a name or alias inside the string, ignoring case', () => {
    expect(locate('神聖羅馬帝國埃森納赫（位於今德國圖林根邦）', places)?.name).toBe('埃森納赫');
    expect(locate('萊比錫Leipzig', places)?.name).toBe('萊比錫');
    expect(locate('weimar', places)?.name).toBe('威瑪');
  });

  it('prefers the longest word and returns nothing for an unknown place', () => {
    expect(locate('聖彼得堡', places)?.name).toBe('聖彼得堡');
    expect(locate('Italy', places)).toBeUndefined();
  });
});

describe('buildStays', () => {
  const { stays, unknown } = buildStays(bach, places);

  it('collects located periods and events in date order and reports the rest', () => {
    expect(stays.map((s) => [s.place.name, s.title, Math.floor(s.start)])).toEqual([
      ['埃森納赫', '出生', 1685],
      ['埃森納赫', '幼年', 1685],
      ['威瑪', '威瑪時期', 1708],
      ['萊比錫', '萊比錫時期', 1723],
      ['萊比錫', '逝世', 1750],
    ]);
    expect(stays[0].eventId).toBe('Bach-0');
    expect(unknown).toEqual(['科騰']);
  });

  it('finds where the person was in a year, or nowhere between known stays', () => {
    expect(stayInYear(stays, 1690)?.place.name).toBe('埃森納赫');
    expect(stayInYear(stays, 1701)).toBeUndefined();
    expect(stayInYear(stays, 1717)?.place.name).toBe('威瑪');
    expect(stayInYear(stays, 1723)?.place.name).toBe('萊比錫');
    expect(stayInYear(stays, 1751)).toBeUndefined();
  });

  it('merges consecutive stays at one place into a route', () => {
    expect(routeOf(stays).map((s) => s.place.name)).toEqual(['埃森納赫', '威瑪', '萊比錫']);
  });

  it('picks the year with the most people located', () => {
    const other = buildStays(
      parseTimeline('---\ntitle: 某人\nborn: 1700\n---\n\n# Periods\n- 1720 ~ 1730 | 旅居@萊比錫\n', 'X'),
      places,
    ).stays;
    expect(busiestYear([stays, other], 1800)).toBe(1723);
    expect(busiestYear([], 1800)).toBe(1800);
  });
});
