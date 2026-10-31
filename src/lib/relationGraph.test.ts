import { describe, expect, it } from 'vitest';
import { buildNameIndex } from './nameIndex';
import { buildRelationGraph, filterRelationGraph } from './relationGraph';
import { parseTimeline } from './parseTimeline';

const timeline = (id: string, frontmatter: string, events: string) => parseTimeline(`---\n${frontmatter}\n---\n\n# Events\n${events}`, id);

const graph = buildRelationGraph(
  buildNameIndex([
    timeline('Locke', 'title: 洛克生平\nborn: 1632\ndied: 1704\ncategory: 思想家', '## 1690 | 《政府論》\n洛克出版《政府論》。\n\n## 1700 | 晚年\n與牛頓通信。\n'),
    timeline('Newton', 'title: 牛頓生平\nborn: 1643\ndied: 1727\ncategory: 科學家', '## 1687 | 《原理》\n牛頓出版《原理》。\n\n## 1689 | 見面\n與洛克相識。\n\n## 1691 | 信\n寫信給洛克。\n'),
    timeline('Bach', 'title: 巴赫生平\nborn: 1685\ndied: 1750\ncategory: 音樂家', '## 1723 | 萊比錫\n赴萊比錫任職。\n'),
    timeline('Age', 'title: 啟蒙時代', '## 1700 | 啟蒙\n洛克與牛頓影響了啟蒙運動。\n'),
  ]),
);

describe('buildRelationGraph', () => {
  it('links two people once, counting events in both directions', () => {
    expect(graph.links).toEqual([{ source: 'Locke', target: 'Newton', forward: 1, backward: 2, weight: 3 }]);
  });

  it('ignores mentions from timelines that belong to nobody and leaves out unlinked people', () => {
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['Locke', 'Newton']);
    expect(graph.nodes.find((n) => n.id === 'Locke')).toMatchObject({ degree: 1, weight: 3 });
  });
});

describe('filterRelationGraph', () => {
  it('drops light links and the people left without one', () => {
    expect(filterRelationGraph(graph, { minWeight: 4 })).toEqual({ nodes: [], links: [] });
    expect(filterRelationGraph(graph, { minWeight: 3 }).nodes).toHaveLength(2);
  });

  it('keeps only links inside the category', () => {
    expect(filterRelationGraph(graph, { category: '思想家', minWeight: 1 }).links).toEqual([]);
  });
});
