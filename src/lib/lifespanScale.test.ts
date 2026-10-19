import { describe, expect, it } from 'vitest';
import { BREAK_PX, EDGE_PX, buildLifespanScale, lifespanTicks } from './lifespanScale';

describe('buildLifespanScale', () => {
  const spans: [number, number][] = [
    [-469, -399],
    [1037, 1101],
    [1685, 1750],
    [1770, 1827],
  ];
  const scale = buildLifespanScale(spans, 2);

  it('merges nearby spans and cuts out long empty stretches', () => {
    expect(scale.segments.map((s) => [s.start, s.end])).toEqual([
      [-500, -350],
      [1000, 1150],
      [1650, 1850],
    ]);
  });

  it('maps years to pixels across the breaks', () => {
    expect(scale.xOf(-500)).toBe(EDGE_PX);
    expect(scale.xOf(1000)).toBe(EDGE_PX + 150 * 2 + BREAK_PX);
    expect(scale.xOf(1700)).toBe(EDGE_PX + 150 * 2 + BREAK_PX + 150 * 2 + BREAK_PX + 50 * 2);
    expect(scale.width).toBe((150 + 150 + 200) * 2 + 2 * BREAK_PX + 2 * EDGE_PX);
    expect(scale.yearAt(scale.xOf(1700))).toBe(1700);
  });

  it('puts ticks every 100 years when zoomed out, skipping a segment end before a break', () => {
    expect(lifespanTicks(scale)).toEqual([-500, -400, 1000, 1100, 1700, 1800]);
    expect(lifespanTicks(buildLifespanScale([[1037, 1101], [1685, 1750]], 3))).toEqual([1000, 1050, 1100, 1650, 1700, 1750, 1800]);
  });
});
