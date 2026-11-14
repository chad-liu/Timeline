import { useEffect, useRef } from 'react';
import type { TimePoint, Timeline, TimelineEvent } from '../types';
import { sanitize } from '../lib/sanitize';
import { yearsHash } from '../lib/route';

/** Anything with a date and a markdown body: an event or a period. */
export interface DetailItem {
  title: string;
  date: TimePoint;
  html: string;
  image?: string;
}

/** Where the open event sits among the displayed ones, in date order; `prev`/`next` are missing at the ends. */
export interface DetailNav {
  index: number;
  total: number;
  prev?: TimelineEvent;
  next?: TimelineEvent;
  go: (event: TimelineEvent) => void;
}

interface Props {
  item: DetailItem;
  timeline: Timeline;
  /** Set for events (not periods): shows the previous/next buttons and enables the ← → keys. */
  nav?: DetailNav;
  onClose: () => void;
}

export function EventDetail({ item, timeline, nav, onClose }: Props) {
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Leave the arrows alone with a modifier (Alt+← is the browser's Back) or while typing in the search box.
      if (!nav || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const to = e.key === 'ArrowLeft' ? nav.prev : e.key === 'ArrowRight' ? nav.next : undefined;
      if (!to) return;
      e.preventDefault();
      nav.go(to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, nav]);

  // A new event starts from its top, whatever the previous one was scrolled to.
  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
  }, [item]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
          ×
        </button>
        {item.image && <img className="modal-image" src={item.image} alt="" />}
        <p className="modal-meta">
          <span className="dot" style={{ background: timeline.color }} />
          {timeline.title}・{item.date.label}
        </p>
        <h2 className="modal-title">{item.title}</h2>
        <div className="md" dangerouslySetInnerHTML={{ __html: sanitize(item.html) }} />
        <a className="modal-years" href={yearsHash(Math.floor(item.date.start), item.date.precision === 'century' ? 100 : 1)}>
          同時期的其他時間軸 →
        </a>
        {nav && nav.total > 1 && (
          <nav className="modal-nav" aria-label="上一則／下一則">
            <button type="button" className="modal-step" disabled={!nav.prev} onClick={() => nav.prev && nav.go(nav.prev)} title="上一則（←）">
              <span>‹ 上一則</span>
              {nav.prev && <small>{nav.prev.title}</small>}
            </button>
            <span className="modal-position">
              {nav.index + 1} / {nav.total}
            </span>
            <button type="button" className="modal-step next" disabled={!nav.next} onClick={() => nav.next && nav.go(nav.next)} title="下一則（→）">
              <span>下一則 ›</span>
              {nav.next && <small>{nav.next.title}</small>}
            </button>
          </nav>
        )}
      </article>
    </div>
  );
}
