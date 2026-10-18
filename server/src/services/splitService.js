/**
 * Utility and splitting service for financial calculations.
 * Always operates in integer minor units (paise). 1 INR = 100 paise.
 */

/**
 * Converts a rupee amount (e.g., 1200 or 1200.50) into integer paise.
 * Uses exact rounding to avoid IEEE-754 floating point imprecision.
 */
export function rupeesToPaise(rupees) {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees.trim());
  }
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new Error('Invalid rupee amount provided');
  }
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise back to rupees (floating number).
 */
export function paiseToRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) {
    throw new Error('Invalid paise amount provided');
  }
  return paise / 100;
}

/**
 * Formats integer paise into a human-readable rupee string (e.g. "₹1,200.00").
 */
export function formatPaise(paise, includeSymbol = true) {
  const rupees = paiseToRupees(paise);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rupees));

  const sign = paise < 0 ? '-' : '';
  return includeSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

/**
 * Computes deterministic equal shares for a given total paise amount among participant IDs.
 * 
 * Rules:
 * 1. Operates exclusively on integer paise.
 * 2. Participants are sorted deterministically by ID string.
 * 3. Base share is Math.floor(totalPaise / N).
 * 4. Remainder paise (totalPaise % N) are assigned 1 paise each to the first `remainder` participants.
 * 5. Guarantee: sum(shares) === totalPaise exactly.
 * 
 * @param {number} amountMinor - Total expense in paise (integer > 0)
 * @param {string[]} participantIds - Array of member IDs (strings or ObjectIds)
 * @returns {Array<{ memberId: string, shareAmountMinor: number }>}
 */
export function calculateEqualShares(amountMinor, participantIds) {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Expense amount must be a positive integer in paise');
  }

  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new Error('At least one participant is required for splitting');
  }

  // Deduplicate and convert to string
  const uniqueIds = Array.from(new Set(participantIds.map((id) => id.toString())));
  if (uniqueIds.length === 0) {
    throw new Error('Valid participant IDs are required');
  }

  // Sort deterministically
  uniqueIds.sort();

  const count = uniqueIds.length;
  const baseShare = Math.floor(amountMinor / count);
  const remainder = amountMinor % count;

  const shares = uniqueIds.map((memberId, index) => {
    // First `remainder` participants get 1 extra paise
    const shareAmountMinor = index < remainder ? baseShare + 1 : baseShare;
    return {
      memberId,
      shareAmountMinor,
    };
  });

  // Self-verification check
  const sum = shares.reduce((acc, s) => acc + s.shareAmountMinor, 0);
  if (sum !== amountMinor) {
    throw new Error(`Splitting algorithm integrity check failed: sum ${sum} !== amount ${amountMinor}`);
  }

  return shares;
}
