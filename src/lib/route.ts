export type View = 'grid' | 'horizontal' | 'vertical';

export const VIEWS: { id: View; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'horizontal', label: '橫向' },
  { id: 'vertical', label: '縱向' },
];

export type Route = { page: 'dashboard'; category?: string } | { page: 'timeline'; view: View; ids: string[] };

/**
 * Routes live in the URL hash: no `t` parameter shows the dashboard (`#c=音樂家` picks its category tab),
 * `#v=horizontal&t=Bach|近代世界史` shows those timelines.
 */
export function parseHash(hash: string, knownIds: string[]): Route {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const ids = (params.get('t') ?? '').split('|').filter((id) => knownIds.includes(id));
  if (ids.length === 0) return { page: 'dashboard', category: params.get('c') ?? undefined };
  const view = VIEWS.find((v) => v.id === params.get('v'))?.id ?? 'horizontal';
  return { page: 'timeline', view, ids };
}

export function timelineHash(ids: string[], view: View = 'horizontal'): string {
  return '#' + new URLSearchParams({ v: view, t: ids.join('|') }).toString();
}

export function dashboardHash(category?: string): string {
  return category ? '#' + new URLSearchParams({ c: category }).toString() : '#';
}
