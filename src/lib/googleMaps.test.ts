import { describe, expect, it } from 'vitest';
import { distanceKm, placeUrl, routeLinks } from './googleMaps';
import type { Place } from './places';

const place = (name: string, lat: number, lon: number): Place => ({ name, aliases: [], lat, lon });
const leipzig = place('萊比錫', 51.34, 12.37);
const weimar = place('威瑪', 50.98, 11.33);
const eisenach = place('埃森納赫', 50.97, 10.32);
const vienna = place('維也納', 48.21, 16.37);
const newYork = place('紐約', 40.71, -74.01);
const boston = place('波士頓', 42.36, -71.06);

const waypoints = (url: string) => new URL(url).searchParams.get('waypoints');

describe('placeUrl', () => {
  it('searches Google Maps by coordinates', () => {
    expect(placeUrl(leipzig)).toBe('https://www.google.com/maps/search/?api=1&query=51.34%2C12.37');
  });
});

describe('distanceKm', () => {
  it('measures along the great circle', () => {
    expect(distanceKm(leipzig, leipzig)).toBe(0);
    expect(Math.round(distanceKm(leipzig, weimar))).toBe(83);
    expect(distanceKm(vienna, newYork)).toBeGreaterThan(6500);
  });
});

describe('routeLinks', () => {
  it('links the stops in order as origin, waypoints and destination', () => {
    const [link, ...rest] = routeLinks([eisenach, weimar, leipzig]);
    expect(rest).toEqual([]);
    expect(link).toMatchObject({ from: eisenach, to: leipzig, stops: 3 });
    const params = new URL(link.url).searchParams;
    expect([params.get('origin'), params.get('waypoints'), params.get('destination')]).toEqual([
      '50.97,10.32',
      '50.98,11.33',
      '51.34,12.37',
    ]);
  });

  it('needs two stops, and ignores a stop repeated in a row', () => {
    expect(routeLinks([leipzig])).toEqual([]);
    expect(routeLinks([])).toEqual([]);
    expect(routeLinks([leipzig, leipzig, weimar]).map((l) => [l.stops, waypoints(l.url)])).toEqual([[2, null]]);
  });

  it('splits a long route into stretches of eleven stops that share their end', () => {
    const towns = Array.from({ length: 25 }, (_, i) => place(`鎮${i}`, 48 + i * 0.1, 10 + i * 0.1));
    const links = routeLinks(towns);
    expect(links.map((l) => [l.from.name, l.to.name, l.stops])).toEqual([
      ['鎮0', '鎮10', 11],
      ['鎮10', '鎮20', 11],
      ['鎮20', '鎮24', 5],
    ]);
    expect(waypoints(links[0].url)?.split('|')).toHaveLength(9);
  });

  it('cuts the route at an ocean crossing and leaves the crossing out', () => {
    expect(routeLinks([vienna, leipzig, newYork, boston]).map((l) => [l.from.name, l.to.name])).toEqual([
      ['維也納', '萊比錫'],
      ['紐約', '波士頓'],
    ]);
    // A stop alone between two crossings has nowhere to drive to.
    expect(routeLinks([vienna, newYork, leipzig, weimar]).map((l) => [l.from.name, l.to.name])).toEqual([['萊比錫', '威瑪']]);
  });
});
