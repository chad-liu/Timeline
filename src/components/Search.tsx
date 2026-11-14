import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { Timeline } from '../types';
import { searchTimelines } from '../lib/search';
import type { SearchGroup, Segment } from '../lib/search';
import { dashboardHash, searchHash, timelineHash } from '../lib/route';
import { Logo } from './Logo';

/** Events listed per timeline before the rest fold behind a button. */
const FOLD_AFTER = 8;

function Marked({ segments }: { segments: Segment[] }) {
  return <>{segments.map((s, i) => (s.hit ? <mark key={i}>{s.text}</mark> : s.text))}</>;
}

function GroupCard({ group }: { group: SearchGroup }) {
  const { timeline, hits } = group;
  const [all, setAll] = useState(false);
  const shown = all ? hits : hits.slice(0, FOLD_AFTER);
  return (
    <section className="ni-timeline sr-group">
      <h3>
        <a href={timelineHash([timeline.id], 'vertical')}>{timeline.title}</a>
        {timeline.category && <span className="ni-group">{timeline.category}</span>}
        <small>{hits.length > 0 ? `${hits.length} 則事件` : '標題符合'}</small>
      </h3>
      <ul>
        {shown.map(({ event, title, excerpt }) => (
          <li key={event.id}>
            <a href={timelineHash([timeline.id], 'vertical', event.id)}>
              <span className="ni-date">{event.date.label}</span>
              <Marked segments={title} />
            </a>
            {excerpt.length > 0 && (
              <p className="sr-excerpt">
                <Marked segments={excerpt} />
              </p>
            )}
          </li>
        ))}
      </ul>
      {hits.length > FOLD_AFTER && !all && (
        <button type="button" className="sr-more" onClick={() => setAll(true)}>
          顯示其餘 {hits.length - FOLD_AFTER} 則
        </button>
      )}
    </section>
  );
}

/** Full-text search over every timeline (#p=search&q=…): matching events grouped by timeline, each linking straight to the event. */
export function Search({ timelines, query: initialQuery }: { timelines: Timeline[]; query: string }) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const groups = useMemo(() => searchTimelines(timelines, deferred), [timelines, deferred]);
  const count = groups.reduce((n, g) => n + g.hits.length, 0);

  // Typing replaces the history entry, so Back from a result returns here with the query intact.
  useEffect(() => {
    history.replaceState(null, '', searchHash(query));
  }, [query]);

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">全站搜尋</h1>
      </header>

      <main className="ni-main">
        <input
          className="search sr-input"
          type="search"
          placeholder="搜尋所有時間軸的事件，可用空白分隔多個關鍵詞…"
          aria-label="全站搜尋"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {deferred.trim() === '' ? (
          <p className="empty">輸入關鍵詞，搜尋 {timelines.length} 條時間軸的事件標題與內文。</p>
        ) : groups.length === 0 ? (
          <p className="empty">找不到符合的事件。</p>
        ) : (
          <>
            <p className="sr-summary">
              {groups.length} 條時間軸・{count} 則事件
            </p>
            {groups.map((g) => (
              <GroupCard key={`${g.timeline.id}:${deferred}`} group={g} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
