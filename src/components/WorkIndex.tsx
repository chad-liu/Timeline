import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Timeline } from '../types';
import { buildWorkIndex } from '../lib/workIndex';
import type { WorkEntry } from '../lib/workIndex';
import { dashboardHash, timelineHash, worksHash } from '../lib/route';
import type { WorkSort } from '../lib/route';
import { CATEGORY_ORDER, UNCATEGORIZED } from '../lib/timelineOrder';
import { Logo } from './Logo';

/** Rows drawn at first; the rest wait behind a button, since the whole index runs to a few thousand titles. */
const PAGE = 300;

const SORTS: { id: WorkSort; label: string; title: string }[] = [
  { id: 'year', label: '依年份', title: '依作品在主要時間軸最早出現的年份' },
  { id: 'author', label: '依時間軸', title: '依最常提到它的時間軸分組，通常就是作者' },
  { id: 'count', label: '依提及數', title: '被最多事件提到的排前面' },
];

const categoryOf = (work: WorkEntry) => work.main.category ?? UNCATEGORIZED;

function WorkCard({ work, showMain }: { work: WorkEntry; showMain: boolean }) {
  // The events are only drawn once the row is opened.
  const [open, setOpen] = useState(false);
  const { title, main, first, mentions, count } = work;
  return (
    <details className="ni-person" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="ni-name">《{title}》</span>
        <span className="ni-years">
          {first.date.label}
          {showMain && `・${main.title}`}
        </span>
        <span className="ni-count">{mentions.length > 1 ? `${mentions.length} 條時間軸・${count} 則事件` : `${count} 則事件`}</span>
      </summary>
      {open && (
        <div className="ni-body">
          {mentions.map(({ timeline, events }) => (
            <section key={timeline.id} className="ni-timeline">
              <h3>
                <a href={timelineHash([timeline.id], 'vertical')}>{timeline.title}</a> <small>{events.length}</small>
              </h3>
              <ul>
                {events.map((e) => (
                  <li key={e.id}>
                    <a href={timelineHash([timeline.id], 'vertical', e.id)}>
                      <span className="ni-date">{e.date.label}</span>
                      {e.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </details>
  );
}

/**
 * The works index (#p=works): every title written in book-title marks 《…》 in the events, with the events that mention it.
 * A work is filed under the timeline that mentions it most, which is usually its author's.
 */
export function WorkIndex({
  timelines,
  category: initialCategory,
  sort: initialSort,
  query: initialQuery,
}: {
  timelines: Timeline[];
  category?: string;
  sort: WorkSort;
  query: string;
}) {
  const index = useMemo(() => buildWorkIndex(timelines), [timelines]);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [query, setQuery] = useState(initialQuery);
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(query).trim().toLowerCase();

  useEffect(() => {
    history.replaceState(null, '', worksHash(category, sort, query));
  }, [category, sort, query]);
  // A new filter starts from the top of the list again.
  useEffect(() => setLimit(PAGE), [category, sort, q]);

  const categories = [...new Set(index.map(categoryOf))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );
  const active = category && categories.includes(category) ? category : undefined;
  const shown = useMemo(() => {
    const list = index.filter(
      (w) => (!active || categoryOf(w) === active) && (!q || w.title.toLowerCase().includes(q) || w.main.title.toLowerCase().includes(q)),
    );
    if (sort === 'count') return [...list].sort((a, b) => b.count - a.count || b.mentions.length - a.mentions.length);
    // Timelines keep their dashboard order, and each one's works their date order.
    if (sort === 'author') return [...list].sort((a, b) => timelines.indexOf(a.main) - timelines.indexOf(b.main));
    return list;
  }, [index, timelines, active, sort, q]);
  const page = shown.slice(0, limit);

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          作品索引 <small>{index.length} 個《》標題</small>
        </h1>
      </header>

      <main className="ni-main">
        <div className="ni-controls">
          <nav className="dash-tag-filter" aria-label="類別">
            <button type="button" className={active ? 'tag-chip' : 'tag-chip active'} onClick={() => setCategory(undefined)}>
              全部 <small>{index.length}</small>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className={c === active ? 'tag-chip active' : 'tag-chip'} onClick={() => setCategory(c)}>
                {c} <small>{index.filter((w) => categoryOf(w) === c).length}</small>
              </button>
            ))}
          </nav>
          <div className="ni-tools">
            <div className="ls-fold" role="group" aria-label="排序">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={s.id === sort ? 'active' : undefined}
                  title={s.title}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <input
              className="search"
              type="search"
              placeholder="搜尋作品或時間軸…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="wi-note">
          自動收錄事件標題與內文裡用《》標示的名稱，除了樂曲、著作與畫作，也包含條約與法典。每一筆歸在最常提到它的時間軸底下，通常就是作者；同名的作品（如《安魂曲》）合成一筆，展開後依時間軸區分。
        </p>

        {shown.length === 0 ? (
          <p className="empty">找不到符合的作品。</p>
        ) : sort === 'author' ? (
          [...new Set(page.map((w) => w.main))].map((main) => (
            <section key={main.id} className="ti-group">
              <h2>
                <a href={timelineHash([main.id], 'vertical')}>{main.title}</a> <small>{shown.filter((w) => w.main === main).length}</small>
              </h2>
              {page
                .filter((w) => w.main === main)
                .map((work) => (
                  <WorkCard key={work.title} work={work} showMain={false} />
                ))}
            </section>
          ))
        ) : (
          page.map((work) => <WorkCard key={work.title} work={work} showMain />)
        )}
        {shown.length > limit && (
          <button type="button" className="btn-secondary wi-more" onClick={() => setLimit(limit + PAGE)}>
            再顯示 {Math.min(PAGE, shown.length - limit)} 筆（還有 {shown.length - limit} 筆）
          </button>
        )}
      </main>
    </div>
  );
}
