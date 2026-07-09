/**
 * Helper service to post-process and format report aggregations.
 */

export function roundDecimal(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return roundDecimal((part / total) * 100);
}
