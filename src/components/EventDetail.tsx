import { useEffect } from 'react';
import type { Timeline, TimelineEvent } from '../types';
import { sanitize } from '../lib/sanitize';

interface Props {
  event: TimelineEvent;
  timeline: Timeline;
  onClose: () => void;
}

export function EventDetail({ event, timeline, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal" role="dialog" aria-modal="true" aria-label={event.title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
          ×
        </button>
        {event.image && <img className="modal-image" src={event.image} alt="" />}
        <p className="modal-meta">
          <span className="dot" style={{ background: timeline.color }} />
          {timeline.title}・{event.date.label}
        </p>
        <h2 className="modal-title">{event.title}</h2>
        <div className="md" dangerouslySetInnerHTML={{ __html: sanitize(event.html) }} />
      </article>
    </div>
  );
}
