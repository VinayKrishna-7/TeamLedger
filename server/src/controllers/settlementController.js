import mongoose from 'mongoose';
import { Group } from '../models/Group.js';
import { Settlement } from '../models/Settlement.js';
import { rupeesToPaise } from '../services/splitService.js';
import { validateSettlementRules, calculateGroupBalances } from '../services/balanceService.js';

export const createSettlement = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { paidByMemberId, receivedByMemberId, amount, date, note } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    if (!paidByMemberId || !receivedByMemberId) {
      return res.status(400).json({
        success: false,
        error: 'Both payer (debtor) and receiver (creditor) member IDs are required',
      });
    }

    let amountMinor;
    try {
      amountMinor = rupeesToPaise(amount);
      if (amountMinor <= 0) throw new Error();
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Settlement amount must be a positive number in rupees',
      });
    }

    // Validate using financial rules
    await validateSettlementRules(groupId, paidByMemberId, receivedByMemberId, amountMinor);

    const settlement = await Settlement.create({
      groupId,
      paidByMemberId,
      receivedByMemberId,
      amountMinor,
      currency: 'INR',
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
    });

    const updatedBalances = await calculateGroupBalances(groupId);

    res.status(201).json({
      success: true,
      data: settlement,
      updatedBalances,
      message: 'Settlement payment recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupSettlements = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const settlements = await Settlement.find({ groupId }).sort({ date: -1, createdAt: -1 }).lean();

    const memberMap = new Map();
    group.members.forEach((m) => memberMap.set(m._id.toString(), m.name));

    const enrichedSettlements = settlements.map((s) => ({
      ...s,
      paidByName: memberMap.get(s.paidByMemberId.toString()) || 'Unknown Member',
      receivedByName: memberMap.get(s.receivedByMemberId.toString()) || 'Unknown Member',
    }));

    res.json({
      success: true,
      count: enrichedSettlements.length,
      data: enrichedSettlements,
    });
  } catch (error) {
    next(error);
  }
};
