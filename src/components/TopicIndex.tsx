import { useMemo, useState } from 'react';
import type { Timeline } from '../types';
import { buildTopicIndex } from '../lib/topicIndex';
import type { Topic, TopicEntry } from '../lib/topicIndex';
import { dashboardHash, timelineHash } from '../lib/route';
import { Logo } from './Logo';

function TopicCard({ entry, open }: { entry: TopicEntry; open: boolean }) {
  const { name, note, timeline, mentions, count } = entry;
  return (
    <details className="ni-person" open={open}>
      <summary>
        <span className="ni-name">{name}</span>
        <span className="ni-years">{note}</span>
        <span className="ni-count">{count > 0 ? `${mentions.length} 條時間軸・${count} 則事件` : '其他時間軸未提到'}</span>
      </summary>
      <div className="ni-body">
        {timeline && (
          <p className="ni-own">
            <span className="ni-note">專屬時間軸</span>
            <a href={timelineHash([timeline.id], 'vertical')}>
              {timeline.title}（{timeline.events.length} 則事件）
            </a>
          </p>
        )}
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
    </details>
  );
}

/** The topic index (#p=topics): each topic of Data\index\topics.md with the events of every timeline that touch it. */
export function TopicIndex({ timelines, topics }: { timelines: Timeline[]; topics: Topic[] }) {
  const index = useMemo(() => buildTopicIndex(timelines, topics), [timelines, topics]);
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const groups = [...new Set(index.map((e) => e.group))];
  const q = query.trim();
  const shown = index.filter((e) => !group || e.group === group).filter((e) => !q || e.name.includes(q) || e.note.includes(q));

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          主題索引 <small>{index.length} 個主題</small>
        </h1>
      </header>

      <main className="ni-main">
        <div className="ni-controls">
          <nav className="dash-tag-filter" aria-label="主題分類">
            <button type="button" className={group ? 'tag-chip' : 'tag-chip active'} onClick={() => setGroup(null)}>
              全部 <small>{index.length}</small>
            </button>
            {groups.map((g) => (
              <button key={g} type="button" className={g === group ? 'tag-chip active' : 'tag-chip'} onClick={() => setGroup(g)}>
                {g} <small>{index.filter((e) => e.group === g).length}</small>
              </button>
            ))}
          </nav>
          <div className="ni-tools">
            <input className="search" type="search" placeholder="搜尋主題…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="empty">找不到符合的主題。</p>
        ) : (
          groups
            .filter((g) => shown.some((e) => e.group === g))
            .map((g) => (
              <section key={g} className="ti-group">
                <h2>{g}</h2>
                {shown
                  .filter((e) => e.group === g)
                  .map((entry) => (
                    <TopicCard key={entry.name} entry={entry} open={q.length > 0 && shown.length <= 3} />
                  ))}
              </section>
            ))
        )}
      </main>
    </div>
  );
}
