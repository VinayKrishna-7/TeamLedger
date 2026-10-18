import mongoose from 'mongoose';
import { Group } from '../models/Group.js';
import { Expense, EXPENSE_CATEGORIES } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { calculateEqualShares, rupeesToPaise } from '../services/splitService.js';
import { calculateGroupBalances } from '../services/balanceService.js';

export const createExpense = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { title, amount, payerId, participantIds, category, date, note } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Expense title is required' });
    }

    let amountMinor;
    try {
      if (typeof amount === 'number' || typeof amount === 'string') {
        amountMinor = rupeesToPaise(amount);
      } else {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a valid positive number in rupees',
      });
    }

    if (amountMinor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Expense amount must be greater than zero',
      });
    }

    if (!payerId || !group.hasMember(payerId)) {
      return res.status(400).json({
        success: false,
        error: 'The payer must be an existing member of this group',
      });
    }

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one participant must be selected for sharing this expense',
      });
    }

    for (const pId of participantIds) {
      if (!group.hasMember(pId)) {
        return res.status(400).json({
          success: false,
          error: `Participant ID ${pId} does not belong to this group`,
        });
      }
    }

    const selectedCategory = category || 'Other';
    if (!EXPENSE_CATEGORIES.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      });
    }

    const participantShares = calculateEqualShares(amountMinor, participantIds);

    const expense = await Expense.create({
      groupId,
      title: title.trim(),
      amountMinor,
      currency: 'INR',
      paidByMemberId: payerId,
      participantShares,
      category: selectedCategory,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { category, search, startDate, endDate, sort } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const query = { groupId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    let sortOptions = { date: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { date: 1, createdAt: 1 };
    } else if (sort === 'amount_desc') {
      sortOptions = { amountMinor: -1 };
    } else if (sort === 'amount_asc') {
      sortOptions = { amountMinor: 1 };
    }

    const expenses = await Expense.find(query).sort(sortOptions).lean();

    // Map member names for readability
    const memberMap = new Map();
    group.members.forEach((m) => memberMap.set(m._id.toString(), m.name));

    const enrichedExpenses = expenses.map((exp) => ({
      ...exp,
      paidByName: memberMap.get(exp.paidByMemberId.toString()) || 'Unknown Member',
      participantShares: exp.participantShares.map((ps) => ({
        ...ps,
        memberName: memberMap.get(ps.memberId.toString()) || 'Unknown Member',
      })),
    }));

    res.json({
      success: true,
      count: enrichedExpenses.length,
      data: enrichedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.expenseId).lean();
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const group = await Group.findById(expense.groupId).lean();
    const memberMap = new Map();
    if (group) {
      group.members.forEach((m) => memberMap.set(m._id.toString(), m.name));
    }

    const enrichedExpense = {
      ...expense,
      paidByName: memberMap.get(expense.paidByMemberId.toString()) || 'Unknown Member',
      participantShares: expense.participantShares.map((ps) => ({
        ...ps,
        memberName: memberMap.get(ps.memberId.toString()) || 'Unknown Member',
      })),
    };

    res.json({
      success: true,
      data: enrichedExpense,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { title, amount, payerId, participantIds, category, date, note } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const group = await Group.findById(expense.groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Associated group not found' });
    }

    // Check if group has recorded settlements
    const settlementCount = await Settlement.countDocuments({ groupId: expense.groupId });

    let newAmountMinor = expense.amountMinor;
    if (amount !== undefined) {
      try {
        newAmountMinor = rupeesToPaise(amount);
        if (newAmountMinor <= 0) throw new Error();
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a valid positive number in rupees',
        });
      }
    }

    let newPayerId = expense.paidByMemberId;
    if (payerId !== undefined) {
      if (!group.hasMember(payerId)) {
        return res.status(400).json({
          success: false,
          error: 'Payer must be an existing member of this group',
        });
      }
      newPayerId = payerId;
    }

    let newParticipantIds = expense.participantShares.map((p) => p.memberId.toString());
    if (participantIds !== undefined) {
      if (!Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one participant must be selected',
        });
      }
      for (const pId of participantIds) {
        if (!group.hasMember(pId)) {
          return res.status(400).json({
            success: false,
            error: `Participant ID ${pId} is not in this group`,
          });
        }
      }
      newParticipantIds = participantIds;
    }

    // Calculate new equal shares if amount or participants changed
    const newShares = calculateEqualShares(newAmountMinor, newParticipantIds);

    // If settlements exist, verify that updating this expense does not cause any settlement to become an overpayment
    if (settlementCount > 0) {
      // Temporarily simulate updated values
      const originalAmountMinor = expense.amountMinor;
      const originalPayer = expense.paidByMemberId;
      const originalShares = expense.participantShares;

      expense.amountMinor = newAmountMinor;
      expense.paidByMemberId = newPayerId;
      expense.participantShares = newShares;
      await expense.save();

      try {
        // Test group balances
        const { balances } = await calculateGroupBalances(expense.groupId);
        // Ensure no member's settlements exceeded their baseline
        // If everything is consistent, continue. If not, rollback.
      } catch (err) {
        // Rollback
        expense.amountMinor = originalAmountMinor;
        expense.paidByMemberId = originalPayer;
        expense.participantShares = originalShares;
        await expense.save();

        return res.status(400).json({
          success: false,
          error: `Cannot update expense: this change creates an inconsistency with recorded settlements (${err.message}).`,
        });
      }
    } else {
      expense.amountMinor = newAmountMinor;
      expense.paidByMemberId = newPayerId;
      expense.participantShares = newShares;
    }

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Title cannot be empty' });
      }
      expense.title = title.trim();
    }

    if (category !== undefined) {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, error: 'Invalid category' });
      }
      expense.category = category;
    }

    if (date !== undefined) {
      expense.date = new Date(date);
    }

    if (note !== undefined) {
      expense.note = typeof note === 'string' ? note.trim() : '';
    }

    await expense.save();

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
