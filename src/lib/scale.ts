import { formatYear } from './parseDate';
import { formatAge } from './ageAxis';

export interface Tick {
  value: number;
  label: string;
  major: boolean;
}

/** Tick intervals in years, from monthly up to 100 000 years. */
const STEPS = [1 / 12, 3 / 12, 6 / 12, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
const MIN_TICK_SPACING = 90;

export function chooseStep(pxPerYear: number): number {
  return STEPS.find((s) => s * pxPerYear >= MIN_TICK_SPACING) ?? STEPS[STEPS.length - 1];
}

/** Ticks covering the decimal-year range [from, to] at the given zoom; on the `age` axis the values are ages (see lib/ageAxis). */
export function makeTicks(from: number, to: number, pxPerYear: number, axis: 'year' | 'age' = 'year'): Tick[] {
  const step = chooseStep(pxPerYear);
  const yearLabel = axis === 'age' ? formatAge : formatYear;
  const monthLabel = (month: number) => (axis === 'age' ? `${month}個月` : `${month + 1}月`);
  const ticks: Tick[] = [];

  if (step < 1) {
    // Iterate in whole months to avoid floating-point drift.
    const months = Math.round(step * 12);
    for (let m = Math.ceil((from * 12) / months) * months; m / 12 <= to; m += months) {
      const year = Math.floor(m / 12);
      const month = m - year * 12;
      ticks.push({ value: m / 12, label: month === 0 ? yearLabel(year) : monthLabel(month), major: month === 0 });
    }
    return ticks;
  }

  for (let v = Math.ceil(from / step) * step; v <= to; v += step) {
    ticks.push({ value: v, label: yearLabel(v), major: v % (step * 5) === 0 });
  }
  return ticks;
}
