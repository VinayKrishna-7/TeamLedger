import mongoose from 'mongoose';
import { Group } from '../models/Group.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { calculateGroupBalances } from '../services/balanceService.js';

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, memberNames } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Group name is required',
      });
    }

    if (!Array.isArray(memberNames) || memberNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one member is required to create a group',
      });
    }

    // Clean member names and check for duplicates (case-insensitive)
    const cleanedNames = memberNames
      .map((n) => (typeof n === 'string' ? n.trim() : ''))
      .filter((n) => n.length > 0);

    if (cleanedNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one valid member name',
      });
    }

    const seenNames = new Set();
    const members = [];

    for (const memberName of cleanedNames) {
      const lower = memberName.toLowerCase();
      if (seenNames.has(lower)) {
        return res.status(400).json({
          success: false,
          error: `Duplicate member name detected: "${memberName}". Each member in a group must have a unique name.`,
        });
      }
      seenNames.add(lower);
      members.push({
        _id: new mongoose.Types.ObjectId(),
        name: memberName,
        createdAt: new Date(),
      });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      members,
    });

    res.status(201).json({
      success: true,
      data: group,
      message: 'Group created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 }).lean();

    // Enrich groups with spending and unsettled summary
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        try {
          const balanceData = await calculateGroupBalances(group._id);
          const expenseCount = await Expense.countDocuments({ groupId: group._id });
          const settlementCount = await Settlement.countDocuments({ groupId: group._id });

          return {
            ...group,
            memberCount: group.members.length,
            expenseCount,
            settlementCount,
            totalSpendingMinor: balanceData.totalSpendingMinor,
            totalUnsettledDebtMinor: balanceData.totalUnsettledDebtMinor,
          };
        } catch {
          return {
            ...group,
            memberCount: group.members.length,
            expenseCount: 0,
            settlementCount: 0,
            totalSpendingMinor: 0,
            totalUnsettledDebtMinor: 0,
          };
        }
      })
    );

    res.json({
      success: true,
      count: enrichedGroups.length,
      data: enrichedGroups,
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId).lean();
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const balanceData = await calculateGroupBalances(group._id);
    const expenseCount = await Expense.countDocuments({ groupId: group._id });
    const settlementCount = await Settlement.countDocuments({ groupId: group._id });

    res.json({
      success: true,
      data: {
        ...group,
        expenseCount,
        settlementCount,
        totalSpendingMinor: balanceData.totalSpendingMinor,
        totalSettledMinor: balanceData.totalSettledMinor,
        totalUnsettledDebtMinor: balanceData.totalUnsettledDebtMinor,
        memberBalances: balanceData.balances,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Group name cannot be empty',
        });
      }
      group.name = name.trim();
    }

    if (description !== undefined) {
      group.description = typeof description === 'string' ? description.trim() : '';
    }

    await group.save();

    res.json({
      success: true,
      data: group,
      message: 'Group updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Cascade delete associated expenses and settlements
    const [deletedExpenses, deletedSettlements] = await Promise.all([
      Expense.deleteMany({ groupId: group._id }),
      Settlement.deleteMany({ groupId: group._id }),
    ]);

    await group.deleteOne();

    res.json({
      success: true,
      message: `Group "${group.name}" and all associated ${deletedExpenses.deletedCount} expenses and ${deletedSettlements.deletedCount} settlements were successfully deleted`,
    });
  } catch (error) {
    next(error);
  }
};
