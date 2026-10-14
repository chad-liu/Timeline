import { useEffect, useRef, useState } from 'react';
import type { Timeline } from '../types';

interface Props {
  timelines: Timeline[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

/** Title dropdown: click a name to switch timelines, tick checkboxes to overlay several. */
export function TimelinePicker({ timelines, selected, onChange }: Props) {
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

  const current = timelines.filter((t) => selected.includes(t.id));
  const title = current.length === 1 ? current[0].title : `${current.length} 條時間軸比較`;

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    if (next.length > 0) onChange(next);
  };

  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <h1>{title}</h1>
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="picker-menu">
          <p className="picker-hint">點名稱切換；勾選可疊加比較</p>
          {timelines.map((t) => (
            <div key={t.id} className="picker-row">
              <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} aria-label={`疊加 ${t.title}`} />
              <button
                type="button"
                className="picker-name"
                onClick={() => {
                  onChange([t.id]);
                  setOpen(false);
                }}
              >
                <span className="dot" style={{ background: t.color }} />
                {t.title}
                <small>{t.events.length} 個事件</small>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
