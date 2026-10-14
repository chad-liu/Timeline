import DOMPurify from 'dompurify';

/** Event bodies come from user-edited markdown; strip scripts and event handlers before rendering. */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html);
}
