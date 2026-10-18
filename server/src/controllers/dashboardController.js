import { Group } from '../models/Group.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { calculateGroupBalances } from '../services/balanceService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const groups = await Group.find().lean();
    const groupCount = groups.length;

    let totalSpendingMinor = 0;
    let totalSettledMinor = 0;
    let totalUnsettledDebtMinor = 0; // Total debt owed across all groups

    // Category breakdown map across all groups
    const categoryTotals = {};

    // Group summaries for cards
    const groupCards = [];

    for (const group of groups) {
      let groupSpending = 0;
      let groupUnsettled = 0;
      let groupSettled = 0;
      let groupBalances = [];

      try {
        const bal = await calculateGroupBalances(group._id);
        groupSpending = bal.totalSpendingMinor;
        groupUnsettled = bal.totalUnsettledDebtMinor;
        groupSettled = bal.totalSettledMinor;
        groupBalances = bal.balances;
      } catch {
        // default 0
      }

      totalSpendingMinor += groupSpending;
      totalSettledMinor += groupSettled;
      totalUnsettledDebtMinor += groupUnsettled;

      const expenseCount = await Expense.countDocuments({ groupId: group._id });

      groupCards.push({
        _id: group._id,
        name: group.name,
        description: group.description,
        memberCount: group.members.length,
        members: group.members,
        expenseCount,
        totalSpendingMinor: groupSpending,
        totalUnsettledDebtMinor: groupUnsettled,
        totalSettledMinor: groupSettled,
        balances: groupBalances,
        createdAt: group.createdAt,
      });
    }

    // Aggregate category totals
    const allExpenses = await Expense.find().lean();
    for (const exp of allExpenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amountMinor;
    }

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amountMinor]) => ({
        category,
        amountMinor,
        percentage: totalSpendingMinor > 0 ? ((amountMinor / totalSpendingMinor) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amountMinor - a.amountMinor);

    // Recent 6 expenses across all groups
    const recentExpenses = await Expense.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .lean();

    // Map group name and payer name for recent expenses
    const groupMap = new Map();
    groups.forEach((g) => {
      const memberMap = new Map();
      g.members.forEach((m) => memberMap.set(m._id.toString(), m.name));
      groupMap.set(g._id.toString(), {
        name: g.name,
        memberMap,
      });
    });

    const enrichedRecentExpenses = recentExpenses.map((exp) => {
      const gInfo = groupMap.get(exp.groupId.toString());
      return {
        ...exp,
        groupName: gInfo ? gInfo.name : 'Unknown Group',
        paidByName: gInfo ? gInfo.memberMap.get(exp.paidByMemberId.toString()) || 'Unknown' : 'Unknown',
      };
    });

    res.json({
      success: true,
      data: {
        totalSpendingMinor,
        totalSettledMinor,
        totalUnsettledDebtMinor,
        groupCount,
        totalExpensesCount: allExpenses.length,
        categoryBreakdown,
        topCategory: categoryBreakdown.length > 0 ? categoryBreakdown[0] : null,
        recentExpenses: enrichedRecentExpenses,
        groups: groupCards,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentExpenses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const expenses = await Expense.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const groups = await Group.find().lean();
    const groupMap = new Map();
    groups.forEach((g) => {
      const memberMap = new Map();
      g.members.forEach((m) => memberMap.set(m._id.toString(), m.name));
      groupMap.set(g._id.toString(), {
        name: g.name,
        memberMap,
      });
    });

    const enriched = expenses.map((exp) => {
      const gInfo = groupMap.get(exp.groupId.toString());
      return {
        ...exp,
        groupName: gInfo ? gInfo.name : 'Unknown Group',
        paidByName: gInfo ? gInfo.memberMap.get(exp.paidByMemberId.toString()) || 'Unknown' : 'Unknown',
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};
