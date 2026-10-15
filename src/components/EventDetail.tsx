import { useEffect } from 'react';
import type { TimePoint, Timeline } from '../types';
import { sanitize } from '../lib/sanitize';

/** Anything with a date and a markdown body: an event or a period. */
export interface DetailItem {
  title: string;
  date: TimePoint;
  html: string;
  image?: string;
}

interface Props {
  item: DetailItem;
  timeline: Timeline;
  onClose: () => void;
}

export function EventDetail({ item, timeline, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.stopPropagation()}>
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
      </article>
    </div>
  );
}
