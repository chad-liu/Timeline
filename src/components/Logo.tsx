/** App mark: a time axis with three events. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="21" width="28" height="4" rx="2" fill="currentColor" />
      <rect x="6" y="6" width="3" height="15" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="14.5" y="11" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="23" y="3" width="3" height="18" rx="1.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
