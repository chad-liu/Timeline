import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldUrl from 'world-atlas/countries-50m.json?url';
import type { Timeline } from '../types';
import { buildStays, busiestYear, routeOf, stayInYear } from '../lib/places';
import type { Place, Stay } from '../lib/places';
import { dashboardHash, mapHash, timelineHash } from '../lib/route';
import { Logo } from './Logo';

/** The category the map covers for now. */
const CATEGORY = '音樂家';
const FALLBACK_YEAR = 1800;
const MAX_ZOOM = 80;
/** Degrees of longitude kept around a person's route (half as much latitude), so neighbouring countries stay recognisable. */
const ROUTE_MARGIN = 7;
/** [[west, south], [east, north]] in degrees. */
type Bounds = [[number, number], [number, number]];
const EUROPE: Bounds = [
  [-11, 35],
  [42, 62],
];
const WORLD: Bounds = [
  [-130, -40],
  [150, 68],
];

/** World coordinates of the base map; the zoom transform maps them to the screen. */
const projection = geoMercator().scale(160).translate([0, 0]);
const project = (place: Place): [number, number] => projection([place.lon, place.lat]) ?? [0, 0];

interface Person {
  timeline: Timeline;
  name: string;
  stays: Stay[];
  unknown: string[];
}

const shortName = (title: string) => title.replace(/(生平|大事記|時間軸)$/, '');

/**
 * The map (#p=map&y=1723&sel=Bach): where each musician was in the chosen year, from the `@place` of their periods
 * and events, and the route of the selected person. Places are located by Data\index\places.md.
 */
export function MapView({
  timelines,
  places,
  year: initialYear,
  selected: initialSelected,
}: {
  timelines: Timeline[];
  places: Place[];
  year?: number;
  selected?: string;
}) {
  const people: Person[] = useMemo(
    () =>
      timelines
        .filter((t) => t.category === CATEGORY && t.born !== undefined)
        .map((timeline) => ({ timeline, name: shortName(timeline.title), ...buildStays(timeline, places) })),
    [timelines, places],
  );
  const located = useMemo(() => people.filter((p) => p.stays.length > 0), [people]);
  const range = useMemo(() => {
    const all = located.flatMap((p) => p.stays);
    if (all.length === 0) return { min: FALLBACK_YEAR, max: FALLBACK_YEAR };
    return { min: Math.floor(Math.min(...all.map((s) => s.start))), max: Math.floor(Math.max(...all.map((s) => s.end))) };
  }, [located]);

  const [year, setYear] = useState(
    () =>
      initialYear ??
      busiestYear(
        located.map((p) => p.stays),
        FALLBACK_YEAR,
      ),
  );
  const [selectedId, setSelectedId] = useState(initialSelected);
  const selected = located.find((p) => p.timeline.id === selectedId);
  const clampYear = (y: number) => Math.min(range.max, Math.max(range.min, y));

  useEffect(() => {
    history.replaceState(null, '', mapHash(year, selected?.timeline.id));
  }, [year, selected]);

  // Who was where this year, grouped by place, the fullest places first.
  const cities = useMemo(() => {
    const byPlace = new Map<Place, { person: Person; stay: Stay }[]>();
    for (const person of located) {
      const stay = stayInYear(person.stays, year);
      if (!stay) continue;
      byPlace.set(stay.place, [...(byPlace.get(stay.place) ?? []), { person, stay }]);
    }
    return [...byPlace].map(([place, residents]) => ({ place, residents })).sort((a, b) => b.residents.length - a.residents.length);
  }, [located, year]);
  const route = useMemo(() => (selected ? routeOf(selected.stays) : []), [selected]);
  const here = selected && stayInYear(selected.stays, year);

  // Base map: Natural Earth country outlines, fetched once and turned into a single path in world coordinates.
  const [land, setLand] = useState('');
  useEffect(() => {
    let cancelled = false;
    fetch(worldUrl)
      .then((res) => res.json())
      .then((world: Topology<{ countries: GeometryCollection }>) => {
        if (!cancelled) setLand(geoPath(projection)(feature(world, world.objects.countries)) ?? '');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, MAX_ZOOM])
      .on('zoom', (event: { transform: ZoomTransform }) => setT(event.transform));
    zoomRef.current = behavior;
    select(svg).call(behavior);
    return () => {
      select(svg).on('.zoom', null);
    };
  }, []);

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const fit = useCallback(([[west, south], [east, north]]: Bounds) => {
    const svg = svgRef.current;
    const { width, height } = sizeRef.current;
    if (!svg || !zoomRef.current || width === 0 || height === 0) return;
    const [x0, y0] = projection([west, north]) ?? [0, 0];
    const [x1, y1] = projection([east, south]) ?? [0, 0];
    const k = Math.min(MAX_ZOOM, 0.9 * Math.min(width / (x1 - x0), height / (y1 - y0)));
    select(svg).call(
      zoomRef.current.transform,
      zoomIdentity.translate(width / 2 - (k * (x0 + x1)) / 2, height / 2 - (k * (y0 + y1)) / 2).scale(k),
    );
  }, []);

  // Open on Europe, or on the selected person's route; picking someone else moves the map to their route.
  const hasSize = size.width > 0 && size.height > 0;
  useEffect(() => {
    if (!hasSize) return;
    if (route.length === 0) {
      fit(EUROPE);
      return;
    }
    const lons = route.map((s) => s.place.lon);
    const lats = route.map((s) => s.place.lat);
    fit([
      [Math.min(...lons) - ROUTE_MARGIN, Math.min(...lats) - ROUTE_MARGIN / 2],
      [Math.max(...lons) + ROUTE_MARGIN, Math.max(...lats) + ROUTE_MARGIN / 2],
    ]);
  }, [hasSize, route, fit]);

  const screen = (place: Place): [number, number] => t.apply(project(place));
  const unknown = people.flatMap((p) => [...new Set(p.unknown)].map((raw) => `${p.name}：${raw}`));
  const count = cities.reduce((n, c) => n + c.residents.length, 0);

  return (
    <div className="map-view">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          地圖{' '}
          <small>
            {CATEGORY}・{located.length} 人
          </small>
        </h1>
      </header>

      <div className="mv-controls">
        <div className="mv-year">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setYear(clampYear(year - 10))}
            aria-label="往前十年"
            title="往前十年"
          >
            «
          </button>
          <button type="button" className="btn-secondary" onClick={() => setYear(clampYear(year - 1))} aria-label="前一年" title="前一年">
            ‹
          </button>
          <input
            className="search mv-year-input"
            type="number"
            aria-label="年份"
            min={range.min}
            max={range.max}
            value={year}
            onChange={(e) => e.target.value !== '' && setYear(clampYear(Math.round(Number(e.target.value))))}
          />
          <button type="button" className="btn-secondary" onClick={() => setYear(clampYear(year + 1))} aria-label="後一年" title="後一年">
            ›
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setYear(clampYear(year + 10))}
            aria-label="往後十年"
            title="往後十年"
          >
            »
          </button>
          <input
            className="mv-slider"
            type="range"
            aria-label="年份滑桿"
            min={range.min}
            max={range.max}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <div className="mv-tools">
          <select
            className="search mv-person"
            aria-label="選擇人物"
            value={selected?.timeline.id ?? ''}
            onChange={(e) => setSelectedId(e.target.value || undefined)}
          >
            <option value="">看某個人的路線…</option>
            {located.map((p) => (
              <option key={p.timeline.id} value={p.timeline.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn-secondary" onClick={() => fit(EUROPE)}>
            歐洲
          </button>
          <button type="button" className="btn-secondary" onClick={() => fit(WORLD)}>
            全世界
          </button>
        </div>
      </div>

      <div className="mv-body">
        <div className="mv-stage" ref={stageRef}>
          <svg ref={svgRef} className={selected ? 'mv-svg focus' : 'mv-svg'} role="img" aria-label={`${year} 年${CATEGORY}所在地的地圖`}>
            <g transform={t.toString()}>
              <path className="mv-land" d={land} />
            </g>
            {selected && route.length > 1 && (
              <polyline className="mv-route" points={route.map((s) => screen(s.place).join(',')).join(' ')} />
            )}
            {cities.map(({ place, residents }) => {
              const [x, y] = screen(place);
              const single = residents.length === 1 ? residents[0].person : undefined;
              return (
                <g
                  key={place.name}
                  className={single ? 'mv-city clickable' : 'mv-city'}
                  transform={`translate(${x},${y})`}
                  onClick={single ? () => setSelectedId(single.timeline.id) : undefined}
                >
                  <title>{`${place.name}：${residents.map((r) => r.person.name).join('、')}`}</title>
                  <circle r={4 + 2.5 * Math.sqrt(residents.length)} />
                  <text x={8 + 2.5 * Math.sqrt(residents.length)} y={4}>
                    {place.name}
                    {residents.length > 1 ? ` ${residents.length}` : `・${residents[0].person.name}`}
                  </text>
                </g>
              );
            })}
            {route.map((stop, i) => {
              const [x, y] = screen(stop.place);
              return (
                <g
                  key={`${stop.place.name}-${i}`}
                  className={here?.place === stop.place ? 'mv-stop here' : 'mv-stop'}
                  transform={`translate(${x},${y})`}
                >
                  <title>{`${i + 1}. ${stop.place.name}（${stop.dateLabel}）${stop.title}`}</title>
                  <circle r={9} />
                  <text className="mv-stop-no" y={4}>
                    {i + 1}
                  </text>
                  <text className="mv-stop-name" x={13} y={4}>
                    {stop.place.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mv-hint">滾輪縮放、拖曳移動。圓點是那一年有紀錄的所在地（依時期與事件標題裡的「@地點」），底圖是現代國界。</p>
        </div>

        <aside className="mv-panel">
          {selected ? (
            <>
              <button type="button" className="rg-close" aria-label="關閉" onClick={() => setSelectedId(undefined)}>
                ×
              </button>
              <h2>
                <a href={timelineHash([selected.timeline.id])}>{selected.name}</a>
              </h2>
              <p className="mv-meta">{here ? `${year} 年在${here.place.name}（${here.title}）` : `${year} 年沒有所在地的紀錄`}</p>
              <ol className="mv-stops">
                {route.map((stop, i) => (
                  <li key={`${stop.place.name}-${i}`} className={here?.place === stop.place ? 'here' : undefined}>
                    <button type="button" onClick={() => setYear(clampYear(Math.floor(stop.start)))} title="把年份移到這裡">
                      <b>{stop.place.name}</b>
                      <span>
                        {stop.dateLabel}　{stop.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h2>
                {year} 年 <small>{count > 0 ? `${count} 人・${cities.length} 個地點` : '沒有所在地的紀錄'}</small>
              </h2>
              {cities.map(({ place, residents }) => (
                <section key={place.name} className="mv-place">
                  <h3>
                    {place.name} <small>{residents.length}</small>
                  </h3>
                  <ul>
                    {residents.map(({ person, stay }) => (
                      <li key={person.timeline.id}>
                        <button type="button" onClick={() => setSelectedId(person.timeline.id)} title="看他的路線">
                          <b>{person.name}</b>
                          <span>
                            {Math.floor(year - (person.timeline.born ?? year))}歲　{stay.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
          {unknown.length > 0 && (
            <details className="mv-unknown">
              <summary>尚未定位的地點 {unknown.length}</summary>
              <p>這些「@地點」不在 Data\index\places.md 裡，沒有畫在地圖上：</p>
              <ul>
                {unknown.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
