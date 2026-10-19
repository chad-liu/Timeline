/** One stretch of the year axis; empty centuries between stretches are cut out and drawn as a narrow break. */
export interface Segment {
  start: number;
  end: number;
  /** Pixel offset of `start`. */
  x: number;
}

export interface LifespanScale {
  segments: Segment[];
  width: number;
  pxPerYear: number;
  xOf: (year: number) => number;
  /** Inverse of xOf; inside a break it returns the start of the next segment. */
  yearAt: (x: number) => number;
}

const STEP = 50;
const PAD = 10;
/** Gaps longer than this many years are cut out of the axis. */
const MAX_GAP = 150;
export const BREAK_PX = 36;
/** Blank margin at both ends so the first and last tick labels are not clipped. */
export const EDGE_PX = 24;

/**
 * Build a year → pixel scale covering every [born, died] span, rounded out to 50-year steps.
 * Spans closer than MAX_GAP years share one segment; longer empty stretches (e.g. between
 * ancient Greece and the Song dynasty) collapse into a BREAK_PX-wide gap.
 */
export function buildLifespanScale(spans: [number, number][], pxPerYear: number): LifespanScale {
  const ranges = spans
    .map(([born, died]) => [Math.floor((born - PAD) / STEP) * STEP, Math.ceil((died + PAD) / STEP) * STEP])
    .sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start - last[1] <= MAX_GAP) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  const segments: Segment[] = [];
  let x = EDGE_PX;
  for (const [start, end] of merged) {
    segments.push({ start, end, x });
    x += (end - start) * pxPerYear + BREAK_PX;
  }
  const width = Math.max(0, x - BREAK_PX + EDGE_PX);
  const xOf = (year: number) => {
    const seg = segments.find((s) => year <= s.end) ?? segments[segments.length - 1];
    return seg.x + (Math.min(Math.max(year, seg.start), seg.end) - seg.start) * pxPerYear;
  };
  const yearAt = (px: number) => {
    const seg = segments.find((s) => px <= s.x + (s.end - s.start) * pxPerYear) ?? segments[segments.length - 1];
    return seg.start + Math.max(0, px - seg.x) / pxPerYear;
  };
  return { segments, width, pxPerYear, xOf, yearAt };
}

/**
 * Tick years inside each segment: every 50 years when there is room, otherwise every 100.
 * A segment's closing year is skipped before a break so its label does not collide with the next segment's first one.
 */
export function lifespanTicks(scale: LifespanScale): number[] {
  const step = scale.pxPerYear >= 3 ? 50 : 100;
  const last = scale.segments.length - 1;
  return scale.segments.flatMap((s, i) => {
    const ticks: number[] = [];
    const end = i < last ? s.end - 1 : s.end;
    for (let y = Math.ceil(s.start / step) * step; y <= end; y += step) ticks.push(y);
    return ticks;
  });
}
