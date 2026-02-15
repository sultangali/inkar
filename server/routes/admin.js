import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin/moderator role
router.use(protect);

router.route('/users')
  .get(authorize('admin', 'moderator'), getAllUsers);

router.route('/users/:id')
  .get(authorize('admin', 'moderator'), getUser)
  .delete(authorize('admin'), deleteUser);

router.patch('/users/:id/role', authorize('admin'), updateUserRole);

export default router;

