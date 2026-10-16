export type Precision = 'day' | 'month' | 'year' | 'century' | 'approx';

/** A point or span in time. Years are decimal (1685.5 ≈ mid-1685); negative years are BC. */
export interface TimePoint {
  start: number;
  end?: number;
  precision: Precision;
  label: string;
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  date: TimePoint;
  title: string;
  /** Rendered markdown body (unsanitized; sanitize before inserting into the DOM). */
  html: string;
  /** Plain text of the body, used for search and excerpts. */
  text: string;
  image?: string;
  color?: string;
}

export interface Period {
  date: TimePoint;
  title: string;
  color: string;
  /** Rendered markdown description (unsanitized); empty when the period has none. */
  html: string;
  text: string;
  image?: string;
}

export interface Timeline {
  id: string;
  title: string;
  color: string;
  description: string;
  /** Dashboard cover image (frontmatter `cover:`). */
  cover?: string;
  /** Top-level group on the dashboard and in the picker (frontmatter `category:`). */
  category?: string;
  /** Labels within the category, e.g. 浪漫時期 (frontmatter `tags:`, a list or a single string). */
  tags: string[];
  /** Always list after the others on the dashboard (frontmatter `sortLast: true`). */
  sortLast?: boolean;
  periods: Period[];
  events: TimelineEvent[];
}

/** A timeline as displayed: its events may be filtered by the search box. */
export interface Lane {
  timeline: Timeline;
  events: TimelineEvent[];
}
