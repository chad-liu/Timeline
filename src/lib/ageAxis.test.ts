import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';
import { canAlignByAge, formatAge, toAgeAxis } from './ageAxis';
import { makeTicks } from './scale';

const person = (id: string, born: string, body: string) => parseTimeline(`---\ntitle: ${id}\nborn: ${born}\n---\n\n${body}`, id);

const mozart = person('Mozart', '1756', '# Periods\n- 1781 ~ 1791 | 維也納 | #7c4dff\n\n# Events\n## 1750 | 父親出書\n## 1786 | 費加洛婚禮');
const beethoven = person('Beethoven', '1770', '# Events\n## 1800 | 第一號交響曲');
const war = parseTimeline('---\ntitle: 七年戰爭\n---\n\n# Events\n## 1756 | 開戰', 'War');

describe('canAlignByAge', () => {
  it('needs at least two timelines, all with a birth date', () => {
    expect(canAlignByAge([mozart, beethoven])).toBe(true);
    expect(canAlignByAge([mozart])).toBe(false);
    expect(canAlignByAge([mozart, war])).toBe(false);
  });
});

describe('toAgeAxis', () => {
  it('counts events and periods from birth, keeping ids and labels', () => {
    const aged = toAgeAxis(mozart);
    expect(aged.events.map((e) => [e.id, e.date.start])).toEqual([
      ['Mozart-0', -6],
      ['Mozart-1', 30],
    ]);
    expect(aged.events[1].date.label).toBe(mozart.events[1].date.label);
    expect(aged.periods[0].date).toMatchObject({ start: 25, end: 35 });
    expect(toAgeAxis(beethoven).events[0].date.start).toBe(30);
  });

  it('leaves a timeline without a birth date alone', () => {
    expect(toAgeAxis(war)).toBe(war);
  });
});

describe('age labels', () => {
  it('formats ages, birth and the years before it', () => {
    expect([30, 0, -5].map(formatAge)).toEqual(['30歲', '出生', '出生前5年']);
  });

  it('are used by makeTicks on the age axis', () => {
    expect(makeTicks(-10, 20, 9, 'age').map((t) => t.label)).toEqual(['出生前10年', '出生', '10歲', '20歲']);
    expect(makeTicks(30, 30.5, 400, 'age').map((t) => t.label)).toEqual(['30歲', '3個月', '6個月']);
  });
});
