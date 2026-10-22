import type { Timeline } from '../types';
import type { Ruler } from './chineseRulers';

/** The 日本歷史 timeline (Data/Japan.md), whose era bands feed the lifespan chart's 日本時代 row. */
export const JAPAN_TIMELINE_ID = 'Japan';

/**
 * The era chain of a history timeline: its periods in file order, skipping any that overlaps the last one kept.
 * Japan.md lists the consecutive eras (舊石器 … 令和) first, so the bands written after them that overlap
 * (東亞地緣大重組, the grey 實際掌權者 periods) are left out.
 */
export function eraChain(timeline: Timeline | undefined): Ruler[] {
  const eras: Ruler[] = [];
  for (const p of timeline?.periods ?? []) {
    const start = p.date.start;
    const end = p.date.end ?? start;
    const last = eras[eras.length - 1];
    if (last && start < last.end) continue;
    eras.push({ name: p.title, dynasty: '日本', start, end, color: p.color });
  }
  return eras;
}
