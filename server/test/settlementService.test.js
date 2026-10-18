import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeSettlementPlan } from '../src/services/settlementService.js';

describe('Settlement Algorithm - Greedy Debtor-Creditor Matching', () => {
  test('matches specification example (Rahul: +₹700, Priya: -₹200, Arjun: -₹500)', () => {
    const balances = [
      { memberId: 'm1', name: 'Rahul', netBalanceMinor: 70000 },
      { memberId: 'm2', name: 'Priya', netBalanceMinor: -20000 },
      { memberId: 'm3', name: 'Arjun', netBalanceMinor: -50000 },
    ];

    const plan = computeSettlementPlan(balances);

    assert.equal(plan.length, 2);

    // Greedy picks Arjun (largest debt: 50,000) first to Rahul (credit: 70,000)
    assert.equal(plan[0].fromMemberName, 'Arjun');
    assert.equal(plan[0].toMemberName, 'Rahul');
    assert.equal(plan[0].amountMinor, 50000);

    // Then Priya (remaining debt: 20,000) to Rahul (remaining credit: 20,000)
    assert.equal(plan[1].fromMemberName, 'Priya');
    assert.equal(plan[1].toMemberName, 'Rahul');
    assert.equal(plan[1].amountMinor, 20000);
  });

  test('returns empty array when everyone is settled (zero balances)', () => {
    const balances = [
      { memberId: 'm1', name: 'Rahul', netBalanceMinor: 0 },
      { memberId: 'm2', name: 'Priya', netBalanceMinor: 0 },
    ];

    const plan = computeSettlementPlan(balances);
    assert.deepEqual(plan, []);
  });

  test('complex multi-party settlement resolves correctly with no negative or self transfers', () => {
    const balances = [
      { memberId: '1', name: 'A', netBalanceMinor: 10000 },
      { memberId: '2', name: 'B', netBalanceMinor: 5000 },
      { memberId: '3', name: 'C', netBalanceMinor: -8000 },
      { memberId: '4', name: 'D', netBalanceMinor: -7000 },
    ];

    const plan = computeSettlementPlan(balances);

    // Verify all transfers are valid
    for (const t of plan) {
      assert.ok(t.amountMinor > 0, 'Transfer amount must be positive');
      assert.notEqual(t.fromMemberId, t.toMemberId, 'Cannot transfer to self');
    }

    // Verify net resolution: total transferred out by debtors equals their debts
    const paidByMember = {};
    const receivedByMember = {};

    for (const t of plan) {
      paidByMember[t.fromMemberId] = (paidByMember[t.fromMemberId] || 0) + t.amountMinor;
      receivedByMember[t.toMemberId] = (receivedByMember[t.toMemberId] || 0) + t.amountMinor;
    }

    assert.equal(receivedByMember['1'], 10000);
    assert.equal(receivedByMember['2'], 5000);
    assert.equal(paidByMember['3'], 8000);
    assert.equal(paidByMember['4'], 7000);
  });
});
