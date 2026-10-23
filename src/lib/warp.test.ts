import { describe, expect, it } from 'vitest';
import { buildWarp, GAP_SPAN, visibleStretches } from './warp';

describe('buildWarp', () => {
  // Shaped like Japan.md: 舊石器 (−36000), 繩文 (−14000), 彌生 (−1000), then dense history.
  const warp = buildWarp([-36000, -14000, -1000, -660, 57, 794, 1600, 2026]);

  it('squeezes only the gaps longer than MIN_GAP', () => {
    expect(warp.gaps.map((g) => [g.start, g.end])).toEqual([
      [-36000, -14000],
      [-14000, -1000],
    ]);
    expect(warp.toU(-14000) - warp.toU(-36000)).toBe(GAP_SPAN);
    expect(warp.toU(-1000) - warp.toU(-14000)).toBe(GAP_SPAN);
  });

  it('keeps one unit per year outside the gaps, including beyond the ends', () => {
    expect(warp.toU(57) - warp.toU(-660)).toBe(717);
    expect(warp.toU(2100) - warp.toU(2026)).toBe(74);
    expect(warp.toU(-36100) - warp.toU(-36000)).toBe(-100);
  });

  it('inverts', () => {
    for (const y of [-40000, -20000, -14000, -5000, -800, 1600, 2030]) expect(warp.toYear(warp.toU(y))).toBeCloseTo(y, 6);
  });

  it('takes a lower threshold for a sparse timeline, with narrower breaks', () => {
    // Shaped like 音樂史: ancient events centuries apart, then dense from 1550 on.
    const music = buildWarp([-1400, -550, -300, 590, 1025, 1150, 1550, 1607, 1685], 100);
    expect(music.gaps.map((g) => g.start)).toEqual([-1400, -550, -300, 590, 1025, 1150]);
    expect(music.toU(-550) - music.toU(-1400)).toBe(40);
    expect(music.toU(1685) - music.toU(1607)).toBe(78);
    expect(buildWarp([-1400, -550], 1000).gaps).toEqual([]);
  });

  it('is the identity without gaps', () => {
    const plain = buildWarp([1685, 1750]);
    expect(plain.gaps).toEqual([]);
    expect(plain.toU(1700)).toBe(1700);
    expect(buildWarp([]).toU(5)).toBe(5);
  });
});

describe('visibleStretches', () => {
  const warp = buildWarp([-36000, -14000, -1000, -660, 57, 794, 1600, 2026]);

  it('splits the view around gaps and returns real years', () => {
    // The single point −14000 between the two gaps is not a stretch of its own.
    const stretches = visibleStretches(warp, warp.toU(-36500), warp.toU(0));
    expect(stretches).toHaveLength(2);
    const [a, b] = stretches;
    expect(a[0]).toBeCloseTo(-36500);
    expect(a[1]).toBeCloseTo(-36000);
    expect(b[0]).toBeCloseTo(-1000);
    expect(b[1]).toBeCloseTo(0);
  });

  it('is a single stretch inside an unwarped part', () => {
    expect(visibleStretches(warp, warp.toU(100), warp.toU(500)).map(([f, t]) => [Math.round(f), Math.round(t)])).toEqual([[100, 500]]);
  });
});
