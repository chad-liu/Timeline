import { useEffect, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { formatYear } from '../lib/parseDate';
import { INDEX_HASH, LIFESPANS_HASH, TOPICS_HASH, VIEWS, dashboardHash, galleryHash, graphHash, mapHash, searchHash, timelineHash, worksHash, yearsHash } from '../lib/route';
import { groupTimelines, tagsOf } from '../lib/timelineOrder';
import { Logo } from './Logo';

function yearRange(t: Timeline): string {
  const dates = [...t.events.map((e) => e.date), ...t.periods.map((p) => p.date)];
  const min = Math.min(...dates.map((d) => d.start));
  const max = Math.max(...dates.map((d) => d.end ?? d.start));
  const from = formatYear(Math.floor(min));
  const to = formatYear(Math.floor(max));
  return from === to ? from : `${from} – ${to}`;
}

function ProjectMenu({ timeline }: { timeline: Timeline }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="project-menu" ref={ref}>
      <button type="button" className="project-menu-button" onClick={() => setOpen(!open)} aria-label={`${timeline.title} 選單`} aria-expanded={open}>
        •••
      </button>
      {open && (
        <div className="project-menu-list">
          {VIEWS.map((v) => (
            <a key={v.id} href={timelineHash([timeline.id], v.id)}>
              以{v.label}檢視開啟
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ timelines, category, tag }: { timelines: Timeline[]; category?: string; tag?: string }) {
  const [query, setQuery] = useState('');
  const groups = groupTimelines(timelines);
  const active = groups.find((g) => g.category === category) ?? groups[0];
  const tags = active ? tagsOf(active.timelines) : [];
  // Nothing checked means every tag; several checked means timelines having any of them.
  const selectedTags = (tag ?? '').split('|').filter((t) => tags.includes(t));
  const shown = active ? active.timelines.filter((t) => selectedTags.length === 0 || t.tags.some((x) => selectedTags.includes(x))) : [];
  const toggleTag = (name: string) => {
    const next = selectedTags.includes(name) ? selectedTags.filter((x) => x !== name) : [...selectedTags, name];
    location.hash = dashboardHash(active.category, next);
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <a className="brand" href="#">
          <Logo />
          Liu's Timeline
        </a>
        <form
          className="topbar-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            location.hash = searchHash(query);
          }}
        >
          <input className="search" type="search" placeholder="搜尋所有時間軸…" aria-label="全站搜尋" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
      </header>

      <main className="dash-main">
        <div className="dash-head">
          <h1>
            我的時間軸 <small>{timelines.length}</small>
          </h1>
          <div className="dash-actions">
            <a className="btn-secondary" href={INDEX_HASH}>
              人名索引
            </a>
            <a className="btn-secondary" href={graphHash()}>
              人物關係圖
            </a>
            <a className="btn-secondary" href={TOPICS_HASH}>
              主題索引
            </a>
            <a className="btn-secondary" href={worksHash()}>
              作品索引
            </a>
            <a className="btn-secondary" href={yearsHash()}>
              年代對照
            </a>
            <a className="btn-secondary" href={LIFESPANS_HASH}>
              人物年表
            </a>
            <a className="btn-secondary" href={mapHash()}>
              地圖
            </a>
            <a className="btn-secondary" href={galleryHash()}>
              圖片牆
            </a>
          </div>
        </div>

        {timelines.length === 0 ? (
          <p className="empty">尚無時間軸資料：請在 Data\ 資料夾放入 .md 檔。</p>
        ) : (
          <>
            <nav className="tabs dash-tabs" aria-label="類別">
              {groups.map((g) => (
                <a key={g.category} className={g === active ? 'tab active' : 'tab'} href={dashboardHash(g.category)} aria-current={g === active ? 'page' : undefined}>
                  {g.category} <small>{g.timelines.length}</small>
                </a>
              ))}
            </nav>
            {tags.length > 0 && (
              <nav className="dash-tag-filter" aria-label="標籤（不勾選＝全部）">
                {tags.map((t) => {
                  const on = selectedTags.includes(t);
                  return (
                    <label key={t} className={on ? 'tag-chip tag-check active' : 'tag-chip tag-check'}>
                      <input type="checkbox" checked={on} onChange={() => toggleTag(t)} />
                      {t} <small>{active.timelines.filter((x) => x.tags.includes(t)).length}</small>
                    </label>
                  );
                })}
              </nav>
            )}
            <section className="dash-group">
              <div className="dash-grid">
                {shown.map((t) => {
                  const href = timelineHash([t.id]);
                  const cover = t.cover ?? t.events.find((e) => e.image)?.image;
                  return (
                    <article key={t.id} className="project-card" style={{ borderTopColor: t.color }}>
                      <div className="project-head">
                        <h2>
                          <a href={href}>{t.title}</a>
                        </h2>
                        <ProjectMenu timeline={t} />
                      </div>
                      <div className="project-tags">
                        <span className="tag">{yearRange(t)}</span>
                        <span className="tag tag-green">{t.events.length} 個事件</span>
                        {t.tags.map((x) => (
                          <a key={x} className="tag tag-label" href={dashboardHash(t.category, x)}>
                            {x}
                          </a>
                        ))}
                      </div>
                      <a className="project-cover" href={href} tabIndex={-1} aria-hidden="true">
                        {cover && <img src={cover} alt="" loading="lazy" />}
                      </a>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

    </div>
  );
}
