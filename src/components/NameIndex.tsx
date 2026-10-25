import { useMemo, useState } from 'react';
import type { Timeline } from '../types';
import { buildNameIndex } from '../lib/nameIndex';
import type { NameEntry } from '../lib/nameIndex';
import { formatYear } from '../lib/parseDate';
import { dashboardHash, timelineHash } from '../lib/route';
import { CATEGORY_ORDER, UNCATEGORIZED } from '../lib/timelineOrder';
import { Logo } from './Logo';

type Sort = 'born' | 'stroke';

const STROKE = new Intl.Collator('zh-Hant-TW-u-co-stroke');

function years(t: Timeline): string {
  return `${formatYear(Math.floor(t.born!))}–${formatYear(Math.floor(t.died!))}`;
}

function PersonCard({ entry, works, open }: { entry: NameEntry; works?: Timeline; open: boolean }) {
  const { person, name, mentions, count } = entry;
  return (
    <details className="ni-person" open={open}>
      <summary>
        <span className="ni-name" style={{ borderColor: person.color }}>
          {name}
          {person.aliases.length > 0 && <small>（{person.aliases.join('、')}）</small>}
        </span>
        <span className="ni-years">{years(person)}</span>
        <span className="ni-count">{count > 0 ? `${mentions.length} 條時間軸・${count} 則事件` : '其他時間軸未提到'}</span>
      </summary>
      <div className="ni-body">
        <p className="ni-own">
          <a href={timelineHash([person.id], 'vertical')}>{person.title}</a>
          {works && <a href={timelineHash([works.id], 'vertical')}>{works.title}</a>}
        </p>
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

/** The name index (#p=index): every person timeline and the events of other timelines that mention the person. */
export function NameIndex({ timelines }: { timelines: Timeline[] }) {
  const index = useMemo(() => buildNameIndex(timelines), [timelines]);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('born');
  const [query, setQuery] = useState('');

  const categoryOf = (t: Timeline) => t.category ?? UNCATEGORIZED;
  const categories = [...new Set(index.map((e) => categoryOf(e.person)))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );

  const q = query.trim();
  const shown = index
    .filter((e) => !category || categoryOf(e.person) === category)
    .filter((e) => !q || [e.name, ...e.person.aliases].some((n) => n.includes(q)))
    .sort((a, b) => (sort === 'born' ? a.person.born! - b.person.born! : STROKE.compare(a.name, b.name)));

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">
          人名索引 <small>{index.length} 人</small>
        </h1>
      </header>

      <main className="ni-main">
        <div className="ni-controls">
          <nav className="dash-tag-filter" aria-label="類別">
            <button type="button" className={category ? 'tag-chip' : 'tag-chip active'} onClick={() => setCategory(null)}>
              全部 <small>{index.length}</small>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className={c === category ? 'tag-chip active' : 'tag-chip'} onClick={() => setCategory(c)}>
                {c} <small>{index.filter((e) => categoryOf(e.person) === c).length}</small>
              </button>
            ))}
          </nav>
          <div className="ni-tools">
            <div className="ls-fold" role="group" aria-label="排序">
              <button type="button" className={sort === 'born' ? 'active' : undefined} onClick={() => setSort('born')}>
                依生年
              </button>
              <button type="button" className={sort === 'stroke' ? 'active' : undefined} onClick={() => setSort('stroke')}>
                依筆畫
              </button>
            </div>
            <input className="search" type="search" placeholder="搜尋人名…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="empty">找不到符合的人名。</p>
        ) : (
          shown.map((entry) => (
            <PersonCard
              key={entry.person.id}
              entry={entry}
              works={timelines.find((t) => t.follows === entry.person.id)}
              open={q.length > 0 && shown.length <= 3}
            />
          ))
        )}
      </main>
    </div>
  );
}
