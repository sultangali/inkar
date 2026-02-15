import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
  getContactStats
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - anyone can send a message
router.post('/', createContactMessage);

// Protected routes - only admin/moderator can access
router.get('/stats', protect, authorize('admin', 'moderator'), getContactStats);
router.get('/', protect, authorize('admin', 'moderator'), getContactMessages);
router.get('/:id', protect, authorize('admin', 'moderator'), getContactMessage);
router.patch('/:id', protect, authorize('admin', 'moderator'), updateContactMessage);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

export default router;

