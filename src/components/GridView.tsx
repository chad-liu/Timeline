import type { Lane, TimelineEvent } from '../types';
import { PALETTE } from '../lib/color';

interface Props {
  lanes: Lane[];
  overlay: boolean;
  onSelect: (event: TimelineEvent) => void;
}

export function GridView({ lanes, overlay, onSelect }: Props) {
  const items = lanes
    .flatMap(({ timeline, events }) => events.map((event) => ({ event, timeline })))
    .sort((a, b) => a.event.date.start - b.event.date.start);

  return (
    <div className="gview">
      {items.map(({ event, timeline }, i) => (
        <button
          type="button"
          key={event.id}
          className="gcard"
          style={{ borderTopColor: event.color ?? (overlay ? timeline.color : PALETTE[i % PALETTE.length]) }}
          onClick={() => onSelect(event)}
        >
          {event.image && <img className="gcard-image" src={event.image} alt="" loading="lazy" />}
          <span className="gcard-body">
            <span className="gcard-date">{event.date.label}</span>
            <span className="gcard-title">{event.title}</span>
            {event.text && <span className="gcard-excerpt">{event.text}</span>}
            {overlay && (
              <span className="gcard-source">
                <span className="dot" style={{ background: timeline.color }} />
                {timeline.title}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
