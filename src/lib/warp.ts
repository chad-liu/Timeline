/** A stretch of years with no dates in it, squeezed into GAP_SPAN on the warped axis. */
export interface Gap {
  start: number;
  end: number;
  /** Warped position of `start` and `end`. */
  uStart: number;
  uEnd: number;
}

/**
 * Piecewise-linear map from years to a warped axis `u` used by the horizontal view.
 * Outside gaps one year is one unit, so pixels per year are unchanged; each gap is squeezed to GAP_SPAN units.
 */
export interface Warp {
  toU: (year: number) => number;
  toYear: (u: number) => number;
  gaps: Gap[];
}

/** Gaps longer than this many years between consecutive dates are squeezed (e.g. 舊石器 → 繩文 → 彌生 in Japan). */
export const MIN_GAP = 2000;
/** Warped length of a squeezed gap, in years-equivalent. */
export const GAP_SPAN = 300;

/** Build the warp from every date that must keep its spacing (event and period starts and ends). */
export function buildWarp(dates: number[]): Warp {
  const anchors = [...new Set(dates)].sort((a, b) => a - b);
  // Breakpoints (year, u); between them the map is linear, and outside them it has slope 1.
  const years: number[] = [];
  const us: number[] = [];
  const gaps: Gap[] = [];
  let u = anchors[0] ?? 0;
  anchors.forEach((year, i) => {
    if (i > 0) {
      const span = year - anchors[i - 1];
      if (span > MIN_GAP) {
        gaps.push({ start: anchors[i - 1], end: year, uStart: u, uEnd: u + GAP_SPAN });
        u += GAP_SPAN;
      } else {
        u += span;
      }
    }
    years.push(year);
    us.push(u);
  });

  const interpolate = (x: number, from: number[], to: number[]) => {
    if (from.length === 0) return x;
    if (x <= from[0]) return to[0] + (x - from[0]);
    const last = from.length - 1;
    if (x >= from[last]) return to[last] + (x - from[last]);
    let i = 1;
    while (from[i] < x) i++;
    const t = (x - from[i - 1]) / (from[i] - from[i - 1]);
    return to[i - 1] + t * (to[i] - to[i - 1]);
  };
  return { toU: (year) => interpolate(year, years, us), toYear: (x) => interpolate(x, us, years), gaps };
}

/** The unwarped stretches of [uFrom, uTo], in years, so ticks can be laid out in each of them. */
export function visibleStretches(warp: Warp, uFrom: number, uTo: number): [number, number][] {
  const stretches: [number, number][] = [];
  let from = uFrom;
  for (const g of warp.gaps) {
    if (g.uEnd <= from) continue;
    if (g.uStart >= uTo) break;
    if (g.uStart > from) stretches.push([warp.toYear(from), warp.toYear(g.uStart)]);
    from = g.uEnd;
  }
  if (from < uTo) stretches.push([warp.toYear(from), warp.toYear(uTo)]);
  return stretches;
}
