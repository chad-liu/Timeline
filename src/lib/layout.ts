export interface Placed<T> {
  item: T;
  row: number;
}

/**
 * Greedy row packing: items sorted by start go into the lowest row whose last item
 * ends (plus gap) before they start. Row 0 is the one closest to the time axis.
 */
export function stackRows<T>(
  items: T[],
  getStart: (item: T) => number,
  getEnd: (item: T) => number,
  gap: number,
): { placed: Placed<T>[]; rows: number } {
  const rowEnds: number[] = [];
  const placed = [...items]
    .sort((a, b) => getStart(a) - getStart(b))
    .map((item) => {
      const start = getStart(item);
      let row = rowEnds.findIndex((end) => end + gap <= start);
      if (row === -1) row = rowEnds.push(0) - 1;
      rowEnds[row] = getEnd(item);
      return { item, row };
    });
  return { placed, rows: rowEnds.length };
}
