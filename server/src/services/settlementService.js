import { calculateGroupBalances } from './balanceService.js';

/**
 * Computes suggested transfers to settle all debts in a group.
 * Matches debtors and creditors to minimize total payment transactions.
 * 
 * @param {Array<{ memberId: string, name: string, netBalanceMinor: number }>} balances
 * @returns {Array<{ fromMemberId: string, fromMemberName: string, toMemberId: string, toMemberName: string, amountMinor: number }>}
 */
export function computeSettlementPlan(balances) {
  if (!Array.isArray(balances) || balances.length === 0) {
    return [];
  }

  const debtors = [];
  const creditors = [];

  for (const b of balances) {
    if (b.netBalanceMinor < 0) {
      debtors.push({
        memberId: b.memberId.toString(),
        name: b.name,
        amount: Math.abs(b.netBalanceMinor),
      });
    } else if (b.netBalanceMinor > 0) {
      creditors.push({
        memberId: b.memberId.toString(),
        name: b.name,
        amount: b.netBalanceMinor,
      });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        fromMemberName: debtor.name,
        toMemberId: creditor.memberId,
        toMemberName: creditor.name,
        amountMinor: transferAmount,
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    if (debtor.amount === 0) {
      debtorIdx++;
    }
    if (creditor.amount === 0) {
      creditorIdx++;
    }
  }

  return transfers;
}

/**
 * Retrieves the settlement plan and group balances for a given group.
 */
export async function getGroupSettlementPlan(groupId) {
  const { group, balances, totalSpendingMinor, totalSettledMinor, totalUnsettledDebtMinor } =
    await calculateGroupBalances(groupId);

  const transfers = computeSettlementPlan(balances);

  return {
    group,
    totalSpendingMinor,
    totalSettledMinor,
    totalUnsettledDebtMinor,
    balances,
    transfers,
    transfersCount: transfers.length,
  };
}
