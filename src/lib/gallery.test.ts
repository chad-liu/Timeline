import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { ANCIENT, buildGallery, eraOf } from './gallery';

const timeline = (id: string, events: string) => parseTimeline(`---\ntitle: ${id}\n---\n\n# Events\n${events}`, id);

const timelines = [
  timeline('Works', '## 1787 | 唐喬望尼\n![](images/don.jpg)\n首演於布拉格。\n## 1791 | 魔笛\n![](images/flute.jpg)\n'),
  timeline('Mozart', '## 1756 | 出生\n![](images/birth.jpg)\n## 1770 | 義大利\n沒有圖片。\n## 1787 | 布拉格\n![](images/don.jpg)\n'),
];

describe('eraOf', () => {
  it('names centuries on both sides of year 1', () => {
    expect([1756, 1800, 99, 0.5, -1, -100, -101, -1000].map(eraOf)).toEqual([
      '18世紀',
      '19世紀',
      '1世紀',
      '1世紀',
      '前1世紀',
      '前1世紀',
      '前2世紀',
      '前10世紀',
    ]);
  });

  it('puts everything before 1000 BC in one era', () => {
    expect([-1001, -15000].map(eraOf)).toEqual([ANCIENT, ANCIENT]);
  });
});

describe('buildGallery', () => {
  const gallery = buildGallery(timelines);

  it('lists the events that have an image, in date order', () => {
    expect(gallery.map((g) => [g.event.id, g.image.split('/').pop()])).toEqual([
      ['Mozart-0', 'birth.jpg'],
      ['Works-0', 'don.jpg'],
      ['Works-1', 'flute.jpg'],
    ]);
  });

  it('shows an image shared by several events once, keeping all its uses', () => {
    const don = gallery[1];
    expect(don.timeline.id).toBe('Works');
    expect(don.uses.map((u) => u.event.id)).toEqual(['Works-0', 'Mozart-2']);
  });
});
