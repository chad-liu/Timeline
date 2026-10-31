import { useEffect, useMemo, useRef, useState } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import type { Timeline } from '../types';
import type { ExtraPerson } from '../lib/extraPeople';
import { buildNameIndex } from '../lib/nameIndex';
import { buildRelationGraph, filterRelationGraph } from '../lib/relationGraph';
import type { GraphLink, GraphNode } from '../lib/relationGraph';
import { INDEX_HASH, dashboardHash, graphHash, timelineHash } from '../lib/route';
import { CATEGORY_ORDER } from '../lib/timelineOrder';
import { Logo } from './Logo';

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & GraphLink;

const WEIGHTS = [1, 2, 3, 5];
/** Only this many of the best-connected people are labelled all the time; the others show on hover, selection or when zoomed in. */
const MAJOR_LABELS = 25;

const radius = (n: GraphNode) => 5 + Math.min(14, Math.sqrt(n.weight) * 1.6);

/**
 * The relation graph (#p=graph): people as nodes, linked when one's own timelines mention the other (solid line)
 * or a `see:` link joins their timelines (dashed line). A timeline that is nobody's own, such as a family, is a square node.
 */
export function RelationGraph({
  timelines,
  extras,
  category,
  minWeight,
  cross,
}: {
  timelines: Timeline[];
  extras: ExtraPerson[];
  category?: string;
  minWeight: number;
  cross: boolean;
}) {
  const index = useMemo(() => buildNameIndex(timelines, extras), [timelines, extras]);
  const full = useMemo(() => buildRelationGraph(index, timelines), [index, timelines]);
  const graph = useMemo(() => filterRelationGraph(full, { category, minWeight, crossOnly: cross }), [full, category, minWeight, cross]);
  const categories = [...new Set(full.nodes.map((n) => n.category))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  // Rebuild the simulation whenever the filtered graph changes.
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svg = select(svgEl);
    svg.selectAll('*').remove();
    const size = () => ({ width: svgEl.clientWidth || 800, height: svgEl.clientHeight || 600 });
    const { width, height } = size();

    const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = graph.links.map((l) => ({ ...l }));
    const neighbors = new Map<string, Set<string>>();
    for (const l of graph.links) {
      if (!neighbors.has(l.source)) neighbors.set(l.source, new Set());
      if (!neighbors.has(l.target)) neighbors.set(l.target, new Set());
      neighbors.get(l.source)!.add(l.target);
      neighbors.get(l.target)!.add(l.source);
    }

    const majorDegree = [...nodes].map((n) => n.degree).sort((a, b) => b - a)[MAJOR_LABELS - 1] ?? 0;

    const root = svg.append('g');
    const link = root
      .append('g')
      .attr('class', 'rg-links')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(links)
      .join('line')
      .attr('class', (d) => (d.see ? 'see' : null))
      .attr('stroke-width', (d) => 1 + Math.min(6, Math.sqrt(d.weight)) + (d.see ? 1 : 0));
    link.append('title').text((d) => {
      const [a, b] = [nodes.find((n) => n.id === d.source), nodes.find((n) => n.id === d.target)];
      const mention = d.weight > 0 ? `${a?.name} → ${b?.name}：${d.forward} 則\n${b?.name} → ${a?.name}：${d.backward} 則` : '';
      return [d.see ? `${a?.name} ⇄ ${b?.name}：相關時間軸（see:）` : '', mention].filter(Boolean).join('\n');
    });

    const node = root
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', (d) =>
        ['rg-node', d.degree >= majorDegree || d.kind === 'timeline' ? 'major' : '', d.kind === 'timeline' ? 'timeline' : '', d.outside ? 'outside' : '']
          .filter(Boolean)
          .join(' '),
      )
      .attr('data-id', (d) => d.id);
    node.each(function (d) {
      const r = radius(d);
      const shape = select(this)
        .append(d.kind === 'timeline' ? 'rect' : 'circle')
        .attr('fill', d.color);
      if (d.kind === 'timeline') shape.attr('x', -r).attr('y', -r).attr('width', 2 * r).attr('height', 2 * r).attr('rx', 3);
      else shape.attr('r', r);
    });
    node
      .append('text')
      .attr('dy', (d) => -radius(d) - 3)
      .attr('text-anchor', 'middle')
      .text((d) => d.name);
    node.append('title').text((d) => `${d.name}${d.years ? `（${d.years}）` : ''}\n${d.category}・連到 ${d.degree} 個節點`);

    const highlight = (id: string | null) => {
      const near = id ? neighbors.get(id) : null;
      svgEl.classList.toggle('focus', id !== null);
      node.classed('near', (d) => d.id === id || !!near?.has(d.id));
      link.classed('near', (d) => id !== null && ((d.source as SimNode).id === id || (d.target as SimNode).id === id));
    };
    node.on('mouseenter', (_, d) => highlight(d.id)).on('mouseleave', () => highlight(null));
    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelected(d.id);
    });
    svg.on('click', () => setSelected(null));

    const sim: Simulation<SimNode, SimLink> = forceSimulation(nodes)
      .alphaDecay(0.05)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance((d) => 130 - Math.min(70, d.weight * 8)).strength(0.25))
      .force('charge', forceManyBody().strength(-320).distanceMax(500))
      .force('center', forceCenter(width / 2, height / 2))
      .force('x', forceX(width / 2).strength(0.07))
      .force('y', forceY(height / 2).strength(0.07))
      .force('collide', forceCollide<SimNode>((d) => radius(d) + 3))
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as SimNode).x!)
          .attr('y1', (d) => (d.source as SimNode).y!)
          .attr('x2', (d) => (d.target as SimNode).x!)
          .attr('y2', (d) => (d.target as SimNode).y!);
        node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });

    node.call(
      drag<SVGGElement, SimNode>()
        .on('drag', (event, d) => {
          // Reheat only when a node really moves, so a plain click leaves the layout alone.
          sim.alphaTarget(0.3).restart();
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (_, d) => {
          sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }),
    );

    let userZoomed = false;
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 6])
      .on('zoom', (event) => {
        if (event.sourceEvent) userZoomed = true;
        root.attr('transform', event.transform.toString());
        svgEl.classList.toggle('zoomed', event.transform.k >= 1.6);
      });
    svg.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity);
    svg.on('dblclick.zoom', null);

    // Once the layout settles, zoom out just far enough to see everyone, unless the user has already taken over the view.
    sim.on('end', () => {
      sim.on('end', null);
      if (userZoomed) return;
      const xs = nodes.map((n) => n.x ?? 0);
      const ys = nodes.map((n) => n.y ?? 0);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const s = size();
      const k = Math.min(1, (0.9 * s.width) / (x1 - x0 + 80), (0.9 * s.height) / (y1 - y0 + 80));
      svg.call(zoomBehavior.transform, zoomIdentity.translate(s.width / 2, s.height / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2));
    });

    const onResize = new ResizeObserver(() => {
      const s = size();
      sim.force('center', forceCenter(s.width / 2, s.height / 2));
      sim.force('x', forceX(s.width / 2).strength(0.04));
      sim.force('y', forceY(s.height / 2).strength(0.04));
      sim.alpha(0.3).restart();
    });
    onResize.observe(svgEl);

    return () => {
      sim.stop();
      onResize.disconnect();
    };
  }, [graph]);

  // Selection and search only change classes, so they never restart the simulation.
  const q = query.trim();
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    for (const g of svg.querySelectorAll<SVGGElement>('.rg-node')) {
      const node = graph.nodes.find((n) => n.id === g.dataset.id);
      g.classList.toggle('selected', g.dataset.id === selected);
      g.classList.toggle('match', q !== '' && !!node && node.name.includes(q));
    }
  }, [graph, selected, q]);

  const byId = new Map(full.nodes.map((n) => [n.id, n]));
  const entry = selected ? byId.get(selected) : undefined;
  const selectedLinks = selected
    ? graph.links
        .filter((l) => l.source === selected || l.target === selected)
        .map((l) => {
          const other = byId.get(l.source === selected ? l.target : l.source)!;
          const out = l.source === selected ? l.forward : l.backward;
          return { other, out, in: l.weight - out, weight: l.weight, see: l.see };
        })
        .sort((a, b) => Number(b.see) - Number(a.see) || b.weight - a.weight)
    : [];

  return (
    <div className="relation-graph">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          人物關係圖{' '}
          <small>
            {graph.nodes.length} 個節點・{graph.links.length} 條連線
          </small>
        </h1>
      </header>

      <div className="rg-controls">
        <nav className="dash-tag-filter" aria-label="類別">
          <a className={category ? 'tag-chip' : 'tag-chip active'} href={graphHash(null, minWeight, cross)}>
            全部
          </a>
          {categories.map((c) => (
            <a key={c} className={c === category ? 'tag-chip active' : 'tag-chip'} href={graphHash(c, minWeight, cross)}>
              {c}
            </a>
          ))}
        </nav>
        <div className="ni-tools">
          <a className={cross ? 'tag-chip active' : 'tag-chip'} href={graphHash(category, minWeight, !cross)} title="只留下連到另一個類別的連線">
            只看跨類別
          </a>
          <div className="ls-fold" role="group" aria-label="最少提及事件數">
            {WEIGHTS.map((w) => (
              <a key={w} className={w === minWeight ? 'active' : undefined} href={graphHash(category, w, cross)}>
                ≥{w}
              </a>
            ))}
          </div>
          <input className="search" type="search" placeholder="標示人名…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="rg-stage">
        <svg ref={svgRef} className="rg-svg" role="img" aria-label="人物關係圖" />
        {graph.nodes.length === 0 && <p className="empty rg-empty">沒有符合條件的連線。</p>}
        <p className="rg-hint">滾輪縮放、拖曳移動；點節點看連線。實線＝提及（越粗事件越多），虛線＝相關時間軸（see:），方塊＝家族或時代等時間軸</p>

        {entry && (
          <aside className="rg-panel">
            <button type="button" className="rg-close" aria-label="關閉" onClick={() => setSelected(null)}>
              ×
            </button>
            <h2 style={{ borderColor: entry.color }}>{entry.name}</h2>
            <p className="rg-meta">{[entry.years, entry.category].filter(Boolean).join('・')}</p>
            <p className="rg-own">
              {entry.links.map((t) => (
                <a key={t.id} href={timelineHash([t.id], 'vertical')}>
                  {t.title}
                </a>
              ))}
              {entry.kind === 'person' && <a href={INDEX_HASH}>人名索引</a>}
            </p>
            <h3>
              連線 <small>{selectedLinks.length}</small>
            </h3>
            <ul>
              {selectedLinks.map(({ other, out, in: back, weight, see }) => (
                <li key={other.id}>
                  <button type="button" onClick={() => setSelected(other.id)}>
                    {other.name}
                    {other.category !== entry.category && <em>{other.category}</em>}
                  </button>
                  <small>
                    {see && '相關時間軸'}
                    {see && weight > 0 && '・'}
                    {weight > 0 && `提到對方 ${out}・被對方提到 ${back}`}
                  </small>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
