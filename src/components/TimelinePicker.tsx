import { useEffect, useRef, useState } from 'react';
import type { Timeline } from '../types';
import { groupByTag, groupTimelines } from '../lib/timelineOrder';

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

  const groups = groupTimelines(timelines);
  // Category groups and tag subgroups start collapsed unless they hold a selected timeline.
  // Keys are a category name, or `category/tag` for a tag subgroup.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const holdsSelected = (list: Timeline[]) => list.some((t) => selected.includes(t.id));
    const keys = groups.flatMap((g) => [g, ...groupByTag(g.timelines).map((sub) => ({ category: `${g.category}/${sub.tag}`, timelines: sub.timelines }))]);
    return new Set(keys.filter((k) => !holdsSelected(k.timelines)).map((k) => k.category));
  });
  const toggleGroup = (key: string) => {
    const next = new Set(collapsed);
    if (!next.delete(key)) next.add(key);
    setCollapsed(next);
  };

  const current = timelines.filter((t) => selected.includes(t.id));
  const title = current.length === 1 ? current[0].title : `${current.length} 條時間軸比較`;

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    if (next.length > 0) onChange(next);
  };

  const renderRow = (t: Timeline, key: string) => (
    <div key={key} className="picker-row">
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
  );

  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <h1>{title}</h1>
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="picker-menu">
          <p className="picker-hint">點名稱切換；勾選可疊加比較</p>
          {groups.map((group) => (
            <div key={group.category} className="picker-group" role="group" aria-label={group.category}>
              <button type="button" className="picker-group-title" onClick={() => toggleGroup(group.category)} aria-expanded={!collapsed.has(group.category)}>
                <span className="picker-group-chev">{collapsed.has(group.category) ? '▸' : '▾'}</span>
                {group.category} <small>{group.timelines.length}</small>
              </button>
              {!collapsed.has(group.category) &&
                groupByTag(group.timelines).map((sub) => {
                  const key = `${group.category}/${sub.tag}`;
                  if (!sub.tag) return sub.timelines.map((t) => renderRow(t, t.id));
                  return (
                    <div key={key} className="picker-subgroup" role="group" aria-label={sub.tag}>
                      <button type="button" className="picker-subgroup-title" onClick={() => toggleGroup(key)} aria-expanded={!collapsed.has(key)}>
                        <span className="picker-group-chev">{collapsed.has(key) ? '▸' : '▾'}</span>
                        {sub.tag} <small>{sub.timelines.length}</small>
                      </button>
                      {!collapsed.has(key) && sub.timelines.map((t) => renderRow(t, `${key}/${t.id}`))}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
