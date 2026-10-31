import type { NameEntry } from './nameIndex';

export interface GraphNode {
  id: string;
  name: string;
  years: string;
  category: string;
  color: string;
  /** Number of people this one is connected to. */
  degree: number;
  /** Total events linking this person to others (both directions). */
  weight: number;
}

export interface GraphLink {
  source: string;
  target: string;
  /** Events in `source`'s own timelines that mention `target`. */
  forward: number;
  /** Events in `target`'s own timelines that mention `source`. */
  backward: number;
  /** `forward + backward`. */
  weight: number;
}

export interface RelationGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Who mentions whom, as an undirected graph: two people are linked when events in the own timelines of one
 * (biography and works) mention the other. Events of a timeline that is nobody's own (a period or a topic) say nothing about
 * a relation between two people, so they are left out. People without a link are not nodes.
 */
export function buildRelationGraph(index: NameEntry[]): RelationGraph {
  const owner = new Map<string, string>();
  // A supplementary person may point at a timeline that is already someone's own; the person timeline comes first and keeps it.
  for (const entry of index) for (const t of entry.links) if (!owner.has(t.id)) owner.set(t.id, entry.key);

  const pairs = new Map<string, GraphLink>();
  for (const target of index) {
    for (const { timeline, events } of target.mentions) {
      const source = owner.get(timeline.id);
      if (source === undefined || source === target.key) continue;
      const [a, b] = source < target.key ? [source, target.key] : [target.key, source];
      const link = pairs.get(`${a}\n${b}`) ?? { source: a, target: b, forward: 0, backward: 0, weight: 0 };
      if (source === a) link.forward += events.length;
      else link.backward += events.length;
      link.weight += events.length;
      pairs.set(`${a}\n${b}`, link);
    }
  }

  const links = [...pairs.values()];
  const degree = new Map<string, number>();
  const weight = new Map<string, number>();
  for (const l of links) {
    for (const id of [l.source, l.target]) {
      degree.set(id, (degree.get(id) ?? 0) + 1);
      weight.set(id, (weight.get(id) ?? 0) + l.weight);
    }
  }

  const nodes = index
    .filter((e) => degree.has(e.key))
    .map(
      (e): GraphNode => ({
        id: e.key,
        name: e.name,
        years: e.years,
        category: e.category,
        color: e.color,
        degree: degree.get(e.key)!,
        weight: weight.get(e.key)!,
      }),
    );
  return { nodes, links };
}

/** The graph with links lighter than `minWeight` removed, then the people who are left without a link. */
export function filterRelationGraph(graph: RelationGraph, options: { category?: string | null; minWeight: number }): RelationGraph {
  const inCategory = new Set(graph.nodes.filter((n) => !options.category || n.category === options.category).map((n) => n.id));
  const links = graph.links.filter((l) => l.weight >= options.minWeight && inCategory.has(l.source) && inCategory.has(l.target));
  const degree = new Map<string, number>();
  const weight = new Map<string, number>();
  for (const l of links) {
    for (const id of [l.source, l.target]) {
      degree.set(id, (degree.get(id) ?? 0) + 1);
      weight.set(id, (weight.get(id) ?? 0) + l.weight);
    }
  }
  const nodes = graph.nodes.filter((n) => degree.has(n.id)).map((n) => ({ ...n, degree: degree.get(n.id)!, weight: weight.get(n.id)! }));
  return { nodes, links };
}
