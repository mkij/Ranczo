export function pluralizePoints(n: number): string {
  if (n === 1) return '1 punkt';
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return `${n} punktów`;
  if (lastOne >= 2 && lastOne <= 4) return `${n} punkty`;
  return `${n} punktów`;
}