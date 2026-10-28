import { describe, expect, it } from 'vitest';
import { buildLifespanScale } from './lifespanScale';
import { CHINESE_RULERS, reignsInSlice, rulerBars } from './chineseRulers';

describe('CHINESE_RULERS', () => {
  it('lists reigns in order (a reign may begin before the previous dynasty ends, like 元世祖)', () => {
    for (const r of CHINESE_RULERS) expect(r.end).toBeGreaterThanOrEqual(r.start);
    for (let i = 1; i < CHINESE_RULERS.length; i++) expect(CHINESE_RULERS[i].end).toBeGreaterThanOrEqual(CHINESE_RULERS[i - 1].end);
  });
});

describe('rulerBars', () => {
  // Two segments: 1000–1150 and 1550–1950 (the gap in between is cut out).
  const scale = buildLifespanScale([[1037, 1101], [1600, 1900]], 2);

  it('only lays out reigns inside the visible segments, labelled with the reign years', () => {
    const names = rulerBars(scale).map((b) => b.ruler.name);
    expect(names).toContain('宋仁宗');
    expect(names).toContain('康熙');
    expect(names).not.toContain('元世祖');
    expect(names).not.toContain('唐太宗');
    const kangxi = rulerBars(scale).find((b) => b.ruler.name === '康熙')!;
    expect(kangxi.label).toBe('康熙（1661–1722）');
    expect(kangxi.title).toBe('清 康熙（1661–1722 在位）');
    expect(kangxi.left).toBe(scale.xOf(1661));
    expect(kangxi.width).toBe(scale.xOf(1722) - scale.xOf(1661));
  });

  it('cuts a reign at a segment edge', () => {
    const gaozong = rulerBars(scale).find((b) => b.ruler.name === '宋高宗')!;
    expect(gaozong.left + gaozong.width).toBe(scale.xOf(1150));
    const jiajing = rulerBars(scale).find((b) => b.ruler.name === '嘉靖')!;
    expect(jiajing.left).toBe(scale.xOf(1550));
    expect(jiajing.label).toBe('嘉靖（1521–1567）');
  });

  it('starts an overlapping reign where the previous one ends', () => {
    const wide = buildLifespanScale([[1200, 1300]], 2);
    const shizu = rulerBars(wide).find((b) => b.ruler.name === '元世祖')!;
    expect(shizu.left).toBe(wide.xOf(1279));
    expect(shizu.title).toBe('元 元世祖（1260–1294 在位）');
  });
});

describe('reignsInSlice', () => {
  it('names the era year for Ming and Qing', () => {
    expect(reignsInSlice(1789, 1790)).toEqual(['清乾隆54年']);
    expect(reignsInSlice(1736, 1737)).toEqual(['清乾隆元年']);
    // The accession year still counts in the old era.
    expect(reignsInSlice(1735, 1736)).toEqual(['清雍正13年']);
    expect(reignsInSlice(1425, 1426)).toEqual(['明洪熙元年']);
  });

  it('names the emperor and his reign for the other dynasties', () => {
    expect(reignsInSlice(1000, 1001)).toEqual(['北宋 宋真宗（997–1022 在位）']);
    expect(reignsInSlice(997, 998)).toEqual(['北宋 宋太宗（976–997 在位）、北宋 宋真宗（997–1022 在位）']);
    expect(reignsInSlice(-221, -220)).toEqual(['秦 秦始皇（前221–前210 在位）']);
  });

  it('gives one entry per dynasty when two overlap', () => {
    expect(reignsInSlice(1644, 1645)).toEqual(['明崇禎17年', '清順治元年']);
  });

  it('lists the reigns of a decade or century', () => {
    expect(reignsInSlice(1730, 1740)).toEqual(['清：雍正、乾隆']);
    expect(reignsInSlice(1600, 1700)).toEqual(['明：萬曆、天啟、崇禎', '清：順治、康熙']);
  });

  it('gives nothing for periods of division or before the list', () => {
    expect(reignsInSlice(230, 231)).toEqual([]);
    expect(reignsInSlice(-600, -599)).toEqual([]);
  });
});
