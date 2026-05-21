import express from 'express';
import {
  getAdminStats,
  getAdminFormOptions,
  getAdminShows,
  createAdminShow,
  deleteAdminShow,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/form-options', getAdminFormOptions);
router.get('/shows', getAdminShows);
router.post('/shows', createAdminShow);
router.delete('/shows/:id', deleteAdminShow);

export default router;
