import express from 'express';
import {
  getDashboardSummary,
  getRecentExpenses,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/recent-expenses', getRecentExpenses);

export default router;
