/** Label colours cycled in the vertical view, taken from the 圖表\ history charts. */
export const PALETTE = ['#0a84ff', '#8fb800', '#00b894', '#00a6e6', '#f5a623', '#ff6b6b'];

function luminance(hex: string): number {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White or dark text, whichever contrasts more with the background colour. */
export function readableText(background: string): string {
  const l = luminance(background);
  if (Number.isNaN(l)) return '#fff';
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / 0.062;
  return onWhite >= onDark ? '#fff' : '#1d1b26';
}
