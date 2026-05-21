import express from 'express';
import { verifyTicketScan, getPaymentRevenue } from '../controllers/ticketController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/verify',
  protect,
  authorizeRoles('admin', 'theatre_owner'),
  verifyTicketScan
);

router.get('/revenue', protect, authorizeRoles('admin'), getPaymentRevenue);

export default router;
