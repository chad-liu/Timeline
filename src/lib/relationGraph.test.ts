import { describe, expect, it } from 'vitest';
import { buildNameIndex } from './nameIndex';
import { parseExtraPeople } from './extraPeople';
import { buildRelationGraph, filterRelationGraph, SEE_WEIGHT } from './relationGraph';
import { parseTimeline } from './parseTimeline';

const timeline = (id: string, frontmatter: string, events: string) => parseTimeline(`---\n${frontmatter}\n---\n\n# Events\n${events}`, id);

const timelines = [
  timeline('Locke', 'title: 洛克生平\nborn: 1632\ndied: 1704\ncategory: 思想家', '## 1690 | 《政府論》\n洛克出版《政府論》。\n\n## 1700 | 晚年\n與牛頓通信。\n'),
  timeline('Newton', 'title: 牛頓生平\nborn: 1643\ndied: 1727\ncategory: 科學家', '## 1687 | 《原理》\n牛頓出版《原理》。\n\n## 1689 | 見面\n與洛克相識。\n\n## 1691 | 信\n寫信給洛克。\n'),
  timeline('Bach', 'title: 巴赫生平\nborn: 1685\ndied: 1750\ncategory: 音樂家', '## 1723 | 萊比錫\n赴萊比錫任職。\n'),
  timeline('Age', 'title: 啟蒙時代', '## 1700 | 啟蒙\n洛克與牛頓影響了啟蒙運動。\n'),
];
const graph = buildRelationGraph(buildNameIndex(timelines), timelines);

describe('buildRelationGraph', () => {
  it('links two people once, counting events in both directions', () => {
    expect(graph.links).toEqual([{ source: 'Locke', target: 'Newton', forward: 1, backward: 2, weight: 3, see: false }]);
  });

  it('ignores mentions from timelines that belong to nobody and leaves out unlinked people', () => {
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['Locke', 'Newton']);
    expect(graph.nodes.find((n) => n.id === 'Locke')).toMatchObject({ kind: 'person', degree: 1, weight: 3, links: [{ id: 'Locke', title: '洛克生平' }] });
  });
});

describe('see: links', () => {
  const art = [
    timeline('Leonardo', 'title: 達文西生平\nborn: 1452\ndied: 1519\ncategory: 藝術家\nsee: [Medici, Bach]', '## 1513 | 羅馬\n進入朱利亞諾·德·梅迪奇的支持圈。\n'),
    timeline('Medici', 'title: 梅迪奇家族\ncategory: 西方歷史', '## 1492 | 洛倫佐去世\n華麗者洛倫佐去世。\n'),
    timeline('Bach', 'title: 巴赫生平\nborn: 1685\ndied: 1750\ncategory: 音樂家', '## 1723 | 萊比錫\n赴萊比錫任職。\n'),
  ];
  const extras = parseExtraPeople(`---
people:
  - name: 洛倫佐·德·梅迪奇
    terms: [洛倫佐]
    born: 1449
    died: 1492
    category: 西方歷史
    group: 梅迪奇家族
    timeline: Medici
  - name: 朱利亞諾·德·梅迪奇
    terms: [朱利亞諾·德·梅迪奇]
    born: 1479
    died: 1516
    category: 西方歷史
    group: 梅迪奇家族
    timeline: Medici
---
`);
  const g = buildRelationGraph(buildNameIndex(art, extras), art);

  it('joins a person to a timeline that is nobody\'s own, as a timeline node', () => {
    expect(g.nodes.find((n) => n.id === 't:Medici')).toMatchObject({ kind: 'timeline', name: '梅迪奇家族', category: '西方歷史' });
    const link = g.links.find((l) => l.see && (l.source === 't:Medici' || l.target === 't:Medici'))!;
    expect([link.source, link.target].sort()).toEqual(['Leonardo', 't:Medici']);
    expect(g.nodes.find((n) => n.id === 'Leonardo')!.weight).toBeGreaterThanOrEqual(2 * SEE_WEIGHT);
  });

  it('joins two person timelines through their people, and the family members do not own the shared timeline', () => {
    expect(g.links.some((l) => l.see && [l.source, l.target].sort().join() === 'Bach,Leonardo')).toBe(true);
    // the Medici timeline mentions 洛倫佐 but is not a person, so no mention link comes from it
    expect(g.links.filter((l) => !l.see).every((l) => !l.source.startsWith('t:') && !l.target.startsWith('t:'))).toBe(true);
  });

  it('keeps see: links under any minimum weight', () => {
    const filtered = filterRelationGraph(g, { minWeight: 99 });
    expect(filtered.links.every((l) => l.see)).toBe(true);
    expect(filtered.links.length).toBe(2);
  });

  it('keeps links out of a category and marks the far end as outside', () => {
    const filtered = filterRelationGraph(g, { category: '藝術家', minWeight: 1 });
    expect(filtered.nodes.find((n) => n.id === 'Leonardo')!.outside).toBeUndefined();
    expect(filtered.nodes.find((n) => n.id === 't:Medici')!.outside).toBe(true);
    expect(filtered.links.length).toBeGreaterThan(0);
  });

  it('can keep only links between two categories', () => {
    const cross = filterRelationGraph(g, { minWeight: 1, crossOnly: true });
    const byId = new Map(g.nodes.map((n) => [n.id, n]));
    expect(cross.links.length).toBeGreaterThan(0);
    expect(cross.links.every((l) => byId.get(l.source)!.category !== byId.get(l.target)!.category)).toBe(true);
  });
});

describe('filterRelationGraph', () => {
  it('drops light links and the nodes left without one', () => {
    expect(filterRelationGraph(graph, { minWeight: 4 })).toEqual({ nodes: [], links: [] });
    expect(filterRelationGraph(graph, { minWeight: 3 }).nodes).toHaveLength(2);
  });

  it('keeps a link that leaves the category, with the far end outside', () => {
    const filtered = filterRelationGraph(graph, { category: '思想家', minWeight: 1 });
    expect(filtered.links).toHaveLength(1);
    expect(filtered.nodes.map((n) => [n.id, n.outside ?? false])).toEqual([
      ['Locke', false],
      ['Newton', true],
    ]);
  });

  it('shows nothing for a category that has no links', () => {
    expect(filterRelationGraph(graph, { category: '音樂家', minWeight: 1 })).toEqual({ nodes: [], links: [] });
  });
});
