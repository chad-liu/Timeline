import DOMPurify from 'dompurify';

// External links in event and period bodies (e.g. the 案件卷宗 links to the books site) open in a new tab,
// with noopener so the opened page cannot reach back through window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:\/\//i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/** Event bodies come from user-edited markdown; strip scripts and event handlers before rendering. */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html);
}
