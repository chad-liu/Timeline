import { useMemo, useState } from 'react';
import type { Timeline } from '../types';
import type { ExtraPerson } from '../lib/extraPeople';
import { buildNameIndex } from '../lib/nameIndex';
import type { NameEntry } from '../lib/nameIndex';
import { dashboardHash, timelineHash } from '../lib/route';
import { CATEGORY_ORDER } from '../lib/timelineOrder';
import { Logo } from './Logo';

type Sort = 'born' | 'stroke';

const STROKE = new Intl.Collator('zh-Hant-TW-u-co-stroke');

function PersonCard({ entry, open }: { entry: NameEntry; open: boolean }) {
  const { name, aliases, years, color, group, note, links, mentions, count } = entry;
  return (
    <details className="ni-person" open={open}>
      <summary>
        <span className="ni-name" style={{ borderColor: color }}>
          {name}
          {aliases.length > 0 && <small>（{aliases.join('、')}）</small>}
        </span>
        <span className="ni-years">{years}</span>
        {group && <span className="ni-group">{group}</span>}
        <span className="ni-count">{count > 0 ? `${mentions.length} 條時間軸・${count} 則事件` : '其他時間軸未提到'}</span>
      </summary>
      <div className="ni-body">
        {(note || links.length > 0) && (
          <p className="ni-own">
            {note && <span className="ni-note">{note}</span>}
            {links.map((t) => (
              <a key={t.id} href={timelineHash([t.id], 'vertical')}>
                {t.title}
              </a>
            ))}
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

/** The name index (#p=index): every person timeline and supplementary person, with the events that mention them. */
export function NameIndex({ timelines, extras }: { timelines: Timeline[]; extras: ExtraPerson[] }) {
  const index = useMemo(() => buildNameIndex(timelines, extras), [timelines, extras]);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('born');
  const [query, setQuery] = useState('');

  const categories = [...new Set(index.map((e) => e.category))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );

  const q = query.trim();
  const shown = index
    .filter((e) => !category || e.category === category)
    .filter((e) => !q || [e.name, ...e.aliases, e.group ?? ''].some((n) => n.includes(q)))
    .sort((a, b) => (sort === 'born' ? a.born - b.born : STROKE.compare(a.name, b.name)));

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
                {c} <small>{index.filter((e) => e.category === c).length}</small>
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
            <input className="search" type="search" placeholder="搜尋人名或家族…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="empty">找不到符合的人名。</p>
        ) : (
          shown.map((entry) => <PersonCard key={entry.key} entry={entry} open={q.length > 0 && shown.length <= 3} />)
        )}
      </main>
    </div>
  );
}
