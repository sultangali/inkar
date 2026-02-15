import express from 'express';
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceAvailability
} from '../controllers/workspaceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getWorkspaces)
  .post(protect, authorize('admin', 'moderator'), createWorkspace);

router.route('/:id')
  .get(getWorkspace)
  .put(protect, authorize('admin', 'moderator'), updateWorkspace)
  .delete(protect, authorize('admin'), deleteWorkspace);

router.get('/:id/availability', getWorkspaceAvailability);

export default router;

