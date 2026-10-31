import type { Timeline } from '../types';
import type { NameEntry } from './nameIndex';
import { UNCATEGORIZED } from './timelineOrder';

export interface GraphNode {
  id: string;
  /** A person, or a timeline that is nobody's own (a family or a period) and is linked by `see:`. */
  kind: 'person' | 'timeline';
  name: string;
  years: string;
  category: string;
  color: string;
  /** The timelines to open for this node: a person's biography and works, or the timeline itself. */
  links: { id: string; title: string }[];
  /** Number of nodes this one is connected to. */
  degree: number;
  /** Events linking this node to others (both directions), plus {@link SEE_WEIGHT} for every `see:` link; sets the node size. */
  weight: number;
  /** Shown only because it is linked to a node of the selected category (see {@link filterRelationGraph}). */
  outside?: boolean;
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
  /** Linked by `see:` in either timeline's frontmatter. */
  see: boolean;
}

export interface RelationGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

/** What a `see:` link adds to the size of the nodes it joins. */
export const SEE_WEIGHT = 3;

const isExtra = (entry: NameEntry) => entry.key.startsWith('extra:');

/**
 * Who is linked to whom, as an undirected graph. Two people are linked when events in the own timelines of one
 * (biography and works) mention the other. A `see:` link joins the nodes of two timelines whatever their categories: a person timeline is its
 * person, any other timeline (a family, a period) a node of its own. Other mentions from such timelines say nothing about
 * a relation between two people, so they are left out. Nodes without a link are not shown.
 */
export function buildRelationGraph(index: NameEntry[], timelines: Timeline[] = []): RelationGraph {
  // Supplementary people who share one timeline (the Medici family) do not own it; it is a node of its own.
  const extraOwners = new Map<string, number>();
  for (const entry of index) if (isExtra(entry)) for (const t of entry.links) extraOwners.set(t.id, (extraOwners.get(t.id) ?? 0) + 1);

  const owner = new Map<string, string>();
  for (const entry of index) {
    for (const t of entry.links) {
      if (isExtra(entry) && extraOwners.get(t.id)! > 1) continue;
      // A supplementary person may point at a timeline that is already someone's own; the person timeline comes first and keeps it.
      if (!owner.has(t.id)) owner.set(t.id, entry.key);
    }
  }

  const pairs = new Map<string, GraphLink>();
  const pair = (x: string, y: string) => {
    const [a, b] = x < y ? [x, y] : [y, x];
    const key = `${a}\n${b}`;
    const link = pairs.get(key) ?? { source: a, target: b, forward: 0, backward: 0, weight: 0, see: false };
    pairs.set(key, link);
    return link;
  };

  for (const target of index) {
    for (const { timeline, events } of target.mentions) {
      const source = owner.get(timeline.id);
      if (source === undefined || source === target.key) continue;
      const link = pair(source, target.key);
      if (source === link.source) link.forward += events.length;
      else link.backward += events.length;
      link.weight += events.length;
    }
  }

  const byId = new Map(timelines.map((t) => [t.id, t]));
  const nodeOf = (timelineId: string) => owner.get(timelineId) ?? `t:${timelineId}`;
  for (const t of timelines) {
    for (const id of t.see) {
      if (!byId.has(id) || nodeOf(t.id) === nodeOf(id)) continue;
      pair(nodeOf(t.id), nodeOf(id)).see = true;
    }
  }

  const links = [...pairs.values()];
  const candidates = new Map<string, GraphNode>();
  for (const e of index) {
    candidates.set(e.key, {
      id: e.key,
      kind: 'person',
      name: e.name,
      years: e.years,
      category: e.category,
      color: e.color,
      links: e.links.map((t) => ({ id: t.id, title: t.title })),
      degree: 0,
      weight: 0,
    });
  }
  for (const t of timelines) {
    candidates.set(`t:${t.id}`, {
      id: `t:${t.id}`,
      kind: 'timeline',
      name: t.title,
      years: '',
      category: t.category ?? UNCATEGORIZED,
      color: t.color,
      links: [{ id: t.id, title: t.title }],
      degree: 0,
      weight: 0,
    });
  }
  return withDegrees(candidates, links);
}

/** Keeps only the nodes that have a link, with `degree` and `weight` counted over `links`. */
function withDegrees(candidates: Map<string, GraphNode>, links: GraphLink[]): RelationGraph {
  const degree = new Map<string, number>();
  const weight = new Map<string, number>();
  for (const l of links) {
    for (const id of [l.source, l.target]) {
      degree.set(id, (degree.get(id) ?? 0) + 1);
      weight.set(id, (weight.get(id) ?? 0) + l.weight + (l.see ? SEE_WEIGHT : 0));
    }
  }
  const nodes = [...candidates.values()].filter((n) => degree.has(n.id)).map((n) => ({ ...n, degree: degree.get(n.id)!, weight: weight.get(n.id)! }));
  return { nodes, links };
}

/**
 * The graph with links lighter than `minWeight` removed (`see:` links always stay), then the nodes left without a link.
 * With a `category`, a link stays when at least one end is in it, so the links out of the category remain and their far ends show as `outside`;
 * `crossOnly` keeps only links between two categories.
 */
export function filterRelationGraph(graph: RelationGraph, options: { category?: string | null; minWeight: number; crossOnly?: boolean }): RelationGraph {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const inCategory = (id: string) => !options.category || byId.get(id)?.category === options.category;
  const links = graph.links.filter(
    (l) =>
      (l.see || l.weight >= options.minWeight) &&
      (inCategory(l.source) || inCategory(l.target)) &&
      (!options.crossOnly || byId.get(l.source)?.category !== byId.get(l.target)?.category),
  );
  const { nodes } = withDegrees(new Map(graph.nodes.map((n) => [n.id, n])), links);
  return { nodes: nodes.map((n) => (inCategory(n.id) ? n : { ...n, outside: true })), links };
}
