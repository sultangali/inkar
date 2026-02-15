import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  cancelBooking,
  confirmBooking,
  completeBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyBookings)
  .post(protect, createBooking);

router.get('/all', protect, authorize('admin', 'moderator', 'employee'), getAllBookings);

router.get('/:id', protect, getBooking);

router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/confirm', protect, authorize('admin', 'moderator', 'employee'), confirmBooking);
router.patch('/:id/complete', protect, authorize('admin', 'moderator', 'employee'), completeBooking);

export default router;

