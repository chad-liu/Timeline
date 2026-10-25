import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Timeline } from '../types';
import type { ExtraPerson } from '../lib/extraPeople';
import { formatYear } from '../lib/parseDate';
import { dashboardHash, timelineHash, yearsHash } from '../lib/route';
import { groupTimelines } from '../lib/timelineOrder';
import { eventsInSlice, livingInSlice, sliceLabel, sliceOf } from '../lib/yearIndex';
import type { Span } from '../lib/yearIndex';
import { Logo } from './Logo';

const SPANS: { span: Span; label: string }[] = [
  { span: 1, label: '單年' },
  { span: 10, label: '十年' },
  { span: 100, label: '百年' },
];

/** 「1789」、「-221」、「前221」、「西元前221年」 → a year, or null. */
function parseYearInput(text: string): number | null {
  const m = text.trim().match(/^(西元)?(前|-)?\s*(\d{1,5})\s*年?$/);
  if (!m) return null;
  return m[2] ? -Number(m[3]) : Number(m[3]);
}

/** The year comparison page (#p=years): what every timeline has in one year, decade or century, and who was alive then. */
export function YearIndex({ timelines, extras, year, span }: { timelines: Timeline[]; extras: ExtraPerson[]; year: number; span: Span }) {
  const { from, to } = sliceOf(year, span);
  const slices = useMemo(() => eventsInSlice(timelines, from, to), [timelines, from, to]);
  const living = useMemo(() => livingInSlice(timelines, extras, from, to), [timelines, extras, from, to]);
  const [category, setCategory] = useState<string | null>(null);
  const [input, setInput] = useState(formatYear(year));

  useEffect(() => setInput(formatYear(year)), [year]);

  const groups = useMemo(() => {
    const byId = new Map(slices.map((s) => [s.timeline.id, s]));
    return groupTimelines(slices.map((s) => s.timeline)).map((g) => ({
      category: g.category,
      slices: g.timelines.map((t) => byId.get(t.id)!),
    }));
  }, [slices]);
  const shown = groups.filter((g) => !category || g.category === category);
  const eventCount = slices.reduce((n, s) => n + s.events.length, 0);

  const go = (y: number, s: Span = span) => {
    location.hash = yearsHash(y, s);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const y = parseYearInput(input);
    if (y === null) setInput(formatYear(year));
    else go(y);
  };

  return (
    <div className="name-index">
      <header className="topbar ls-topbar">
        <a className="brand" href={dashboardHash()}>
          <Logo />
          Liu's Timeline
        </a>
        <h1 className="ls-title">年代對照</h1>
      </header>

      <main className="ni-main">
        <div className="yi-picker">
          <button type="button" className="btn-secondary" onClick={() => go(from - span)} aria-label="上一段">
            ‹
          </button>
          <form onSubmit={submit}>
            <input
              className="search yi-year"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={submit}
              aria-label="年份（西元前寫成「前221」）"
            />
          </form>
          <button type="button" className="btn-secondary" onClick={() => go(from + span)} aria-label="下一段">
            ›
          </button>
          <div className="ls-fold" role="group" aria-label="範圍">
            {SPANS.map((s) => (
              <button key={s.span} type="button" className={s.span === span ? 'active' : undefined} onClick={() => go(year, s.span)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <h2 className="yi-heading">
          {sliceLabel(from, span)}
          <small>
            {slices.length} 條時間軸・{eventCount} 則事件
          </small>
        </h2>

        {living.length > 0 && (
          <section className="yi-living">
            <h3>
              同時在世 <small>{living.length} 人</small>
            </h3>
            <p>
              {living.map((p) =>
                p.timeline ? (
                  <a key={p.key} href={timelineHash([p.timeline.id], 'vertical')}>
                    {p.name}
                    <small>{p.age}</small>
                  </a>
                ) : (
                  <span key={p.key}>
                    {p.name}
                    <small>{p.age}</small>
                  </span>
                ),
              )}
            </p>
          </section>
        )}

        {groups.length > 1 && (
          <nav className="dash-tag-filter yi-filter" aria-label="類別">
            <button type="button" className={category ? 'tag-chip' : 'tag-chip active'} onClick={() => setCategory(null)}>
              全部 <small>{slices.length}</small>
            </button>
            {groups.map((g) => (
              <button
                key={g.category}
                type="button"
                className={g.category === category ? 'tag-chip active' : 'tag-chip'}
                onClick={() => setCategory(g.category)}
              >
                {g.category} <small>{g.slices.length}</small>
              </button>
            ))}
          </nav>
        )}

        {shown.length === 0 ? (
          <p className="empty">這段期間沒有任何事件。</p>
        ) : (
          shown.map((g) => (
            <section key={g.category} className="yi-category">
              <h3>{g.category}</h3>
              {g.slices.map(({ timeline, periods, events }) => (
                <section key={timeline.id} className="ni-timeline">
                  <h3>
                    <a href={timelineHash([timeline.id], 'vertical')} style={{ borderColor: timeline.color }}>
                      {timeline.title}
                    </a>{' '}
                    {periods.length > 0 && <small>{periods.map((p) => p.title).join('・')}</small>}
                  </h3>
                  <ul>
                    {events.map((e) => (
                      <li key={e.id}>
                        <a href={timelineHash([timeline.id], 'vertical', e.id)}>
                          <span className="ni-date">{e.date.label}</span>
                          {e.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}
