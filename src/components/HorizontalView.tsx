import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Lane, Period, Timeline, TimelineEvent } from '../types';
import { makeTicks } from '../lib/scale';
import type { Tick } from '../lib/scale';
import { buildWarp, MIN_GAP, visibleStretches } from '../lib/warp';
import type { Warp } from '../lib/warp';
import { stackRows } from '../lib/layout';
import { PALETTE, readableText } from '../lib/color';
import { EventCard } from './EventCard';

const CARD_W = 230;
const CARD_H = 64;
const CARD_GAP = 12;
const ROW_GAP = 10;
const PERIOD_H = 24;
const PERIOD_GAP = 6;
const BASE_H = 24;
const LANE_HEAD = 36;
const LANE_GAP = 20;
const MAX_PPY = 4000;
const DRAG_THRESHOLD = 4;
/** Width of the striped break drawn in the middle of a squeezed gap. */
const GAP_BREAK_PX = 14;

/**
 * Visible window: warped position at the left edge and zoom in pixels per year.
 * Positions are on the warp axis (see lib/warp), where long empty stretches such as 舊石器 → 繩文 are squeezed;
 * elsewhere one unit is one year.
 */
interface Viewport {
  start: number;
  ppy: number;
}

interface Bounds {
  min: number;
  max: number;
  width: number;
}

interface LaneLayout {
  lane: Lane;
  top: number;
  cardsTop: number;
  cardRows: number;
  periodsTop: number;
  periodRows: number;
  baseY: number;
  cards: { event: TimelineEvent; row: number; x: number; color: string }[];
  periods: { period: Period; row: number; x: number; w: number }[];
}

interface Props {
  lanes: Lane[];
  overlay: boolean;
  onSelect: (event: TimelineEvent) => void;
  onSelectPeriod: (period: Period, timeline: Timeline) => void;
}

/** 「2.2萬年」 or 「5000年」, for the label of a squeezed gap. */
function gapYears(years: number): string {
  return years >= 10000 ? `${Math.round(years / 1000) / 10}萬年` : `${Math.round(years)}年`;
}

function domainOf(timelines: Timeline[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const t of timelines) {
    for (const date of [...t.events.map((e) => e.date), ...t.periods.map((p) => p.date)]) {
      min = Math.min(min, date.start);
      max = Math.max(max, date.end ?? date.start);
    }
  }
  if (!Number.isFinite(min)) return { min: 0, max: 1 };
  if (max - min < 1) return { min: min - 0.5, max: max + 0.5 };
  return { min, max };
}

function clampPpy(ppy: number, b: Bounds): number {
  const minPpy = (b.width * 0.3) / (b.max - b.min);
  return Math.min(MAX_PPY, Math.max(minPpy, ppy));
}

function clampViewport(vp: Viewport, b: Bounds): Viewport {
  const ppy = clampPpy(vp.ppy, b);
  const visible = b.width / ppy;
  const start = Math.min(b.max - visible * 0.1, Math.max(b.min - visible * 0.9, vp.start));
  return { start, ppy };
}

function fitViewport(b: Bounds): Viewport {
  const usable = Math.max(b.width * 0.4, b.width - CARD_W - 60);
  const ppy = usable / (b.max - b.min);
  return { start: b.min - 30 / ppy, ppy };
}

function layoutLanes(lanes: Lane[], overlay: boolean, ppy: number, min: number, warp: Warp): { layouts: LaneLayout[]; height: number } {
  const wx = (year: number) => (warp.toU(year) - min) * ppy;
  let top = 12;

  const layouts = lanes.map((lane): LaneLayout => {
    const { timeline } = lane;
    const order = new Map(timeline.events.map((e, i) => [e.id, i]));
    const colorOf = (e: TimelineEvent) =>
      e.color ?? (overlay ? timeline.color : PALETTE[(order.get(e.id) ?? 0) % PALETTE.length]);

    const cardStack = stackRows(lane.events, (e) => wx(e.date.start), (e) => wx(e.date.start) + CARD_W, CARD_GAP);
    const periodStack = stackRows(
      timeline.periods,
      (p) => wx(p.date.start),
      (p) => Math.max(wx(p.date.end ?? p.date.start), wx(p.date.start) + 8),
      4,
    );

    const cardsTop = top + (overlay ? LANE_HEAD : 0);
    const periodsTop = cardsTop + cardStack.rows * (CARD_H + ROW_GAP);
    const baseY = periodsTop + periodStack.rows * (PERIOD_H + PERIOD_GAP) + BASE_H / 2;
    const layout: LaneLayout = {
      lane,
      top,
      cardsTop,
      cardRows: cardStack.rows,
      periodsTop,
      periodRows: periodStack.rows,
      baseY,
      cards: cardStack.placed.map(({ item, row }) => ({ event: item, row, x: wx(item.date.start), color: colorOf(item) })),
      periods: periodStack.placed.map(({ item, row }) => {
        const x = wx(item.date.start);
        return { period: item, row, x, w: Math.max(8, wx(item.date.end ?? item.date.start) - x) };
      }),
    };
    top = baseY + BASE_H / 2 + LANE_GAP;
    return layout;
  });

  return { layouts, height: top };
}

export function HorizontalView({ lanes, overlay, onSelect, onSelectPeriod }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [width, setWidth] = useState(0);
  const [vp, setVp] = useState<Viewport | null>(null);

  const timelineKey = lanes.map((l) => l.timeline.id).join('|');
  // Domain depends on the full timelines, not the search-filtered events, so typing doesn't re-zoom.
  // When several timelines are overlaid, the smallest `squeeze` among them applies.
  const warp = useMemo(
    () =>
      buildWarp(
        lanes.flatMap((l) => [...l.timeline.events, ...l.timeline.periods].flatMap((x) => [x.date.start, x.date.end ?? x.date.start])),
        Math.min(MIN_GAP, ...lanes.map((l) => l.timeline.squeeze ?? MIN_GAP)),
      ),
    [timelineKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const domain = useMemo(() => {
    const years = domainOf(lanes.map((l) => l.timeline));
    return { min: warp.toU(years.min), max: warp.toU(years.max) };
  }, [timelineKey, warp]); // eslint-disable-line react-hooks/exhaustive-deps
  const boundsRef = useRef<Bounds>({ ...domain, width });
  boundsRef.current = { ...domain, width };

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fit = useCallback(() => {
    setVp(fitViewport(boundsRef.current));
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const hasWidth = width > 0;
  useLayoutEffect(() => {
    if (hasWidth) fit();
  }, [domain, hasWidth, fit]);

  const update = useCallback((fn: (v: Viewport) => Viewport) => {
    setVp((v) => v && clampViewport(fn(v), boundsRef.current));
  }, []);

  const zoomAt = useCallback(
    (factor: number, anchorPx: number) => {
      update((v) => {
        const ppy = clampPpy(v.ppy * factor, boundsRef.current);
        const anchorYear = v.start + anchorPx / v.ppy;
        return { ppy, start: anchorYear - anchorPx / ppy };
      });
    },
    [update],
  );

  // The scroll element only mounts once the viewport is known.
  const ready = vp !== null;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        update((v) => ({ ...v, start: v.start + e.deltaX / v.ppy }));
        return;
      }
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - el.getBoundingClientRect().left);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [update, zoomAt, ready]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTop = el.scrollTop;
    let lastX = startX;
    draggedRef.current = false;

    const move = (ev: PointerEvent) => {
      if (!draggedRef.current && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
      draggedRef.current = true;
      const dx = ev.clientX - lastX;
      lastX = ev.clientX;
      update((v) => ({ ...v, start: v.start - dx / v.ppy }));
      el.scrollTop = startTop - (ev.clientY - startY);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const select = (event: TimelineEvent) => {
    if (!draggedRef.current) onSelect(event);
  };

  const ppy = vp?.ppy ?? 1;
  const { layouts, height } = useMemo(() => layoutLanes(lanes, overlay, ppy, domain.min, warp), [lanes, overlay, ppy, domain.min, warp]);

  // Overview bar spans the whole domain plus a margin.
  const pad = (domain.max - domain.min) * 0.05;
  const fullMin = domain.min - pad;
  const fullSpan = domain.max - domain.min + pad * 2;
  const onOverviewPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const year = fullMin + ((e.clientX - rect.left) / rect.width) * fullSpan;
    update((v) => ({ ...v, start: year - width / 2 / v.ppy }));
  };

  if (!vp) return <div className="hview" ref={rootRef} />;

  const offset = (vp.start - domain.min) * vp.ppy;
  const sx = (worldX: number) => worldX - offset;
  const tickX = (year: number) => (warp.toU(year) - vp.start) * vp.ppy;
  const isVisible = (x0: number, x1: number) => x1 >= -50 && x0 <= width + 50;
  // Ticks are laid out in real years within each unsqueezed stretch; a squeezed gap keeps its plain background
  // (prehistoric bands and events there stay readable) and gets a narrow striped break at its centre.
  const ticks: Tick[] = visibleStretches(warp, vp.start, vp.start + width / vp.ppy).flatMap(([from, to]) => makeTicks(from, to, vp.ppy));
  const gaps = warp.gaps
    .map((g) => {
      const left = (g.uStart - vp.start) * vp.ppy;
      const w = (g.uEnd - g.uStart) * vp.ppy;
      const breakW = Math.min(GAP_BREAK_PX, w);
      return { ...g, center: left + w / 2, breakLeft: left + w / 2 - breakW / 2, breakW, wide: w >= 90 };
    })
    .filter((g) => isVisible(g.breakLeft, g.breakLeft + g.breakW));
  const windowLeft = ((vp.start - fullMin) / fullSpan) * 100;
  const windowWidth = (width / vp.ppy / fullSpan) * 100;

  return (
    <div className="hview" ref={rootRef}>
      <div className="hview-scroll" ref={scrollRef} onPointerDown={onPointerDown}>
        <div className="hview-content" style={{ height }}>
          {ticks.map((t) => (
            <div key={t.value} className={t.major ? 'hview-grid major' : 'hview-grid'} style={{ left: tickX(t.value) }} />
          ))}
          {layouts.map((L) => (
            <Fragment key={L.lane.timeline.id}>
              {overlay && (
                <div className="hview-lane-title" style={{ top: L.top }}>
                  <span className="dot" style={{ background: L.lane.timeline.color }} />
                  {L.lane.timeline.title}
                </div>
              )}
              <div className="hview-baseline" style={{ top: L.baseY - 1 }} />
              {L.periods
                .filter((p) => isVisible(sx(p.x), sx(p.x + p.w)))
                .map((p) => {
                  // Clip to the viewport so the label stays readable while panning.
                  const left = Math.max(sx(p.x), -4);
                  const right = Math.min(sx(p.x + p.w), width + 4);
                  const hasDetail = p.period.html !== '';
                  return (
                    <div
                      key={`${p.period.title}-${p.x}`}
                      className={hasDetail ? 'hview-period clickable' : 'hview-period'}
                      onClick={hasDetail ? () => !draggedRef.current && onSelectPeriod(p.period, L.lane.timeline) : undefined}
                      title={`${p.period.date.label}　${p.period.title}`}
                      style={{
                        left,
                        width: right - left,
                        top: L.periodsTop + (L.periodRows - 1 - p.row) * (PERIOD_H + PERIOD_GAP),
                        background: p.period.color,
                        color: readableText(p.period.color),
                      }}
                    >
                      {p.period.title}
                    </div>
                  );
                })}
              {L.cards
                .filter((c) => isVisible(sx(c.x), sx(c.x + CARD_W)))
                .map((c) => {
                  const top = L.cardsTop + (L.cardRows - 1 - c.row) * (CARD_H + ROW_GAP);
                  const left = sx(c.x);
                  const end = c.event.date.end;
                  return (
                    <Fragment key={c.event.id}>
                      <div className="hview-stem" style={{ left, top: top + CARD_H, height: L.baseY - top - CARD_H, borderColor: c.color }} />
                      {end !== undefined && (
                        <div
                          className="hview-range"
                          style={{ left, top: L.baseY - 3, width: Math.max(2, (warp.toU(end) - warp.toU(c.event.date.start)) * vp.ppy), background: c.color }}
                        />
                      )}
                      <div className="hview-dot" style={{ left, top: L.baseY, background: c.color }} />
                      <EventCard
                        event={c.event}
                        color={c.color}
                        onClick={() => select(c.event)}
                        style={{ left, top, width: CARD_W, height: CARD_H }}
                      />
                    </Fragment>
                  );
                })}
            </Fragment>
          ))}
          {gaps.map((g) => (
            <div key={g.start} className="hview-gap" style={{ left: g.breakLeft, width: g.breakW }} />
          ))}
        </div>
      </div>

      <div className="hview-axis">
        {ticks.map((t) => (
          <span key={t.value} className={t.major ? 'tick major' : 'tick'} style={{ left: tickX(t.value) }}>
            {t.label}
          </span>
        ))}
        {gaps.map((g) => (
          <span key={g.start} className="hview-gap-label" style={{ left: g.center }} title={`中間略去${gapYears(g.end - g.start)}`}>
            {g.wide ? `略去${gapYears(g.end - g.start)}` : '⋯'}
          </span>
        ))}
      </div>

      <div className="hview-footer">
        <div
          className="hview-overview"
          onPointerDown={onOverviewPointer}
          onPointerMove={onOverviewPointer}
          title="拖曳以移動檢視範圍"
        >
          {lanes.flatMap((l) =>
            l.events.map((e) => (
              <span key={e.id} className="hview-overview-mark" style={{ left: `${((warp.toU(e.date.start) - fullMin) / fullSpan) * 100}%` }} />
            )),
          )}
          <div className="hview-window" style={{ left: `${windowLeft}%`, width: `${windowWidth}%` }} />
        </div>
        <div className="hview-zoom">
          <button type="button" onClick={() => zoomAt(1 / 1.5, width / 2)} aria-label="縮小">
            −
          </button>
          <button type="button" onClick={fit} aria-label="顯示全部">
            ⤢
          </button>
          <button type="button" onClick={() => zoomAt(1.5, width / 2)} aria-label="放大">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
