import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { orderTimelines } from './timelineOrder';

const timeline = (id: string, year: number, follows?: string) =>
  parseTimeline(`---\ntitle: ${id}\n${follows ? `follows: ${follows}\n` : ''}---\n\n# Events\n## ${year} | 事件\n`, id);

describe('orderTimelines', () => {
  it('sorts by earliest date', () => {
    expect(orderTimelines([timeline('Brahms', 1833), timeline('Bach', 1685)]).map((t) => t.id)).toEqual(['Bach', 'Brahms']);
  });

  it('keeps a follower right after its target even when its own date sorts later', () => {
    const ids = orderTimelines([
      timeline('Bach', 1685),
      timeline('Handel', 1685),
      timeline('BachWorks', 1703, 'Bach'),
      timeline('Haydn', 1732),
    ]).map((t) => t.id);
    expect(ids).toEqual(['Bach', 'BachWorks', 'Handel', 'Haydn']);
  });

  it('ignores a follows that names a missing timeline, and allows chains', () => {
    const ids = orderTimelines([
      timeline('Orphan', 1500, 'Nobody'),
      timeline('Notes', 1900, 'Works'),
      timeline('Works', 1800, 'Bio'),
      timeline('Bio', 1700),
      timeline('Other', 1750),
    ]).map((t) => t.id);
    expect(ids).toEqual(['Orphan', 'Bio', 'Works', 'Notes', 'Other']);
  });
});
