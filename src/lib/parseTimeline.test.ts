import { describe, expect, it } from 'vitest';
import { parseTimeline } from './parseTimeline';

const source = `---
title: 測試人物
born: 1724-04-22
died: 1804-02-12
---

# Events
## 1724-04-22 | 出生
## 1781 | 年份事件
## 1770-03 | 生日前的月份事件
## 1770-05 | 生日後的月份事件
## 1771-04 | 生日當月的月份事件
## 1790 | 指定年齡 {age=65}
## 1804-02-12 | 逝世
## 1863 | 身後事件
## 18c | 世紀事件
`;

describe('parseTimeline ages', () => {
  const labels = parseTimeline(source, 'test').events.map((e) => e.date.label);

  it('appends the age to events within the lifetime', () => {
    expect(labels).toContain('1781年（57歲）');
    expect(labels).toContain('1770年3月（45歲）');
    expect(labels).toContain('1770年5月（46歲）');
    expect(labels).toContain('1771年4月（47歲）');
    expect(labels).toContain('1790年（65歲）');
    expect(labels).toContain('1804年2月12日（79歲）');
  });

  it('leaves the birth, posthumous and imprecise events unchanged', () => {
    expect(labels).toContain('1724年4月22日');
    expect(labels).toContain('1863年');
    expect(labels).toContain('18世紀');
  });
});
