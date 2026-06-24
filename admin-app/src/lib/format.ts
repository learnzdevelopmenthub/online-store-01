export function formatPaise(value: number): string {
  return `₹${Math.round(value / 100).toLocaleString('en-IN')}`;
}
