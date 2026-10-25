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
  | { page: 'timeline'; view: View; ids: string[]; event?: string };

/**
 * Routes live in the URL hash: no `t` parameter shows the dashboard (`#c=音樂家&tag=浪漫時期` picks its category tab and tag filter),
 * `#v=horizontal&t=Bach|Handel` shows those timelines (`&e=Bach-3` also opens that event), `#p=lifespans` shows the lifespan chart
 * and `#p=index` the name index.
 */
export function parseHash(hash: string, knownIds: string[]): Route {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('p') === 'lifespans') return { page: 'lifespans' };
  if (params.get('p') === 'index') return { page: 'index' };
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
