import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { eventsInSlice, livingInSlice, sliceLabel, sliceOf } from './yearIndex';

const timeline = (id: string, frontmatter: string, body: string) => parseTimeline(`---\n${frontmatter}\n---\n\n${body}`, id);

describe('sliceOf / sliceLabel', () => {
  it('finds the year, decade or century containing a year', () => {
    expect(sliceOf(1789, 1)).toEqual({ from: 1789, to: 1790 });
    expect(sliceOf(1789, 10)).toEqual({ from: 1780, to: 1790 });
    expect(sliceOf(1789, 100)).toEqual({ from: 1700, to: 1800 });
    expect(sliceOf(-221, 100)).toEqual({ from: -300, to: -200 });
  });

  it('labels slices the way the timelines write dates', () => {
    expect(sliceLabel(1789, 1)).toBe('1789年');
    expect(sliceLabel(1780, 10)).toBe('1780年代');
    expect(sliceLabel(1700, 100)).toBe('18世紀');
    expect(sliceLabel(-221, 1)).toBe('前221年');
    expect(sliceLabel(-300, 100)).toBe('前3世紀');
  });
});

describe('eventsInSlice', () => {
  const history = timeline(
    'History',
    'title: 歷史',
    '# Periods\n- 1750 ~ 1815 | 革命時代\n\n# Events\n## 1789 | 法國大革命\n\n## 1792 | 共和\n\n## 1780 ~ 1795 | 長事件\n',
  );
  const music = timeline('Music', 'title: 音樂', '# Events\n## 1791 | 魔笛\n');

  it('keeps events that touch the slice, including ranges that start before it', () => {
    const [slice] = eventsInSlice([history, music], 1789, 1790);
    expect(slice.timeline.id).toBe('History');
    expect(slice.events.map((e) => e.title)).toEqual(['長事件', '法國大革命']);
    expect(slice.periods.map((p) => p.title)).toEqual(['革命時代']);
  });

  it('shows century-long events only in a century slice', () => {
    const works = timeline('Works', 'title: 作品', '# Events\n## 18世紀 | 聖詠歌曲\n\n## 1700 ~ 1799 | 清唱劇\n');
    expect(eventsInSlice([works], 1768, 1769)).toEqual([]);
    expect(eventsInSlice([works], 1760, 1770)).toEqual([]);
    expect(eventsInSlice([works], 1700, 1800)[0].events.map((e) => e.title)).toEqual(['聖詠歌曲', '清唱劇']);
  });

  it('drops timelines with nothing in the slice', () => {
    expect(eventsInSlice([history, music], 1800, 1810)).toEqual([]);
    expect(eventsInSlice([history, music], 1790, 1800).map((s) => s.timeline.id)).toEqual(['History', 'Music']);
  });
});

describe('livingInSlice', () => {
  const mozart = timeline('Mozart', 'title: 莫札特生平\nborn: 1756-01-27\ndied: 1791-12-05', '# Events\n## 1791 | 魔笛\n');
  const extras = [{ name: '拿破崙', terms: ['拿破崙'], notNames: [], born: 1769, died: 1821, category: '西方歷史', note: '' }];

  it('lists people alive in the slice with their age at its start', () => {
    expect(livingInSlice([mozart], extras, 1789, 1790)).toEqual([
      { key: 'Mozart', name: '莫札特', age: 33, timeline: mozart },
      { key: 'extra:拿破崙', name: '拿破崙', age: 20, timeline: undefined },
    ]);
  });

  it('includes someone who dies during the slice but not after it', () => {
    expect(livingInSlice([mozart], [], 1791, 1792).map((p) => p.name)).toEqual(['莫札特']);
    expect(livingInSlice([mozart], [], 1792, 1793)).toEqual([]);
  });
});
