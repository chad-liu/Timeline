import type { Span } from './yearIndex';

export type View = 'grid' | 'horizontal' | 'vertical';

export const VIEWS: { id: View; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'horizontal', label: '橫向' },
  { id: 'vertical', label: '縱向' },
];

export type Route =
  | { page: 'dashboard'; category?: string; tag?: string }
  | { page: 'lifespans' }
  | { page: 'index' }
  | { page: 'topics' }
  | { page: 'graph'; category?: string; minWeight: number }
  | { page: 'years'; year: number; span: Span }
  | { page: 'timeline'; view: View; ids: string[]; event?: string };

/**
 * Routes live in the URL hash: no `t` parameter shows the dashboard (`#c=音樂家&tag=浪漫時期` picks its category tab and tag filter),
 * `#v=horizontal&t=Bach|Handel` shows those timelines (`&e=Bach-3` also opens that event), `#p=lifespans` shows the lifespan chart
 * `#p=index` the name index, `#p=topics` the topic index, `#p=graph` the relation graph (`&c=音樂家&w=2` keeps one category and links of at least 2 events) and `#p=years&y=1789&s=10` what every timeline has in that year (`s=1`), decade (`s=10`) or century (`s=100`).
 */
export function parseHash(hash: string, knownIds: string[]): Route {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('p') === 'lifespans') return { page: 'lifespans' };
  if (params.get('p') === 'index') return { page: 'index' };
  if (params.get('p') === 'topics') return { page: 'topics' };
  if (params.get('p') === 'graph') {
    const minWeight = Number(params.get('w'));
    return { page: 'graph', category: params.get('c') ?? undefined, minWeight: Number.isInteger(minWeight) && minWeight > 1 ? minWeight : 1 };
  }
  if (params.get('p') === 'years') {
    const year = Number(params.get('y'));
    const span = Number(params.get('s'));
    return {
      page: 'years',
      year: params.get('y') && Number.isInteger(year) ? year : DEFAULT_YEAR,
      span: span === 10 || span === 100 ? span : 1,
    };
  }
  const ids = (params.get('t') ?? '').split('|').filter((id) => knownIds.includes(id));
  if (ids.length === 0) return { page: 'dashboard', category: params.get('c') ?? undefined, tag: params.get('tag') ?? undefined };
  const view = VIEWS.find((v) => v.id === params.get('v'))?.id ?? 'horizontal';
  return { page: 'timeline', view, ids, event: params.get('e') ?? undefined };
}

export function timelineHash(ids: string[], view: View = 'horizontal', event?: string): string {
  const params = new URLSearchParams({ v: view, t: ids.join('|') });
  if (event) params.set('e', event);
  return '#' + params.toString();
}

export function dashboardHash(category?: string, tag?: string): string {
  const params = new URLSearchParams();
  if (category) params.set('c', category);
  if (tag) params.set('tag', tag);
  const query = params.toString();
  return query ? '#' + query : '#';
}

export const LIFESPANS_HASH = '#p=lifespans';
export const INDEX_HASH = '#p=index';
export const TOPICS_HASH = '#p=topics';

export function graphHash(category?: string | null, minWeight = 1): string {
  const params = new URLSearchParams({ p: 'graph' });
  if (category) params.set('c', category);
  if (minWeight > 1) params.set('w', String(minWeight));
  return '#' + params.toString();
}

/** The year the comparison page opens on when the URL names none. */
export const DEFAULT_YEAR = 1789;

export function yearsHash(year: number = DEFAULT_YEAR, span: Span = 1): string {
  return `#p=years&y=${year}&s=${span}`;
}
