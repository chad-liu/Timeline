import { useCallback, useEffect, useMemo, useState } from 'react';
import timelines from 'virtual:timelines';
import type { Lane, TimelineEvent } from './types';
import { VIEWS, parseHash, timelineHash } from './lib/route';
import type { View } from './lib/route';
import { Dashboard } from './components/Dashboard';
import { Logo } from './components/Logo';
import { TimelinePicker } from './components/TimelinePicker';
import { HorizontalView } from './components/HorizontalView';
import { VerticalView } from './components/VerticalView';
import { GridView } from './components/GridView';
import { EventDetail } from './components/EventDetail';

const KNOWN_IDS = timelines.map((t) => t.id);

export function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash, KNOWN_IDS));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(location.hash, KNOWN_IDS));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route.page === 'dashboard') return <Dashboard timelines={timelines} />;
  return <TimelinePage key={timelineHash(route.ids, route.view)} initialView={route.view} initialIds={route.ids} />;
}

function TimelinePage({ initialView, initialIds }: { initialView: View; initialIds: string[] }) {
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<TimelineEvent | null>(null);

  // In-page changes replace the history entry, so Back returns to the dashboard.
  useEffect(() => {
    history.replaceState(null, '', timelineHash(selected, view));
  }, [view, selected]);

  const lanes: Lane[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return timelines
      .filter((t) => selected.includes(t.id))
      .map((timeline) => ({
        timeline,
        events: q
          ? timeline.events.filter((e) => `${e.date.label} ${e.title} ${e.text}`.toLowerCase().includes(q))
          : timeline.events,
      }));
  }, [selected, query]);

  const closeDetail = useCallback(() => setDetail(null), []);

  const overlay = lanes.length > 1;
  const detailTimeline = detail && timelines.find((t) => t.id === detail.timelineId);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <a className="home-link" href="#" title="回到 Dashboard" aria-label="回到 Dashboard">
            <Logo />
          </a>
          <TimelinePicker timelines={timelines} selected={selected} onChange={setSelected} />
        </div>
        {!overlay && lanes[0]?.timeline.description && <p className="description">{lanes[0].timeline.description}</p>}
        <div className="header-bottom">
          <nav className="tabs">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={v.id === view ? 'tab active' : 'tab'} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </nav>
          <input className="search" type="search" placeholder="搜尋事件…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <main className={view === 'horizontal' ? 'main fixed' : 'main'}>
        {view === 'horizontal' && <HorizontalView lanes={lanes} overlay={overlay} onSelect={setDetail} />}
        {view === 'vertical' && <VerticalView lanes={lanes} overlay={overlay} onSelect={setDetail} />}
        {view === 'grid' && <GridView lanes={lanes} overlay={overlay} onSelect={setDetail} />}
      </main>

      {detail && detailTimeline && <EventDetail event={detail} timeline={detailTimeline} onClose={closeDetail} />}
    </div>
  );
}
