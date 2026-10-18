import express from 'express';
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/:expenseId')
  .all(validateObjectId('expenseId'))
  .get(getExpenseById)
  .patch(updateExpense)
  .delete(deleteExpense);

export default router;
