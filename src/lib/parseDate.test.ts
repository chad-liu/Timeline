import { describe, expect, it } from 'vitest';
import { parseDate } from './parseDate';

describe('parseDate', () => {
  it('parses day, month and year precision', () => {
    expect(parseDate('1685-03-21')).toMatchObject({ precision: 'day', label: '1685年3月21日' });
    expect(parseDate('1685-03-21').start).toBeCloseTo(1685 + 79 / 365);
    expect(parseDate('1707-10')).toMatchObject({ start: 1707 + 9 / 12, precision: 'month', label: '1707年10月' });
    expect(parseDate('1701')).toMatchObject({ start: 1701, precision: 'year', label: '1701年' });
    expect(parseDate('1621年')).toMatchObject({ start: 1621, label: '1621年' });
  });

  it('parses BC years', () => {
    expect(parseDate('-221')).toMatchObject({ start: -221, label: '前221年' });
    expect(parseDate('西元前221年')).toMatchObject({ start: -221 });
    expect(parseDate('221 BC')).toMatchObject({ start: -221 });
  });

  it('parses centuries as spans', () => {
    expect(parseDate('14c')).toEqual({ start: 1300, end: 1400, precision: 'century', label: '14世紀' });
    expect(parseDate('16世紀')).toMatchObject({ start: 1500, end: 1600 });
    expect(parseDate('前5世紀')).toMatchObject({ start: -500, end: -400, label: '前5世紀' });
  });

  it('parses ranges', () => {
    expect(parseDate('1685 ~ 1695')).toEqual({ start: 1685, end: 1695, precision: 'year', label: '1685~1695年' });
    expect(parseDate('16c ~ 17c')).toMatchObject({ start: 1500, end: 1700 });
    expect(parseDate('-221 ~ -206')).toMatchObject({ start: -221, end: -206, label: '前221~前206年' });
  });

  it('parses approximate dates', () => {
    expect(parseDate('~50000 BP')).toMatchObject({ start: 1950 - 50000, precision: 'approx' });
    expect(parseDate('約七千年前')).toMatchObject({ start: 2000 - 7000, label: '約七千年前' });
    expect(parseDate('約5萬～3萬年前')).toMatchObject({ start: 2000 - 50000, end: 2000 - 30000, label: '約5萬～3萬年前' });
  });

  it('rejects invalid input', () => {
    expect(() => parseDate('明天')).toThrow('無法解析日期');
    expect(() => parseDate('1700-13')).toThrow('月份超出範圍');
    expect(() => parseDate('1700 ~ 1600')).toThrow('結束早於開始');
  });
});
