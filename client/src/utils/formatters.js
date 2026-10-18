/**
 * Formats integer paise into a clean Indian Rupee string.
 * @param {number} amountMinor - Amount in paise (integer)
 * @param {boolean} includeSymbol - Whether to prepend '₹'
 * @returns {string}
 */
export function formatRupees(amountMinor, includeSymbol = true) {
  if (typeof amountMinor !== 'number' || isNaN(amountMinor)) {
    return includeSymbol ? '₹0.00' : '0.00';
  }

  const isNegative = amountMinor < 0;
  const absRupees = Math.abs(amountMinor) / 100;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absRupees);

  const sign = isNegative ? '-' : '';
  return includeSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

export function paiseToRupees(amountMinor) {
  if (typeof amountMinor !== 'number' || isNaN(amountMinor)) return 0;
  return amountMinor / 100;
}

export function rupeesToPaise(rupees) {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees.trim());
  }
  if (typeof rupees !== 'number' || isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
