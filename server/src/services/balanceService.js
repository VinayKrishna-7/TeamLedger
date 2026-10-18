import { Group } from '../models/Group.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';

/**
 * Calculates net balances for all members in a group from database records.
 *
 * Formula for each member:
 * netBalance = (paidForExpenses - owedInShares) + (paidInSettlements - receivedInSettlements)
 *
 * All amounts are in integer paise.
 */
export async function calculateGroupBalances(groupId) {
  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch all expenses and settlements for this group
  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId }).lean(),
    Settlement.find({ groupId }).lean(),
  ]);

  // Initialize ledger map for all active group members
  const memberLedger = new Map();

  for (const member of group.members) {
    memberLedger.set(member._id.toString(), {
      memberId: member._id.toString(),
      name: member.name,
      paidExpensesMinor: 0,
      owedSharesMinor: 0,
      paidSettlementsMinor: 0,
      receivedSettlementsMinor: 0,
      netBalanceMinor: 0,
    });
  }

  let totalSpendingMinor = 0;
  for (const exp of expenses) {
    totalSpendingMinor += exp.amountMinor;
    const payerId = exp.paidByMemberId.toString();

    if (memberLedger.has(payerId)) {
      memberLedger.get(payerId).paidExpensesMinor += exp.amountMinor;
    }

    for (const share of exp.participantShares) {
      const participantId = share.memberId.toString();
      if (memberLedger.has(participantId)) {
        memberLedger.get(participantId).owedSharesMinor += share.shareAmountMinor;
      }
    }
  }

  let totalSettledMinor = 0;
  for (const set of settlements) {
    totalSettledMinor += set.amountMinor;
    const payerId = set.paidByMemberId.toString();
    const receiverId = set.receivedByMemberId.toString();

    if (memberLedger.has(payerId)) {
      memberLedger.get(payerId).paidSettlementsMinor += set.amountMinor;
    }
    if (memberLedger.has(receiverId)) {
      memberLedger.get(receiverId).receivedSettlementsMinor += set.amountMinor;
    }
  }

  const balances = [];
  let totalPositiveBalance = 0;
  let totalNegativeBalance = 0;

  for (const entry of memberLedger.values()) {
    const net = (entry.paidExpensesMinor - entry.owedSharesMinor) +
                (entry.paidSettlementsMinor - entry.receivedSettlementsMinor);

    entry.netBalanceMinor = net;
    balances.push(entry);

    if (net > 0) {
      totalPositiveBalance += net;
    } else if (net < 0) {
      totalNegativeBalance += Math.abs(net);
    }
  }

  return {
    group: {
      _id: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      createdAt: group.createdAt,
    },
    totalSpendingMinor,
    totalSettledMinor,
    totalUnsettledDebtMinor: totalNegativeBalance,
    balances,
  };
}

/**
 * Validates that a proposed settlement amount does not exceed the debtor's debt
 * or creditor's entitlement.
 */
export async function validateSettlementRules(groupId, paidByMemberId, receivedByMemberId, amountMinor) {
  if (paidByMemberId.toString() === receivedByMemberId.toString()) {
    const error = new Error('Payer and receiver must be different group members');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    const error = new Error('Settlement amount must be a positive integer in paise');
    error.statusCode = 400;
    throw error;
  }

  const { balances } = await calculateGroupBalances(groupId);

  const payerBalance = balances.find((b) => b.memberId === paidByMemberId.toString());
  const receiverBalance = balances.find((b) => b.memberId === receivedByMemberId.toString());

  if (!payerBalance) {
    const error = new Error('Payer does not belong to this group');
    error.statusCode = 400;
    throw error;
  }

  if (!receiverBalance) {
    const error = new Error('Receiver does not belong to this group');
    error.statusCode = 400;
    throw error;
  }

  // Check if payer actually owes money
  if (payerBalance.netBalanceMinor >= 0) {
    const error = new Error(`${payerBalance.name} does not currently owe any money in this group`);
    error.statusCode = 400;
    throw error;
  }

  // Check if receiver is owed money
  if (receiverBalance.netBalanceMinor <= 0) {
    const error = new Error(`${receiverBalance.name} is not owed any money in this group`);
    error.statusCode = 400;
    throw error;
  }

  const maxPayerCanPay = Math.abs(payerBalance.netBalanceMinor);
  if (amountMinor > maxPayerCanPay) {
    const maxRupees = (maxPayerCanPay / 100).toFixed(2);
    const error = new Error(
      `Settlement amount exceeds ${payerBalance.name}'s outstanding debt of ₹${maxRupees}`
    );
    error.statusCode = 400;
    throw error;
  }

  const maxReceiverCanReceive = receiverBalance.netBalanceMinor;
  if (amountMinor > maxReceiverCanReceive) {
    const maxRupees = (maxReceiverCanReceive / 100).toFixed(2);
    const error = new Error(
      `Settlement amount exceeds what ${receiverBalance.name} is owed (₹${maxRupees})`
    );
    error.statusCode = 400;
    throw error;
  }

  return true;
}
