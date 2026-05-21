import express from 'express';
import {
  registerUser,
  loginUser,
  adminLogin,
  logoutUser,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);

export default router;
