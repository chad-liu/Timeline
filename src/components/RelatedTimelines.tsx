import { useMemo } from 'react';
import type { Timeline } from '../types';
import type { ExtraPerson } from '../lib/extraPeople';
import { buildNameIndex } from '../lib/nameIndex';
import { mentionedTimelines, seeAlso } from '../lib/relatedTimelines';
import { buildRelationGraph } from '../lib/relationGraph';
import { timelineHash } from '../lib/route';
import type { View } from '../lib/route';

/**
 * Links from one timeline to others, across categories: those named by `see:` (either side), and for a person
 * the people linked in the relation graph (found by name, so only a hint).
 */
export function RelatedTimelines({ timeline, timelines, extras, view }: { timeline: Timeline; timelines: Timeline[]; extras: ExtraPerson[]; view: View }) {
  const manual = useMemo(() => seeAlso(timeline, timelines), [timeline, timelines]);
  const mentioned = useMemo(() => {
    const index = buildNameIndex(timelines, extras);
    return mentionedTimelines(timeline, index, buildRelationGraph(index), new Set(manual.map((t) => t.id)));
  }, [timeline, timelines, extras, manual]);

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
      {mentioned.length > 0 && (
        <>
          <p className="related-hint">內文提到的人物（依姓名比對）</p>
          <nav aria-label="內文提到的人物">
            {mentioned.map(({ timeline: t, weight }) => (
              <a key={t.id} href={timelineHash([t.id], view)} title={`${weight} 則事件`}>
                {t.title}
                <small>{weight}</small>
              </a>
            ))}
          </nav>
        </>
      )}
    </details>
  );
}
