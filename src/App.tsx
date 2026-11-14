import { useCallback, useEffect, useMemo, useState } from 'react';
import timelines from 'virtual:timelines';
import extraPeople from 'virtual:index-people';
import topics from 'virtual:index-topics';
import type { Lane, Period, Timeline, TimelineEvent } from './types';
import { canAlignByAge, toAgeAxis } from './lib/ageAxis';
import { VIEWS, dashboardHash, lifespansHash, parseHash, searchHash, timelineHash } from './lib/route';
import type { View } from './lib/route';
import { Dashboard } from './components/Dashboard';
import { Lifespans } from './components/Lifespans';
import { NameIndex } from './components/NameIndex';
import { RelationGraph } from './components/RelationGraph';
import { YearIndex } from './components/YearIndex';
import { TopicIndex } from './components/TopicIndex';
import { Search } from './components/Search';
import { Logo } from './components/Logo';
import { RelatedTimelines } from './components/RelatedTimelines';
import { TimelinePicker } from './components/TimelinePicker';
import { HorizontalView } from './components/HorizontalView';
import { VerticalView } from './components/VerticalView';
import { GridView } from './components/GridView';
import { EventDetail } from './components/EventDetail';
import type { DetailItem, DetailNav } from './components/EventDetail';

const KNOWN_IDS = timelines.map((t) => t.id);

export function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash, KNOWN_IDS));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(location.hash, KNOWN_IDS));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route.page === 'dashboard') return <Dashboard timelines={timelines} category={route.category} tag={route.tag} />;
  if (route.page === 'lifespans') return <Lifespans key={lifespansHash(route.mode, route.selected, route.only)} timelines={timelines} mode={route.mode} selected={route.selected} only={route.only} />;
  if (route.page === 'index') return <NameIndex timelines={timelines} extras={extraPeople} />;
  if (route.page === 'topics') return <TopicIndex timelines={timelines} topics={topics} />;
  if (route.page === 'search') return <Search key={searchHash(route.query)} timelines={timelines} query={route.query} />;
  if (route.page === 'graph') return <RelationGraph timelines={timelines} extras={extraPeople} category={route.category} minWeight={route.minWeight} cross={route.cross} />;
  if (route.page === 'years') return <YearIndex timelines={timelines} extras={extraPeople} year={route.year} span={route.span} />;
  return (
    <TimelinePage
      key={timelineHash(route.ids, route.view, route.event, route.age)}
      initialView={route.view}
      initialIds={route.ids}
      initialEvent={route.event}
      initialAge={route.age}
    />
  );
}

/** The event with this id and its timeline, for opening a detail straight from the URL (`&e=`). */
function findEvent(id: string | undefined): { item: TimelineEvent; timeline: Timeline } | null {
  if (!id) return null;
  for (const timeline of timelines) {
    const item = timeline.events.find((e) => e.id === id);
    if (item) return { item, timeline };
  }
  return null;
}

interface TimelinePageProps {
  initialView: View;
  initialIds: string[];
  initialEvent?: string;
  initialAge: boolean;
}

function TimelinePage({ initialView, initialIds, initialEvent, initialAge }: TimelinePageProps) {
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [query, setQuery] = useState('');
  const [age, setAge] = useState(initialAge);
  const [detail, setDetail] = useState<{ item: DetailItem; timeline: Timeline } | null>(() => findEvent(initialEvent));

  // In-page changes replace the history entry, so Back returns to the dashboard; an open event stays in the URL.
  const detailEvent = detail && 'id' in detail.item && typeof detail.item.id === 'string' ? detail.item.id : undefined;

  // Age comparison: people overlaid on one axis counted from each one's birth. Only offered when every lane is a person.
  const picked = useMemo(() => timelines.filter((t) => selected.includes(t.id)), [selected]);
  const canAge = canAlignByAge(picked);
  const byAge = age && canAge;
  useEffect(() => {
    history.replaceState(null, '', timelineHash(selected, view, detailEvent, byAge));
  }, [view, selected, detailEvent, byAge]);

  const lanes: Lane[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return picked
      .map((t) => (byAge ? toAgeAxis(t) : t))
      .map((timeline) => ({
        timeline,
        events: q
          ? timeline.events.filter((e) => `${e.date.label} ${e.title} ${e.text}`.toLowerCase().includes(q))
          : timeline.events,
      }));
  }, [picked, byAge, query]);

  // The views may hand back items on the age axis, so the detail looks up the original (calendar-dated) event or period.
  const closeDetail = useCallback(() => setDetail(null), []);
  const selectEvent = useCallback((event: TimelineEvent) => setDetail(findEvent(event.id)), []);
  const selectPeriod = useCallback((period: Period, lane: Timeline) => {
    const timeline = timelines.find((t) => t.id === lane.id);
    const item = timeline?.periods.find((p) => p.title === period.title && p.date.label === period.date.label);
    if (timeline && item) setDetail({ item, timeline });
  }, []);

  // The displayed events in date order, as every view lists them: what the detail's previous/next steps through.
  const ordered = useMemo(() => lanes.flatMap((l) => l.events).sort((a, b) => a.date.start - b.date.start), [lanes]);
  const nav: DetailNav | undefined = useMemo(() => {
    const index = ordered.findIndex((e) => e.id === detailEvent);
    if (index < 0) return undefined;
    return { index, total: ordered.length, prev: ordered[index - 1], next: ordered[index + 1], go: selectEvent };
  }, [ordered, detailEvent, selectEvent]);
  const focus = nav && ordered[nav.index];

  // Keep the open event in sight in the vertical and grid views (the horizontal view pans by itself).
  useEffect(() => {
    if (detailEvent) document.querySelector(`[data-event-id="${CSS.escape(detailEvent)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [detailEvent, view]);

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
        {!overlay && lanes[0] && lanes[0].timeline.related.length > 0 && (
          <details className="related">
            <summary>
              延伸閱讀 <small>{lanes[0].timeline.related.length}</small>
            </summary>
            <nav aria-label="延伸閱讀">
              {lanes[0].timeline.related.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </nav>
          </details>
        )}
        {!overlay && lanes[0] && <RelatedTimelines timeline={lanes[0].timeline} timelines={timelines} extras={extraPeople} view={view} />}
        <div className="header-bottom">
          <nav className="tabs">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={v.id === view ? 'tab active' : 'tab'} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
            {canAge && (
              <button
                type="button"
                className={byAge ? 'tag-chip age-toggle active' : 'tag-chip age-toggle'}
                aria-pressed={byAge}
                title="把每個人的出生對齊，橫軸改成年齡"
                onClick={() => setAge(!byAge)}
              >
                同齡對照
              </button>
            )}
          </nav>
          <input className="search" type="search" placeholder="搜尋事件…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <main className={view === 'horizontal' ? 'main fixed' : 'main'}>
        {view === 'horizontal' && <HorizontalView lanes={lanes} overlay={overlay} axis={byAge ? 'age' : 'year'} focus={focus} onSelect={selectEvent} onSelectPeriod={selectPeriod} />}
        {view === 'vertical' && <VerticalView lanes={lanes} overlay={overlay} onSelect={selectEvent} />}
        {view === 'grid' && <GridView lanes={lanes} overlay={overlay} onSelect={selectEvent} />}
      </main>

      {detail && <EventDetail item={detail.item} timeline={detail.timeline} nav={nav} onClose={closeDetail} />}
    </div>
  );
}
