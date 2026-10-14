import type { Precision, TimePoint } from '../types';

const CUMULATIVE_DAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
/** "BP" (before present) is conventionally counted from 1950. */
const BP_BASE = 1950;
/** Reference year for loose phrases such as「約七千年前」. */
const PRESENT = 2000;
const CN_DIGITS: Record<string, number> = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
const CN_UNITS: Record<string, number> = { 百: 100, 千: 1000, 萬: 10000, 億: 100000000 };

export function formatYear(year: number): string {
  return year < 0 ? `前${-year}` : String(year);
}

function point(start: number, precision: Precision, label: string, end?: number): TimePoint {
  return end === undefined ? { start, precision, label } : { start, end, precision, label };
}

function parseMonth(raw: string, month: number): number {
  if (month < 1 || month > 12) throw new Error(`月份超出範圍「${raw}」`);
  return month;
}

function parseSingle(raw: string): TimePoint {
  let m: RegExpMatchArray | null;

  if ((m = raw.match(/^(-?\d+)-(\d{1,2})-(\d{1,2})$/))) {
    const year = Number(m[1]);
    const month = parseMonth(raw, Number(m[2]));
    const day = Number(m[3]);
    const start = year + (CUMULATIVE_DAYS[month - 1] + day - 1) / 365;
    return point(start, 'day', `${formatYear(year)}年${month}月${day}日`);
  }

  if ((m = raw.match(/^(-?\d+)-(\d{1,2})$/))) {
    const year = Number(m[1]);
    const month = parseMonth(raw, Number(m[2]));
    return point(year + (month - 1) / 12, 'month', `${formatYear(year)}年${month}月`);
  }

  if ((m = raw.match(/^(-?\d+)\s*年?$/))) {
    const year = Number(m[1]);
    return point(year, 'year', `${formatYear(year)}年`);
  }

  if ((m = raw.match(/^(?:西元前|前)\s*(\d+)\s*年?$/) ?? raw.match(/^(\d+)\s*BC$/i))) {
    const year = -Number(m[1]);
    return point(year, 'year', `${formatYear(year)}年`);
  }

  if ((m = raw.match(/^(-?\d+)\s*(?:c|世紀)$/i) ?? raw.match(/^(?:西元前|前)\s*(\d+)\s*世紀$/))) {
    const n = raw.startsWith('-') || /^(西元前|前)/.test(raw) ? -Math.abs(Number(m[1])) : Number(m[1]);
    if (n > 0) return point((n - 1) * 100, 'century', `${n}世紀`, n * 100);
    return point(n * 100, 'century', `前${-n}世紀`, (n + 1) * 100);
  }

  if ((m = raw.match(/^~\s*(\d+(?:\.\d+)?)\s*BP$/i))) {
    const years = Number(m[1]);
    return point(BP_BASE - years, 'approx', `約${years}年前`);
  }

  if ((m = raw.match(/^約?\s*(\d+(?:\.\d+)?|[一二兩三四五六七八九十])\s*([百千萬億]?)\s*年前$/))) {
    const amount = /^\d/.test(m[1]) ? Number(m[1]) : CN_DIGITS[m[1]];
    const years = amount * (CN_UNITS[m[2]] ?? 1);
    return point(PRESENT - years, 'approx', raw.startsWith('約') ? raw : `約${raw}`);
  }

  throw new Error(`無法解析日期「${raw}」`);
}

/**
 * Parse the date syntax used in Data\*.md, e.g.
 * `1685-03-21`, `1685-03`, `1685`, `-221`, `14c`, `14世紀`, `1642 ~ 1649`, `~50000 BP`, `約5萬～3萬年前`.
 */
export function parseDate(input: string): TimePoint {
  const raw = input.trim();
  const range = raw.match(/^(.+?)\s*[~～]\s*(.+)$/);
  if (!range) return parseSingle(raw);

  let left = range[1];
  const right = range[2];
  // 「約5萬～3萬年前」: the suffix is written only once.
  if (/年前$/.test(right) && !/年前$/.test(left)) left += '年前';

  const a = parseSingle(left);
  const b = parseSingle(right);
  const end = b.end ?? b.start;
  if (end < a.start) throw new Error(`日期區間的結束早於開始「${raw}」`);

  let label = `${a.label} ~ ${b.label}`;
  if (a.precision === 'year' && b.precision === 'year') label = `${formatYear(a.start)}~${formatYear(b.start)}年`;
  else if (a.precision === 'approx' && b.precision === 'approx') label = raw;
  return point(a.start, a.precision, label, end);
}
