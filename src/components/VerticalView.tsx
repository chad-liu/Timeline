import type { CSSProperties } from 'react';
import type { Lane, Period, Timeline, TimelineEvent } from '../types';
import { PALETTE, readableText } from '../lib/color';
import { sanitize } from '../lib/sanitize';

type Row =
  | { kind: 'period'; start: number; period: Period; timeline: Timeline }
  | { kind: 'event'; start: number; event: TimelineEvent; timeline: Timeline };

interface Props {
  lanes: Lane[];
  overlay: boolean;
  onSelect: (event: TimelineEvent) => void;
}

/** Layout modelled on the 圖表\ history charts: coloured date arrows on the left, text on the right. */
export function VerticalView({ lanes, overlay, onSelect }: Props) {
  const rows: Row[] = lanes
    .flatMap(({ timeline, events }): Row[] => [
      ...timeline.periods.map((period): Row => ({ kind: 'period', start: period.date.start, period, timeline })),
      ...events.map((event): Row => ({ kind: 'event', start: event.date.start, event, timeline })),
    ])
    // Periods come before events that start in the same year.
    .sort((a, b) => a.start - b.start || (a.kind === 'period' ? -1 : 1) - (b.kind === 'period' ? -1 : 1));

  let eventIndex = 0;

  return (
    <div className="vview">
      <ol className="vview-list">
        {rows.map((row) => {
          if (row.kind === 'period') {
            const { period } = row;
            return (
              <li key={`p-${row.timeline.id}-${period.title}-${period.date.start}`} className="vview-period">
                <span />
                <div className="vview-period-chip" style={{ background: period.color, color: readableText(period.color) }}>
                  {period.title}
                  <small>{period.date.label}</small>
                </div>
              </li>
            );
          }

          const { event, timeline } = row;
          const color = event.color ?? (overlay ? timeline.color : PALETTE[eventIndex++ % PALETTE.length]);
          return (
            <li key={event.id} className="vview-item" style={{ '--c': color } as CSSProperties}>
              <button
                type="button"
                className="vview-label"
                style={{ background: color, color: readableText(color) }}
                onClick={() => onSelect(event)}
              >
                {event.date.label}
              </button>
              <div className="vview-body">
                <h3 className="vview-title">
                  <button type="button" className="link" onClick={() => onSelect(event)}>
                    {event.title}
                  </button>
                  {overlay && (
                    <span className="vview-source">
                      <span className="dot" style={{ background: timeline.color }} />
                      {timeline.title}
                    </span>
                  )}
                </h3>
                {event.image && <img className="vview-thumb" src={event.image} alt="" loading="lazy" />}
                <div className="md" dangerouslySetInnerHTML={{ __html: sanitize(event.html) }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
