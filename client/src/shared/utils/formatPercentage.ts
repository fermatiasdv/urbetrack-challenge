/**
 * One decimal when the result isn't an integer (`18.5%`), no decimals when it
 * is (`69%`), `0%` when there is nothing to divide by (`total === 0`).
 * Used by both `vehicles` and `assets` status card hooks
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`").
 */
export function formatPercentage(count: number, total: number): string {
  if (total === 0) return '0%'
  const percentage = Math.round((count / total) * 1000) / 10
  return `${percentage}%`
}
