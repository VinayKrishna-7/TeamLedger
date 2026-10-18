import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  rupeesToPaise,
  paiseToRupees,
  formatPaise,
  calculateEqualShares,
} from '../src/services/splitService.js';

describe('Split Service - Financial Calculation & Equal Splitting', () => {
  test('rupeesToPaise converts exact and decimal amounts accurately', () => {
    assert.equal(rupeesToPaise(1200), 120000);
    assert.equal(rupeesToPaise('1200'), 120000);
    assert.equal(rupeesToPaise(49.99), 4999);
    assert.equal(rupeesToPaise(0.33), 33);
  });

  test('paiseToRupees converts integer paise back to rupees', () => {
    assert.equal(paiseToRupees(120000), 1200);
    assert.equal(paiseToRupees(4999), 49.99);
  });

  test('formatPaise produces clean rupee formatting', () => {
    assert.equal(formatPaise(120000), '₹1,200.00');
    assert.equal(formatPaise(-40000), '-₹400.00');
  });

  test('equal splitting divides cleanly when divisible', () => {
    // ₹1,200 split among 3 members: 400 each
    const amountMinor = 120000;
    const participants = ['m1', 'm2', 'm3'];
    const shares = calculateEqualShares(amountMinor, participants);

    assert.equal(shares.length, 3);
    assert.equal(shares[0].shareAmountMinor, 40000);
    assert.equal(shares[1].shareAmountMinor, 40000);
    assert.equal(shares[2].shareAmountMinor, 40000);

    const total = shares.reduce((acc, s) => acc + s.shareAmountMinor, 0);
    assert.equal(total, amountMinor);
  });

  test('equal splitting handles remainder paise deterministically without losing a single paisa', () => {
    // ₹100 (10000 paise) split among 3 members:
    // 10000 / 3 = 3333 with remainder 1.
    // Sorted IDs: 'alice', 'bob', 'charlie'
    // 'alice' gets 3334, 'bob' gets 3333, 'charlie' gets 3333.
    const amountMinor = 10000;
    const participants = ['charlie', 'alice', 'bob'];
    const shares = calculateEqualShares(amountMinor, participants);

    assert.equal(shares.length, 3);
    assert.equal(shares[0].memberId, 'alice');
    assert.equal(shares[0].shareAmountMinor, 3334);
    assert.equal(shares[1].memberId, 'bob');
    assert.equal(shares[1].shareAmountMinor, 3333);
    assert.equal(shares[2].memberId, 'charlie');
    assert.equal(shares[2].shareAmountMinor, 3333);

    const total = shares.reduce((acc, s) => acc + s.shareAmountMinor, 0);
    assert.equal(total, amountMinor);
  });

  test('handles 7 participants splitting an odd amount with multi-paise remainder', () => {
    const amountMinor = 50005; // ₹500.05 split among 7 members
    // 50005 / 7 = 7143 remainder 4 paise
    const participants = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
    const shares = calculateEqualShares(amountMinor, participants);

    assert.equal(shares.length, 7);
    const total = shares.reduce((acc, s) => acc + s.shareAmountMinor, 0);
    assert.equal(total, amountMinor);

    // First 4 get 7144, last 3 get 7143
    assert.equal(shares[0].shareAmountMinor, 7144);
    assert.equal(shares[1].shareAmountMinor, 7144);
    assert.equal(shares[2].shareAmountMinor, 7144);
    assert.equal(shares[3].shareAmountMinor, 7144);
    assert.equal(shares[4].shareAmountMinor, 7143);
    assert.equal(shares[5].shareAmountMinor, 7143);
    assert.equal(shares[6].shareAmountMinor, 7143);
  });

  test('rejects non-positive amounts or invalid participants', () => {
    assert.throws(() => calculateEqualShares(0, ['m1']), /positive integer/);
    assert.throws(() => calculateEqualShares(-500, ['m1']), /positive integer/);
    assert.throws(() => calculateEqualShares(100.5, ['m1']), /positive integer/);
    assert.throws(() => calculateEqualShares(1000, []), /At least one participant/);
  });
});
