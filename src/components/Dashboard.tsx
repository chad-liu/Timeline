import { useEffect, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { formatYear } from '../lib/parseDate';
import { VIEWS, timelineHash } from '../lib/route';
import { Logo } from './Logo';

const SAMPLE = `---
title: 貝多芬
color: "#0a84ff"
cover: images/beethoven.jpg
---

# Periods
- 1770 ~ 1792 | 波昂時期

# Events
## 1770-12-17 | 受洗
![](images/beethoven-bonn.jpg)
內文支援 Markdown。`;

/** Earliest date in a timeline; for a composer this is the birth date. */
function startOf(t: Timeline): number {
  return Math.min(...t.events.map((e) => e.date.start), ...t.periods.map((p) => p.date.start));
}

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

function AddHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" role="dialog" aria-modal="true" aria-label="新增時間軸" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
          ×
        </button>
        <h2 className="modal-title">新增時間軸</h2>
        <div className="md">
          <p>時間軸以檔案管理，一個 .md 檔就是一條時間軸：</p>
          <ol>
            <li>
              在專案的 <code>Data\</code> 資料夾新增一個 <code>.md</code> 檔，圖片放在 <code>Data\images\</code>
            </li>
            <li>依下列格式填寫（完整說明見 plan.md）</li>
            <li>
              本機執行 <code>npm run dev</code> 會立即看到；<code>git push</code> 後網站自動更新
            </li>
          </ol>
          <pre>{SAMPLE}</pre>
        </div>
      </article>
    </div>
  );
}

export function Dashboard({ timelines }: { timelines: Timeline[] }) {
  const [showHelp, setShowHelp] = useState(false);

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
          <button type="button" className="btn-primary" onClick={() => setShowHelp(true)}>
            新增時間軸 +
          </button>
        </div>

        {timelines.length === 0 ? (
          <p className="empty">尚無時間軸資料：請在 Data\ 資料夾放入 .md 檔。</p>
        ) : (
          <div className="dash-grid">
            {[...timelines].sort((a, b) => Number(a.sortLast) - Number(b.sortLast) || startOf(a) - startOf(b)).map((t) => {
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
                  </div>
                  <a className="project-cover" href={href} tabIndex={-1} aria-hidden="true">
                    {cover && <img src={cover} alt="" loading="lazy" />}
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {showHelp && <AddHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
