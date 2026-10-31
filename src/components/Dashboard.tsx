import { useEffect, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { formatYear } from '../lib/parseDate';
import { INDEX_HASH, LIFESPANS_HASH, TOPICS_HASH, VIEWS, dashboardHash, graphHash, timelineHash, yearsHash } from '../lib/route';
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
  const groups = groupTimelines(timelines);
  const active = groups.find((g) => g.category === category) ?? groups[0];
  const tags = active ? tagsOf(active.timelines) : [];
  const activeTag = tag && tags.includes(tag) ? tag : undefined;
  const shown = active ? active.timelines.filter((t) => !activeTag || t.tags.includes(activeTag)) : [];

  return (
    <div className="dashboard">
      <header className="topbar">
        <a className="brand" href="#">
          <Logo />
          Liu's Timeline
        </a>
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
            <a className="btn-secondary" href={yearsHash()}>
              年代對照
            </a>
            <a className="btn-secondary" href={LIFESPANS_HASH}>
              人物年表
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
              <nav className="dash-tag-filter" aria-label="標籤">
                <a className={activeTag ? 'tag-chip' : 'tag-chip active'} href={dashboardHash(active.category)} aria-current={activeTag ? undefined : 'page'}>
                  全部 <small>{active.timelines.length}</small>
                </a>
                {tags.map((t) => (
                  <a key={t} className={t === activeTag ? 'tag-chip active' : 'tag-chip'} href={dashboardHash(active.category, t)} aria-current={t === activeTag ? 'page' : undefined}>
                    {t} <small>{active.timelines.filter((x) => x.tags.includes(t)).length}</small>
                  </a>
                ))}
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
