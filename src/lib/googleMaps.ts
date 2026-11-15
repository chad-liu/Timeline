import type { Place } from './places';

/** Google's directions URL takes an origin, a destination and at most this many waypoints in between. */
const MAX_WAYPOINTS = 9;
/** A hop longer than this (in km) is a sea crossing or a flight, which driving directions cannot follow: the route is cut there. */
export const MAX_HOP_KM = 4000;

const point = (place: Place) => `${place.lat},${place.lon}`;

/** Opens Google Maps on a place. It searches by coordinates, since a Chinese place name alone often finds nothing or the wrong town. */
export function placeUrl(place: Place): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point(place))}`;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: Place, b: Place): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** A stretch of a route that fits in one Google Maps directions link. */
export interface RouteLink {
  from: Place;
  to: Place;
  /** How many of the route's stops the stretch covers, both ends included. */
  stops: number;
  url: string;
}

/**
 * Google Maps directions through the stops of a route, in order. One link holds at most eleven stops, so a longer route is
 * split into stretches that share their end stop, and it is also cut at every hop over {@link MAX_HOP_KM} (Europe to America),
 * which is left out. A stop left on its own between two such hops gets no link.
 */
export function routeLinks(stops: Place[]): RouteLink[] {
  const links: RouteLink[] = [];
  let run: Place[] = [];
  const flush = () => {
    for (let i = 0; i + 1 < run.length; i += MAX_WAYPOINTS + 1) {
      const part = run.slice(i, i + MAX_WAYPOINTS + 2);
      const params = new URLSearchParams({
        api: '1',
        origin: point(part[0]),
        destination: point(part[part.length - 1]),
        travelmode: 'driving',
      });
      if (part.length > 2) params.set('waypoints', part.slice(1, -1).map(point).join('|'));
      links.push({ from: part[0], to: part[part.length - 1], stops: part.length, url: `https://www.google.com/maps/dir/?${params}` });
    }
    run = [];
  };
  for (const stop of stops) {
    const last = run[run.length - 1];
    if (last === stop) continue;
    if (last && distanceKm(last, stop) > MAX_HOP_KM) flush();
    run.push(stop);
  }
  flush();
  return links;
}
