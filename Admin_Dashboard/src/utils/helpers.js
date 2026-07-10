export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(amount) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

export function initials(name) {
  return (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
