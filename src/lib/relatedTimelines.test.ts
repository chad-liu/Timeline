import { describe, expect, it } from 'vitest';
import { buildNameIndex } from './nameIndex';
import { parseTimeline } from './parseTimeline';
import { buildRelationGraph } from './relationGraph';
import { mentionedTimelines, seeAlso, unknownSeeIds } from './relatedTimelines';

const timeline = (id: string, frontmatter: string, events = '## 1500 | 事件\n內文。\n') =>
  parseTimeline(`---\n${frontmatter}\n---\n\n# Events\n${events}`, id);

describe('see', () => {
  const all = [
    timeline('Leonardo', 'title: 達文西\nsee: [Medici, Renaissance]'),
    timeline('Medici', 'title: 梅迪奇\ncategory: 西方歷史'),
    timeline('Renaissance', 'title: 文藝復興\nsee: Medici'),
    timeline('Bach', 'title: 巴赫'),
  ];

  it('shows a link on both sides, in the order of the timelines, without the timeline itself', () => {
    expect(seeAlso(all[0], all).map((t) => t.id)).toEqual(['Medici', 'Renaissance']);
    expect(seeAlso(all[1], all).map((t) => t.id)).toEqual(['Leonardo', 'Renaissance']);
    expect(seeAlso(all[3], all)).toEqual([]);
  });

  it('reports ids that name no timeline', () => {
    expect(unknownSeeIds(all)).toEqual([]);
    expect(unknownSeeIds([timeline('A', 'title: A\nsee: [Nope]')])).toEqual(['A → Nope']);
  });
});

describe('mentionedTimelines', () => {
  const all = [
    timeline('Leonardo', 'title: 達文西生平\nborn: 1452\ndied: 1519', '## 1513 | 羅馬\n進入朱利亞諾·德·梅迪奇的支持圈，與拉斐爾同城。\n'),
    timeline('LeonardoWorks', 'title: 達文西作品\nfollows: Leonardo', '## 1503 | 蒙娜麗莎\n達文西作。\n'),
    timeline('Raphael', 'title: 拉斐爾生平\nborn: 1483\ndied: 1520', '## 1508 | 梵蒂岡\n與達文西同時期。\n'),
    timeline('Bach', 'title: 巴赫生平\nborn: 1685\ndied: 1750'),
  ];
  const index = buildNameIndex(all);
  const graph = buildRelationGraph(index);

  it('lists the linked people, never the person own works list', () => {
    expect(mentionedTimelines(all[0], index, graph, new Set()).map((m) => m.timeline.id)).toEqual(['Raphael']);
    expect(mentionedTimelines(all[1], index, graph, new Set()).map((m) => m.timeline.id)).toEqual(['Raphael']);
  });

  it('skips what see: already shows and returns nothing for a timeline that is nobody', () => {
    expect(mentionedTimelines(all[0], index, graph, new Set(['Raphael']))).toEqual([]);
    expect(mentionedTimelines(timeline('Age', 'title: 時代'), index, graph, new Set())).toEqual([]);
  });
});
