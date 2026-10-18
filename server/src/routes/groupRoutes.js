import express from 'express';
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from '../controllers/groupController.js';
import {
  addMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';
import {
  createExpense,
  getGroupExpenses,
} from '../controllers/expenseController.js';
import {
  getBalances,
  getSettlementPlan,
} from '../controllers/balanceController.js';
import {
  createSettlement,
  getGroupSettlements,
} from '../controllers/settlementController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// Group CRUD
router.route('/')
  .get(getAllGroups)
  .post(createGroup);

router.route('/:groupId')
  .all(validateObjectId('groupId'))
  .get(getGroupById)
  .patch(updateGroup)
  .delete(deleteGroup);

// Member Routes
router.route('/:groupId/members')
  .all(validateObjectId('groupId'))
  .post(addMember);

router.route('/:groupId/members/:memberId')
  .all(validateObjectId('groupId'), validateObjectId('memberId'))
  .patch(updateMember)
  .delete(deleteMember);

// Group Expenses
router.route('/:groupId/expenses')
  .all(validateObjectId('groupId'))
  .get(getGroupExpenses)
  .post(createExpense);

// Balances & Settlement Plan
router.route('/:groupId/balances')
  .all(validateObjectId('groupId'))
  .get(getBalances);

router.route('/:groupId/settlement-plan')
  .all(validateObjectId('groupId'))
  .get(getSettlementPlan);

// Settlements
router.route('/:groupId/settlements')
  .all(validateObjectId('groupId'))
  .get(getGroupSettlements)
  .post(createSettlement);

export default router;
