import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { Group } from '../src/models/Group.js';
import { Expense } from '../src/models/Expense.js';
import { Settlement } from '../src/models/Settlement.js';

describe('TeamLedger End-to-End API & Ledger Flow', () => {
  before(async () => {
    const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/teamledger_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    // Clean collections before test
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});
  });

  after(async () => {
    // Clean test collections and disconnect
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});
    await mongoose.disconnect();
  });

  let groupId;
  let rahulId;
  let priyaId;
  let arjunId;
  let expenseId;

  test('POST /api/groups creates a group with stable member IDs', async () => {
    const res = await request(app)
      .post('/api/groups')
      .send({
        name: 'Goa Trip 2026',
        description: 'Beach holiday shared expenses',
        memberNames: ['Rahul', 'Priya', 'Arjun'],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Goa Trip 2026');
    assert.equal(res.body.data.members.length, 3);

    groupId = res.body.data._id;
    rahulId = res.body.data.members.find((m) => m.name === 'Rahul')._id;
    priyaId = res.body.data.members.find((m) => m.name === 'Priya')._id;
    arjunId = res.body.data.members.find((m) => m.name === 'Arjun')._id;

    assert.ok(rahulId, 'Rahul should have stable ID');
    assert.ok(priyaId, 'Priya should have stable ID');
    assert.ok(arjunId, 'Arjun should have stable ID');
  });

  test('POST /api/groups rejects duplicate member names', async () => {
    const res = await request(app)
      .post('/api/groups')
      .send({
        name: 'Roommates',
        memberNames: ['Rahul', 'rahul'],
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Duplicate member name/);
  });

  test('POST /api/groups/:groupId/expenses records ₹1,200 expense split 3 ways', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .send({
        title: 'Seafood Shack Dinner',
        amount: 1200,
        payerId: rahulId,
        participantIds: [rahulId, priyaId, arjunId],
        category: 'Food',
        date: new Date().toISOString(),
        note: 'Fresh catch dinner',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amountMinor, 120000); // 1200.00 INR = 120,000 paise
    assert.equal(res.body.data.participantShares.length, 3);
    assert.equal(res.body.data.participantShares[0].shareAmountMinor, 40000);

    expenseId = res.body.data._id;
  });

  test('GET /api/groups/:groupId/balances yields exact +₹800, -₹400, -₹400 balances', async () => {
    const res = await request(app).get(`/api/groups/${groupId}/balances`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.totalSpendingMinor, 120000);

    const rahulBal = res.body.data.balances.find((b) => b.memberId === rahulId);
    const priyaBal = res.body.data.balances.find((b) => b.memberId === priyaId);
    const arjunBal = res.body.data.balances.find((b) => b.memberId === arjunId);

    assert.equal(rahulBal.netBalanceMinor, 80000); // +₹800
    assert.equal(priyaBal.netBalanceMinor, -40000); // -₹400
    assert.equal(arjunBal.netBalanceMinor, -40000); // -₹400
  });

  test('GET /api/groups/:groupId/settlement-plan suggests greedy transfers', async () => {
    const res = await request(app).get(`/api/groups/${groupId}/settlement-plan`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.transfers.length, 2);

    const totalTransfers = res.body.data.transfers.reduce((acc, t) => acc + t.amountMinor, 0);
    assert.equal(totalTransfers, 80000); // 800 INR
  });

  test('POST /api/groups/:groupId/settlements rejects settlement exceeding debt', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/settlements`)
      .send({
        paidByMemberId: arjunId,
        receivedByMemberId: rahulId,
        amount: 500, // Arjun only owes 400!
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /exceeds/);
  });

  test('POST /api/groups/:groupId/settlements records valid ₹400 repayment from Arjun to Rahul', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/settlements`)
      .send({
        paidByMemberId: arjunId,
        receivedByMemberId: rahulId,
        amount: 400,
        note: 'UPI Payment',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);

    // Verify Arjun is now fully settled (net balance: 0)
    const arjunBal = res.body.updatedBalances.balances.find((b) => b.memberId === arjunId);
    const rahulBal = res.body.updatedBalances.balances.find((b) => b.memberId === rahulId);
    const priyaBal = res.body.updatedBalances.balances.find((b) => b.memberId === priyaId);

    assert.equal(arjunBal.netBalanceMinor, 0);
    assert.equal(rahulBal.netBalanceMinor, 40000); // Rahul now owed only 400
    assert.equal(priyaBal.netBalanceMinor, -40000); // Priya still owes 400
  });

  test('DELETE /api/groups/:groupId/members/:memberId prevents removing member with transaction history', async () => {
    const res = await request(app).delete(`/api/groups/${groupId}/members/${arjunId}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Cannot remove/);
  });

  test('GET /api/dashboard/summary calculates totals across groups', async () => {
    const res = await request(app).get('/api/dashboard/summary');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.groupCount, 1);
    assert.equal(res.body.data.totalSpendingMinor, 120000);
    assert.equal(res.body.data.totalSettledMinor, 40000);
    assert.equal(res.body.data.totalUnsettledDebtMinor, 40000);
  });
});
