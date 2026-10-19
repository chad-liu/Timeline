import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { formatYear } from '../lib/parseDate';
import { dashboardHash, timelineHash } from '../lib/route';
import { buildLifespanScale, lifespanTicks, BREAK_PX } from '../lib/lifespanScale';
import { groupByTag, groupTimelines } from '../lib/timelineOrder';
import { Logo } from './Logo';

type Person = Timeline & { born: number; died: number };

const ZOOMS = [2, 3, 5, 8];

/** 「巴赫生平」→「巴赫」、「蘇東坡生平大事記」→「蘇東坡」 */
function personName(t: Timeline): string {
  return t.title.replace(/(生平|大事記).*$/, '') || t.title;
}

function lifeLabel(p: Person): string {
  const age = Math.floor(p.died - p.born + 1e-9);
  return `${formatYear(Math.floor(p.born))}–${formatYear(Math.floor(p.died))}（${age}歲）`;
}

/** Rough rendered width of a bar label at 11px: CJK characters are about twice as wide as digits. */
function labelWidth(label: string): number {
  return [...label].reduce((w, ch) => w + (/[　-鿿＀-￯]/.test(ch) ? 11 : 6.2), 12);
}

/** Lifespan chart: every person timeline as a bar from birth to death, grouped by category and then by tag; both levels collapse. */
export function Lifespans({ timelines }: { timelines: Timeline[] }) {
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<Person | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Year shown at the left edge of the chart, kept when zooming; starts at the first person of the first group. */
  const leftYear = useRef<number | null>(null);

  const people = useMemo(() => timelines.filter((t): t is Person => t.born !== undefined && t.died !== undefined), [timelines]);
  const groups = useMemo(
    () =>
      groupTimelines(people).map((g) => {
        const sorted = [...(g.timelines as Person[])].sort((a, b) => a.born - b.born);
        return { category: g.category, people: sorted, subgroups: groupByTag(sorted).map((s) => ({ tag: s.tag, people: s.timelines as Person[] })) };
      }),
    [people],
  );
  /** Collapsed keys: a category name, or `category/tag` for a tag subgroup. */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const scale = useMemo(() => buildLifespanScale(people.map((p) => [p.born, p.died]), ZOOMS[zoom]), [people, zoom]);
  const ticks = lifespanTicks(scale);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const year = leftYear.current ?? (groups[0]?.people[0]?.born ?? 0) - 15;
    el.scrollLeft = scale.xOf(year);
  }, [scale, groups]);

  const changeZoom = (next: number) => {
    const el = scrollRef.current;
    if (el) leftYear.current = scale.yearAt(el.scrollLeft);
    setZoom(next);
  };

  /** One person row; a person with two tags (e.g. 貝多芬) appears under both, so the key includes the subgroup. */
  const renderRow = (p: Person, groupKey: string) => {
    const left = scale.xOf(p.born);
    const width = Math.max(scale.xOf(p.died) - left, 2);
    const href = timelineHash([p.id], 'vertical');
    const label = lifeLabel(p);
    const fits = labelWidth(label) <= width;
    return (
      <div key={`${groupKey}/${p.id}`} className={hovered?.id === p.id ? 'ls-row hovered' : 'ls-row'} onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}>
        <a className="ls-name" href={href} title={p.title}>
          {personName(p)}
        </a>
        <div className="ls-track" style={{ width: scale.width }}>
          <a className="ls-bar" href={href} style={{ left, width, background: p.color }} title={`${personName(p)} ${label}`}>
            {fits && <span>{label}</span>}
          </a>
          {!fits && (
            <span className="ls-outside" style={{ left: left + width + 4 }}>
              {label}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="lifespans">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          人物年表 <small>{people.length} 人</small>
        </h1>
        <div className="ls-fold" role="group" aria-label="展開或收合">
          <button type="button" onClick={() => setCollapsed(new Set())} disabled={collapsed.size === 0}>
            全部展開
          </button>
          <button type="button" onClick={() => setCollapsed(new Set(groups.map((g) => g.category)))}>
            全部收合
          </button>
        </div>
        <div className="ls-zoom" role="group" aria-label="縮放">
          <button type="button" onClick={() => changeZoom(zoom - 1)} disabled={zoom === 0} aria-label="縮小">
            −
          </button>
          <button type="button" onClick={() => changeZoom(zoom + 1)} disabled={zoom === ZOOMS.length - 1} aria-label="放大">
            +
          </button>
        </div>
      </header>

      <div className="ls-scroll" ref={scrollRef}>
        <div className="ls-inner" style={{ width: `calc(var(--ls-name-w) + ${scale.width}px)` }}>
          <div className="ls-axis-row">
            <div className="ls-corner">人物</div>
            <div className="ls-axis" style={{ width: scale.width }}>
              {ticks.map((y) => (
                <span key={y} className={y % 100 === 0 ? 'ls-tick major' : 'ls-tick'} style={{ left: scale.xOf(y) }}>
                  {formatYear(y)}
                </span>
              ))}
              {scale.segments.slice(1).map((s) => (
                <span key={s.start} className="ls-break" style={{ left: s.x - BREAK_PX, width: BREAK_PX }} title="中間略去沒有人物的年代" />
              ))}
            </div>
          </div>

          <div className="ls-body">
            <div className="ls-grid" style={{ width: scale.width }} aria-hidden="true">
              {ticks.map((y) => (
                <span key={y} className={y % 100 === 0 ? 'ls-line major' : 'ls-line'} style={{ left: scale.xOf(y) }} />
              ))}
              {scale.segments.slice(1).map((s) => (
                <span key={s.start} className="ls-gap" style={{ left: s.x - BREAK_PX, width: BREAK_PX }} />
              ))}
              {hovered && (
                <span className="ls-span" style={{ left: scale.xOf(hovered.born), width: scale.xOf(hovered.died) - scale.xOf(hovered.born), borderColor: hovered.color }} />
              )}
            </div>

            {groups.map((g) => {
              const open = !collapsed.has(g.category);
              return (
                <section key={g.category} className="ls-group">
                  <div className="ls-group-row">
                    <button type="button" className="ls-group-name" onClick={() => toggle(g.category)} aria-expanded={open}>
                      <span className="ls-chev">{open ? '▾' : '▸'}</span>
                      {g.category} <small>{g.people.length}</small>
                    </button>
                  </div>
                  {open &&
                    g.subgroups.map((s) => {
                      const key = `${g.category}/${s.tag}`;
                      const subOpen = !s.tag || !collapsed.has(key);
                      return (
                        <div key={key} className="ls-subgroup">
                          {s.tag && (
                            <div className="ls-group-row">
                              <button type="button" className="ls-subgroup-name" onClick={() => toggle(key)} aria-expanded={subOpen}>
                                <span className="ls-chev">{subOpen ? '▾' : '▸'}</span>
                                {s.tag} <small>{s.people.length}</small>
                              </button>
                            </div>
                          )}
                          {subOpen && s.people.map((p) => renderRow(p, key))}
                        </div>
                      );
                    })}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
