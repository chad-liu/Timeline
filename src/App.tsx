import { useCallback, useEffect, useMemo, useState } from 'react';
import timelines from 'virtual:timelines';
import type { Lane, Period, Timeline, TimelineEvent } from './types';
import { VIEWS, dashboardHash, parseHash, timelineHash } from './lib/route';
import type { View } from './lib/route';
import { Dashboard } from './components/Dashboard';
import { Lifespans } from './components/Lifespans';
import { Logo } from './components/Logo';
import { TimelinePicker } from './components/TimelinePicker';
import { HorizontalView } from './components/HorizontalView';
import { VerticalView } from './components/VerticalView';
import { GridView } from './components/GridView';
import { EventDetail } from './components/EventDetail';
import type { DetailItem } from './components/EventDetail';

const KNOWN_IDS = timelines.map((t) => t.id);

export function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash, KNOWN_IDS));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(location.hash, KNOWN_IDS));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route.page === 'dashboard') return <Dashboard timelines={timelines} category={route.category} tag={route.tag} />;
  if (route.page === 'lifespans') return <Lifespans timelines={timelines} />;
  return <TimelinePage key={timelineHash(route.ids, route.view)} initialView={route.view} initialIds={route.ids} />;
}

function TimelinePage({ initialView, initialIds }: { initialView: View; initialIds: string[] }) {
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<{ item: DetailItem; timeline: Timeline } | null>(null);

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
  const selectEvent = useCallback((event: TimelineEvent) => {
    const timeline = timelines.find((t) => t.id === event.timelineId);
    if (timeline) setDetail({ item: event, timeline });
  }, []);
  const selectPeriod = useCallback((period: Period, timeline: Timeline) => setDetail({ item: period, timeline }), []);

  const overlay = lanes.length > 1;
  const homeHash = dashboardHash(lanes[0]?.timeline.category);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <a className="home-link" href={homeHash} title="回到 Dashboard" aria-label="回到 Dashboard">
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
        {view === 'horizontal' && <HorizontalView lanes={lanes} overlay={overlay} onSelect={selectEvent} onSelectPeriod={selectPeriod} />}
        {view === 'vertical' && <VerticalView lanes={lanes} overlay={overlay} onSelect={selectEvent} />}
        {view === 'grid' && <GridView lanes={lanes} overlay={overlay} onSelect={selectEvent} />}
      </main>

      {detail && <EventDetail item={detail.item} timeline={detail.timeline} onClose={closeDetail} />}
    </div>
  );
}
