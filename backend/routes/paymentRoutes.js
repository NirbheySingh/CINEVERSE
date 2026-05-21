import express from 'express';
import {
  processPayment,
  verifyRazorpayPayment,
  verifyStripeSession,
  stripeWebhook,
  createCheckoutSession,
  confirmPayment,
  getTicketById,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/optionalAuthMiddleware.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/process', optionalAuth, processPayment);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.get('/stripe/verify', verifyStripeSession);
router.post('/create-checkout-session', optionalAuth, createCheckoutSession);
router.get('/ticket/:ticketId', getTicketById);
router.put('/:bookingId/confirm', confirmPayment);

export default router;
