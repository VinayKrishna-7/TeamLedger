import mongoose from 'mongoose';
import { Group } from '../models/Group.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';

export const addMember = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Member name is required and cannot be empty',
      });
    }

    const trimmedName = name.trim();
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check for duplicate member name in group
    const alreadyExists = group.members.some(
      (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        error: `A member named "${trimmedName}" already exists in this group`,
      });
    }

    const newMember = {
      _id: new mongoose.Types.ObjectId(),
      name: trimmedName,
      createdAt: new Date(),
    };

    group.members.push(newMember);
    await group.save();

    res.status(201).json({
      success: true,
      data: newMember,
      message: `Member "${trimmedName}" added successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { groupId, memberId } = req.params;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Member name cannot be empty',
      });
    }

    const trimmedName = name.trim();
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const member = group.members.id(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in this group',
      });
    }

    // Check if new name conflicts with an existing member
    const nameConflict = group.members.some(
      (m) => m._id.toString() !== memberId && m.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameConflict) {
      return res.status(400).json({
        success: false,
        error: `Another member named "${trimmedName}" already exists in this group`,
      });
    }

    member.name = trimmedName;
    await group.save();

    res.json({
      success: true,
      data: member,
      message: `Member renamed to "${trimmedName}" successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const member = group.members.id(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in this group',
      });
    }

    if (group.members.length <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the only member in a group. Add another member first or delete the entire group.',
      });
    }

    // Safety validation: check if member is tied to any expenses
    const [expenseCount, settlementCount] = await Promise.all([
      Expense.countDocuments({
        groupId,
        $or: [
          { paidByMemberId: memberId },
          { 'participantShares.memberId': memberId },
        ],
      }),
      Settlement.countDocuments({
        groupId,
        $or: [
          { paidByMemberId: memberId },
          { receivedByMemberId: memberId },
        ],
      }),
    ]);

    if (expenseCount > 0 || settlementCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot remove ${member.name} because they are associated with ${expenseCount} expense(s) and ${settlementCount} settlement(s). Please delete or reassign those records first to preserve financial ledger integrity.`,
      });
    }

    // Safe to remove
    group.members.pull({ _id: memberId });
    await group.save();

    res.json({
      success: true,
      message: `Member "${member.name}" removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};
