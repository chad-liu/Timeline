import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { eraChain } from './japanEras';
import { buildLifespanScale } from './lifespanScale';
import { rulerBars } from './chineseRulers';

const japan = parseTimeline(fs.readFileSync(new URL('../../Data/Japan.md', import.meta.url), 'utf8'), 'Japan');

describe('eraChain', () => {
  it('keeps the consecutive eras of Japan.md and drops the overlapping bands', () => {
    const names = eraChain(japan).map((e) => e.name);
    expect(names[0]).toBe('舊石器時代');
    expect(names).toContain('安土桃山時代');
    expect(names).toContain('江戶時代');
    expect(names.at(-1)).toBe('令和時代');
    expect(names).not.toContain('東亞地緣大重組');
    expect(names.some((n) => n.includes('掌權') || n.includes('親政'))).toBe(false);
    const eras = eraChain(japan);
    for (let i = 1; i < eras.length; i++) expect(eras[i].start).toBeGreaterThanOrEqual(eras[i - 1].end);
  });

  it('is empty without the timeline', () => {
    expect(eraChain(undefined)).toEqual([]);
  });

  it('labels eras without the 在位 wording used for emperors', () => {
    const scale = buildLifespanScale([[1600, 1900]], 3);
    const edo = rulerBars(scale, eraChain(japan), '').find((b) => b.ruler.name === '江戶時代')!;
    expect(edo.label).toBe('江戶時代（1603–1868）');
    expect(edo.title).toBe('日本 江戶時代（1603–1868）');
    expect(edo.ruler.color).toBe('#364fc7');
  });
});
