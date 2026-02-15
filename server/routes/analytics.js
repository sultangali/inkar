import express from 'express';
import {
  getKPI,
  getRevenueData,
  getWorkspacePopularity,
  getRevenueByType,
  getPaymentMethodDistribution,
  getBookingTrends,
  getUserStatistics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require admin or moderator role
router.use(protect);
router.use(authorize('admin', 'moderator'));

router.get('/kpi', getKPI);
router.get('/revenue', getRevenueData);
router.get('/workspace-popularity', getWorkspacePopularity);
router.get('/revenue-by-type', getRevenueByType);
router.get('/payment-methods', getPaymentMethodDistribution);
router.get('/booking-trends', getBookingTrends);
router.get('/users', getUserStatistics);

export default router;

