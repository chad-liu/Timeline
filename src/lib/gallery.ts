import type { Timeline, TimelineEvent } from '../types';
import { UNCATEGORIZED } from './timelineOrder';

/** One picture of the image wall: an event's lead image, shown once however many events share the file. */
export interface GalleryItem {
  image: string;
  /** The earliest event that uses the image, and its timeline. */
  event: TimelineEvent;
  timeline: Timeline;
  /** Every event that uses the image, in date order (the first one is `event`). */
  uses: { event: TimelineEvent; timeline: Timeline }[];
}

/** Years before this one are too sparse to split by century; they share one era. */
const ANCIENT_BEFORE = -1000;
export const ANCIENT = '前10世紀以前';

/** The era heading for a decimal year: 「15世紀」, 「前5世紀」, or one bucket for everything before 1000 BC. */
export function eraOf(year: number): string {
  if (year < ANCIENT_BEFORE) return ANCIENT;
  const y = Math.floor(year);
  return y < 0 ? `前${Math.ceil(-y / 100)}世紀` : `${Math.floor(y / 100) + 1}世紀`;
}

/** Every event image in date order. An image used by several events (a biography and its works list) appears once, at its earliest event. */
export function buildGallery(timelines: Timeline[]): GalleryItem[] {
  const all = timelines
    .flatMap((timeline) => timeline.events.filter((event) => event.image).map((event) => ({ event, timeline })))
    .sort((a, b) => a.event.date.start - b.event.date.start);
  const byImage = new Map<string, GalleryItem>();
  for (const use of all) {
    const image = use.event.image!;
    const item = byImage.get(image);
    if (item) item.uses.push(use);
    else byImage.set(image, { image, ...use, uses: [use] });
  }
  return [...byImage.values()];
}

export const categoryOfItem = (item: GalleryItem) => item.timeline.category ?? UNCATEGORIZED;
