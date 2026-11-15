import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { buildGallery, categoryOfItem, eraOf } from '../lib/gallery';
import type { GalleryItem } from '../lib/gallery';
import { dashboardHash, galleryHash, timelineHash } from '../lib/route';
import { CATEGORY_ORDER } from '../lib/timelineOrder';
import { Logo } from './Logo';

/** Pictures added each time the end of the wall scrolls into view. */
const PAGE = 120;

function Tile({ item }: { item: GalleryItem }) {
  const { image, event, timeline, uses } = item;
  return (
    <a
      className="gl-tile"
      href={timelineHash([timeline.id], 'vertical', event.id)}
      title={`${event.date.label}　${event.title}\n${timeline.title}`}
    >
      <img src={image} alt={event.title} loading="lazy" />
      <span className="gl-caption">
        <b>{event.title}</b>
        <small>
          {event.date.label}・{timeline.title}
          {uses.length > 1 && `（共 ${uses.length} 則事件）`}
        </small>
      </span>
    </a>
  );
}

/**
 * The image wall (#p=gallery): the lead image of every event in date order, under century headings.
 * A picture opens its event; the wall grows as its end scrolls into view.
 */
export function Gallery({
  timelines,
  category: initialCategory,
  era: initialEra,
  query: initialQuery,
}: {
  timelines: Timeline[];
  category?: string;
  era?: string;
  query: string;
}) {
  const gallery = useMemo(() => buildGallery(timelines), [timelines]);
  const [category, setCategory] = useState(initialCategory);
  const [era, setEra] = useState(initialEra);
  const [query, setQuery] = useState(initialQuery);
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(query).trim().toLowerCase();

  useEffect(() => {
    history.replaceState(null, '', galleryHash(category, era, query));
  }, [category, era, query]);
  // A new filter starts from the top of the wall again.
  useEffect(() => setLimit(PAGE), [category, era, q]);

  const categories = [...new Set(gallery.map(categoryOfItem))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );
  const active = category && categories.includes(category) ? category : undefined;
  const inCategory = useMemo(() => gallery.filter((g) => !active || categoryOfItem(g) === active), [gallery, active]);
  // The eras on offer follow the category, in date order.
  const eras = [...new Set(inCategory.map((g) => eraOf(g.event.date.start)))];
  const activeEra = era && eras.includes(era) ? era : undefined;
  const shown = useMemo(
    () =>
      inCategory.filter(
        (g) =>
          (!activeEra || eraOf(g.event.date.start) === activeEra) &&
          (!q || g.uses.some((u) => u.event.title.toLowerCase().includes(q) || u.timeline.title.toLowerCase().includes(q))),
      ),
    [inCategory, activeEra, q],
  );
  const page = shown.slice(0, limit);

  // Grow the wall when its end comes near the viewport.
  const endRef = useRef<HTMLDivElement>(null);
  const more = shown.length > limit;
  useEffect(() => {
    const el = endRef.current;
    if (!el || !more) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setLimit((n) => n + PAGE), { rootMargin: '800px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [more, limit]);

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          圖片牆 <small>{gallery.length} 張</small>
        </h1>
      </header>

      <main className="gl-main">
        <div className="ni-controls">
          <nav className="dash-tag-filter" aria-label="類別">
            <button type="button" className={active ? 'tag-chip' : 'tag-chip active'} onClick={() => setCategory(undefined)}>
              全部 <small>{gallery.length}</small>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className={c === active ? 'tag-chip active' : 'tag-chip'} onClick={() => setCategory(c)}>
                {c} <small>{gallery.filter((g) => categoryOfItem(g) === c).length}</small>
              </button>
            ))}
          </nav>
          <div className="ni-tools">
            <select
              className="search gl-era"
              aria-label="年代"
              value={activeEra ?? ''}
              onChange={(e) => setEra(e.target.value || undefined)}
            >
              <option value="">所有年代</option>
              {eras.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <input
              className="search"
              type="search"
              placeholder="搜尋事件或時間軸…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="empty">找不到符合的圖片。</p>
        ) : (
          [...new Set(page.map((g) => eraOf(g.event.date.start)))].map((e) => (
            <section key={e} className="gl-era-group">
              <h2>
                {e} <small>{shown.filter((g) => eraOf(g.event.date.start) === e).length}</small>
              </h2>
              <div className="gl-grid">
                {page
                  .filter((g) => eraOf(g.event.date.start) === e)
                  .map((item) => (
                    <Tile key={item.image} item={item} />
                  ))}
              </div>
            </section>
          ))
        )}
        {more && (
          <div ref={endRef} className="gl-end">
            還有 {shown.length - limit} 張，往下捲動繼續載入
          </div>
        )}
      </main>
    </div>
  );
}
