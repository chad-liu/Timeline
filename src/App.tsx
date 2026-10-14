import { useCallback, useEffect, useMemo, useState } from 'react';
import timelines from 'virtual:timelines';
import type { Lane, TimelineEvent } from './types';
import { TimelinePicker } from './components/TimelinePicker';
import { HorizontalView } from './components/HorizontalView';
import { VerticalView } from './components/VerticalView';
import { GridView } from './components/GridView';
import { EventDetail } from './components/EventDetail';

type View = 'grid' | 'horizontal' | 'vertical';

const VIEWS: { id: View; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'horizontal', label: '橫向' },
  { id: 'vertical', label: '縱向' },
];

/** Current view and timelines are kept in the URL hash, e.g. `#v=horizontal&t=Bach|近代世界史`. */
function readHash(): { view: View; ids: string[] } {
  const params = new URLSearchParams(location.hash.slice(1));
  const view = VIEWS.find((v) => v.id === params.get('v'))?.id ?? 'horizontal';
  const ids = (params.get('t') ?? '').split('|').filter((id) => timelines.some((t) => t.id === id));
  return { view, ids: ids.length > 0 ? ids : timelines.slice(0, 1).map((t) => t.id) };
}

export function App() {
  const [initial] = useState(readHash);
  const [view, setView] = useState<View>(initial.view);
  const [selected, setSelected] = useState<string[]>(initial.ids);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    history.replaceState(null, '', '#' + new URLSearchParams({ v: view, t: selected.join('|') }).toString());
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

  if (timelines.length === 0) {
    return <p className="empty">尚無時間軸資料：請在 Data\ 資料夾放入 .md 檔（格式見 plan.md）。</p>;
  }

  const overlay = lanes.length > 1;
  const detailTimeline = detail && timelines.find((t) => t.id === detail.timelineId);

  return (
    <div className="app">
      <header className="header">
        <TimelinePicker timelines={timelines} selected={selected} onChange={setSelected} />
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
