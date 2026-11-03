import { useMemo } from 'react';
import type { Timeline } from '../types';
import type { ExtraPerson } from '../lib/extraPeople';
import { buildNameIndex } from '../lib/nameIndex';
import { mentionedTimelines, seeAlso } from '../lib/relatedTimelines';
import { buildRelationGraph } from '../lib/relationGraph';
import { timelineHash } from '../lib/route';
import type { View } from '../lib/route';

/**
 * Links from one timeline to others, across categories: those named by `see:` (either side); for a person the people linked
 * in the relation graph and the wars or periods its events mention; for a war or period the people whose events mention it
 * (all found by name, so only a hint).
 */
export function RelatedTimelines({ timeline, timelines, extras, view }: { timeline: Timeline; timelines: Timeline[]; extras: ExtraPerson[]; view: View }) {
  const manual = useMemo(() => seeAlso(timeline, timelines), [timeline, timelines]);
  const mentioned = useMemo(() => {
    const index = buildNameIndex(timelines, extras);
    return mentionedTimelines(timeline, index, buildRelationGraph(index, timelines), new Set(manual.map((t) => t.id)), timelines);
  }, [timeline, timelines, extras, manual]);

  const people = mentioned.filter((m) => m.kind === 'person');
  const topics = mentioned.filter((m) => m.kind === 'topic');
  const mentioners = mentioned.filter((m) => m.kind === 'mentioner');
  const hints = [
    { items: people, label: '內文提到的人物（依姓名比對）' },
    { items: topics, label: '內文提到的戰爭、時代等主題（依名稱比對）' },
    { items: mentioners, label: '內文提到這條時間軸的人物（依名稱比對）' },
  ].filter((h) => h.items.length > 0);

  if (manual.length === 0 && mentioned.length === 0) return null;
  return (
    <details className="related internal" open={manual.length > 0}>
      <summary>
        相關時間軸 <small>{manual.length + mentioned.length}</small>
      </summary>
      {manual.length > 0 && (
        <nav aria-label="相關時間軸">
          {manual.map((t) => (
            <a key={t.id} href={timelineHash([t.id], view)} title={t.category}>
              {t.title}
              {t.category && <small>{t.category}</small>}
            </a>
          ))}
          <a className="compare" href={timelineHash([timeline.id, ...manual.map((t) => t.id)], 'horizontal')}>
            疊加比較
          </a>
        </nav>
      )}
      {hints.map(({ items, label }) => (
        <div key={label}>
          <p className="related-hint">{label}</p>
          <nav aria-label={label}>
            {items.map(({ timeline: t, weight }) => (
              <a key={t.id} href={timelineHash([t.id], view)} title={`${weight} 則事件`}>
                {t.title}
                <small>{weight}</small>
              </a>
            ))}
          </nav>
        </div>
      ))}
    </details>
  );
}
