import type { CSSProperties } from 'react';
import type { TimelineEvent } from '../types';

interface Props {
  event: TimelineEvent;
  color: string;
  style?: CSSProperties;
  onClick: () => void;
}

export function EventCard({ event, color, style, onClick }: Props) {
  return (
    <button type="button" className="event-card" style={{ ...style, borderLeftColor: color }} onClick={onClick}>
      {event.image && <img className="event-card-thumb" src={event.image} alt="" loading="lazy" draggable={false} />}
      <span className="event-card-text">
        <b>{event.date.label}</b> {event.title}
      </span>
    </button>
  );
}
