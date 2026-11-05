import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { formatYear } from '../lib/parseDate';
import { dashboardHash, lifespansHash, timelineHash } from '../lib/route';
import type { LifespanMode } from '../lib/route';
import { buildLifespanScale, lifespanTicks, BREAK_PX } from '../lib/lifespanScale';
import { groupByTag, groupTimelines } from '../lib/timelineOrder';
import { personName } from '../lib/peopleIndex';
import { rulerBars } from '../lib/chineseRulers';
import type { RulerBar } from '../lib/chineseRulers';
import { eraChain, JAPAN_TIMELINE_ID } from '../lib/japanEras';
import { readableText } from '../lib/color';
import { Logo } from './Logo';

type Person = Timeline & { born: number; died: number };

const ZOOMS = [2, 3, 5, 8];

function lifeLabel(p: Person): string {
  const age = Math.floor(p.died - p.born + 1e-9);
  return `${formatYear(Math.floor(p.born))}–${formatYear(Math.floor(p.died))}（${age}歲）`;
}

/** Rough rendered width of a bar label at 11px: CJK characters are about twice as wide as digits. */
function labelWidth(label: string): number {
  return [...label].reduce((w, ch) => w + (/[　-鿿＀-￯]/.test(ch) ? 11 : 6.2), 12);
}

/** 「康熙（1661–1722）」 when it fits the reign's width, else just 「康熙」, else nothing (the hover title still has it). */
function rulerText(label: string, name: string, width: number): string {
  if (labelWidth(label) <= width) return label;
  return labelWidth(name) <= width ? name : '';
}

/** Two people count as contemporaries when their lives overlap or end/begin within this many years of each other (Confucius d. 479 BC, Socrates b. 469 BC). */
const NEAR_YEARS = 50;

function overlaps(a: Person, b: Person): boolean {
  return a.born <= b.died + NEAR_YEARS && b.born <= a.died + NEAR_YEARS;
}

/**
 * Lifespan chart: every person timeline as a bar from birth to death. `category` mode groups by category and then by tag (both levels
 * collapse); `era` mode is one list ordered by birth year so contemporaries from different fields sit side by side. Picking a person
 * (the ◎ button) dims everyone who did not live at the same time, or hides them with `only`. Mode and pick are kept in the URL.
 */
export function Lifespans({ timelines, mode: initialMode, selected, only: initialOnly }: { timelines: Timeline[]; mode: LifespanMode; selected?: string; only: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<LifespanMode>(initialMode);
  const [pickedId, setPickedId] = useState<string | undefined>(selected);
  const [only, setOnly] = useState(initialOnly);
  const [hovered, setHovered] = useState<Person | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Year shown at the left edge of the chart, kept when zooming; starts at the first person of the first group. */
  const leftYear = useRef<number | null>(null);

  const people = useMemo(() => timelines.filter((t): t is Person => t.born !== undefined && t.died !== undefined), [timelines]);
  const picked = useMemo(() => people.find((p) => p.id === pickedId), [people, pickedId]);
  /** Everyone shown: all people, or only the picked person's contemporaries. */
  const shown = useMemo(() => (picked && only ? people.filter((p) => overlaps(p, picked)) : people), [people, picked, only]);
  const contemporaries = useMemo(() => (picked ? people.filter((p) => p.id !== picked.id && overlaps(p, picked)).length : 0), [people, picked]);
  const eraList = useMemo(() => [...shown].sort((a, b) => a.born - b.born), [shown]);

  useEffect(() => {
    history.replaceState(null, '', lifespansHash(mode, picked?.id, only));
  }, [mode, picked, only]);

  const groups = useMemo(
    () =>
      groupTimelines(shown).map((g) => {
        const sorted = [...(g.timelines as Person[])].sort((a, b) => a.born - b.born);
        return { category: g.category, people: sorted, subgroups: groupByTag(sorted).map((s) => ({ tag: s.tag, people: s.timelines as Person[] })) };
      }),
    [shown],
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
  const rulers = useMemo(() => rulerBars(scale), [scale]);
  const japanEras = useMemo(() => rulerBars(scale, eraChain(timelines.find((t) => t.id === JAPAN_TIMELINE_ID)), ''), [scale, timelines]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const year = leftYear.current ?? (picked?.born ?? groups[0]?.people[0]?.born ?? 0) - 15;
    el.scrollLeft = scale.xOf(year);
  }, [scale, groups]);

  /** Scroll so the person's bar sits in the middle of the visible chart, both across and down (the name column and the axis rows do not count). */
  const centerOn = (p: Person, row: Element | null) => {
    const el = scrollRef.current;
    if (!el || !row) return;
    const nameW = row.querySelector<HTMLElement>('.ls-name')?.offsetWidth ?? 0;
    const headH = el.querySelector<HTMLElement>('.ls-head')?.offsetHeight ?? 0;
    const left = Math.max(0, (scale.xOf(p.born) + scale.xOf(p.died)) / 2 - (el.clientWidth - nameW) / 2);
    const rowMid = row.getBoundingClientRect().top - el.getBoundingClientRect().top + row.getBoundingClientRect().height / 2;
    const top = Math.max(0, el.scrollTop + rowMid - (headH + (el.clientHeight - headH) / 2));
    leftYear.current = scale.yearAt(left);
    el.scrollTo({ left, top, behavior: 'smooth' });
  };

  const changeZoom = (next: number) => {
    const el = scrollRef.current;
    if (el) leftYear.current = scale.yearAt(el.scrollLeft);
    setZoom(next);
  };

  /** A row of reigns or eras under the year axis; bars with their own colour use it, the rest alternate two shades. */
  const renderRulerRow = (label: string, bars: RulerBar[]) => (
    <div className="ls-ruler-row">
      <div className="ls-corner">{label}</div>
      <div className="ls-axis" style={{ width: scale.width }}>
        {bars.map((b, i) => (
          <span
            key={`${b.ruler.dynasty}/${b.ruler.name}/${b.left}`}
            className={i % 2 ? 'ls-ruler alt' : 'ls-ruler'}
            style={{ left: b.left, width: b.width, ...(b.ruler.color && { background: b.ruler.color, color: readableText(b.ruler.color) }) }}
            title={b.title}
          >
            {b.label && rulerText(b.label, b.ruler.name, b.width)}
          </span>
        ))}
        {scale.segments.slice(1).map((s) => (
          <span key={s.start} className="ls-break" style={{ left: s.x - BREAK_PX, width: BREAK_PX }} />
        ))}
      </div>
    </div>
  );

  /** One person row; a person with two tags (e.g. 貝多芬) appears under both, so the key includes the subgroup. */
  const renderRow = (p: Person, groupKey: string) => {
    const left = scale.xOf(p.born);
    const width = Math.max(scale.xOf(p.died) - left, 2);
    const href = timelineHash([p.id], 'vertical');
    const label = lifeLabel(p);
    const fits = labelWidth(label) <= width;
    const isPicked = picked?.id === p.id;
    const dim = picked && !isPicked && !overlaps(p, picked);
    const cls = ['ls-row', hovered?.id === p.id && 'hovered', isPicked && 'picked', dim && 'dim'].filter(Boolean).join(' ');
    return (
      <div key={`${groupKey}/${p.id}`} className={cls} onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}>
        <div className="ls-name">
          <button
            type="button"
            className="ls-pick"
            aria-pressed={isPicked}
            title={isPicked ? '取消標示同時代的人' : '標示同時代的人'}
            onClick={(e) => {
              setPickedId(isPicked ? undefined : p.id);
              if (isPicked) setOnly(false);
              else centerOn(p, e.currentTarget.closest('.ls-row'));
            }}
          >
            ◎
          </button>
          <a href={href} title={mode === 'era' && p.category ? `${p.title}（${p.category}）` : p.title}>
            {personName(p)}
          </a>
        </div>
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
        <div className="ls-mode" role="group" aria-label="排列方式">
          <button type="button" aria-pressed={mode === 'category'} onClick={() => setMode('category')}>
            依類別
          </button>
          <button type="button" aria-pressed={mode === 'era'} onClick={() => setMode('era')}>
            依時代
          </button>
        </div>
        {picked && (
          <div className="ls-picked" role="group" aria-label="同時代的人物">
            <span>
              與 <b>{personName(picked)}</b> 同時代（前後 {NEAR_YEARS} 年內）：{contemporaries} 人
            </span>
            <button type="button" aria-pressed={only} onClick={() => setOnly(!only)}>
              只看同時代
            </button>
            <button type="button" aria-label="取消標示" title="取消標示" onClick={() => { setPickedId(undefined); setOnly(false); }}>
              ✕
            </button>
          </div>
        )}
        {mode === 'category' && (
          <div className="ls-fold" role="group" aria-label="展開或收合">
            <button type="button" onClick={() => setCollapsed(new Set())} disabled={collapsed.size === 0}>
              全部展開
            </button>
            <button type="button" onClick={() => setCollapsed(new Set(groups.map((g) => g.category)))}>
              全部收合
            </button>
          </div>
        )}
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
          <div className="ls-head">
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
            {renderRulerRow('中國帝王', rulers)}
            {japanEras.length > 0 && renderRulerRow('日本時代', japanEras)}
          </div>

          <div className="ls-body">
            <div className="ls-grid" style={{ width: scale.width }} aria-hidden="true">
              {ticks.map((y) => (
                <span key={y} className={y % 100 === 0 ? 'ls-line major' : 'ls-line'} style={{ left: scale.xOf(y) }} />
              ))}
              {scale.segments.slice(1).map((s) => (
                <span key={s.start} className="ls-gap" style={{ left: s.x - BREAK_PX, width: BREAK_PX }} />
              ))}
              {picked && (
                <span className="ls-span picked" style={{ left: scale.xOf(picked.born), width: scale.xOf(picked.died) - scale.xOf(picked.born), borderColor: picked.color }} />
              )}
              {hovered && (
                <span className="ls-span" style={{ left: scale.xOf(hovered.born), width: scale.xOf(hovered.died) - scale.xOf(hovered.born), borderColor: hovered.color }} />
              )}
            </div>

            {mode === 'era' && eraList.map((p) => renderRow(p, 'era'))}
            {mode === 'category' && groups.map((g) => {
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
