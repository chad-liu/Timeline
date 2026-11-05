import { describe, expect, it } from 'vitest';
import { lifespansHash, parseHash } from './route';

const IDS = ['Confucius', 'Socrates'];

describe('lifespans route', () => {
  it('defaults to category mode with nothing picked', () => {
    expect(parseHash('#p=lifespans', IDS)).toEqual({ page: 'lifespans', mode: 'category', selected: undefined, only: false });
  });

  it('reads the era mode, the picked person and the contemporaries-only switch', () => {
    expect(parseHash('#p=lifespans&g=era&sel=Confucius&only=1', IDS)).toEqual({ page: 'lifespans', mode: 'era', selected: 'Confucius', only: true });
  });

  it('ignores an unknown person, and `only` without a person', () => {
    expect(parseHash('#p=lifespans&sel=Nobody&only=1', IDS)).toMatchObject({ selected: undefined, only: false });
    expect(parseHash('#p=lifespans&only=1', IDS)).toMatchObject({ only: false });
  });

  it('round-trips through lifespansHash', () => {
    expect(lifespansHash()).toBe('#p=lifespans');
    expect(lifespansHash('era', 'Socrates', true)).toBe('#p=lifespans&g=era&sel=Socrates&only=1');
    expect(parseHash(lifespansHash('era', 'Socrates', true), IDS)).toEqual({ page: 'lifespans', mode: 'era', selected: 'Socrates', only: true });
  });
});
