import { calculateGroupBalances } from '../services/balanceService.js';
import { getGroupSettlementPlan } from '../services/settlementService.js';

export const getBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const balanceData = await calculateGroupBalances(groupId);

    res.json({
      success: true,
      data: balanceData,
    });
  } catch (error) {
    next(error);
  }
};

export const getSettlementPlan = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const plan = await getGroupSettlementPlan(groupId);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};
