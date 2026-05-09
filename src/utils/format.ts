export function formatTZS(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded);
  return `${sign}${abs.toLocaleString('en-US')} TZS`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
