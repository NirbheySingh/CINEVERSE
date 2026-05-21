import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  normalizePaymentMethod,
  parseSeatSelection,
} from '../utils/paymentUtils.js';
import {
  createPendingBooking,
  completeBookingPayment,
  failBookingPayment,
} from '../utils/bookingPaymentUtils.js';

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const isRazorpayConfigured = () => {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret && id !== 'your_razorpay_key_id' && secret !== 'your_razorpay_key_secret';
};

const isStripeConfigured = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return key && key !== 'your_stripe_secret_here';
};

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// @desc    Start real payment — Razorpay (INR → your bank) or Stripe (USD/card)
// @route   POST /api/payments/process
// @access  Public (optional auth)
export const processPayment = asyncHandler(async (req, res) => {
  const {
    showId,
    seats,
    subtotal,
    finalAmount,
    paymentMethod = 'card',
    movieTitle,
    theatreName,
    time,
  } = req.body;

  if (!showId || !mongoose.Types.ObjectId.isValid(showId)) {
    throw new ApiError(400, 'Valid show is required. Book from theatre & show selection.');
  }

  if (!isRazorpayConfigured() && !isStripeConfigured()) {
    throw new ApiError(
      503,
      'Payment gateway not configured. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET (India) or STRIPE_SECRET_KEY to backend/.env. See PAYMENTS_SETUP.md.'
    );
  }

  const parsedSeats = parseSeatSelection(seats, subtotal ? subtotal / (seats?.length || 1) : 15);
  if (parsedSeats.length === 0) {
    throw new ApiError(400, 'Please select at least one seat');
  }

  const amount = Number(finalAmount ?? subtotal);
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Invalid payment amount');
  }

  const method = normalizePaymentMethod(paymentMethod);
  const currency = process.env.PAYMENT_CURRENCY || (isRazorpayConfigured() ? 'INR' : 'USD');

  const booking = await createPendingBooking({
    showId,
    parsedSeats,
    amount,
    method,
    userId: req.user?._id,
    currency,
  });

  // Razorpay — money settles to your linked Indian bank account
  if (isRazorpayConfigured()) {
    const razorpay = getRazorpay();
    const amountPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: booking.ticketId,
      notes: {
        bookingId: String(booking._id),
        ticketId: booking.ticketId,
        movieTitle: movieTitle || '',
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          provider: 'razorpay',
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          orderId: order.id,
          amount: amountPaise,
          currency,
          bookingId: booking._id,
          ticketId: booking.ticketId,
          movieTitle,
          theatreName,
          time,
          seats: parsedSeats.map((s) => `${s.row}${s.number}`),
          totalAmount: amount,
        },
        'Razorpay order created — complete payment in checkout'
      )
    );
  }

  // Stripe — money settles to your Stripe balance → bank payout
  if (isStripeConfigured()) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const populated = await Booking.findById(booking._id).populate({
      path: 'show',
      populate: { path: 'movie', select: 'title' },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${populated.show?.movie?.title || movieTitle || 'Movie Tickets'}`,
              description: `${parsedSeats.length} seat(s) — ${booking.ticketId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl()}/ticket/${booking.ticketId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl()}/checkout?canceled=true&bookingId=${booking._id}`,
      client_reference_id: String(booking._id),
      metadata: {
        ticketId: booking.ticketId,
        bookingId: String(booking._id),
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          provider: 'stripe',
          url: session.url,
          sessionId: session.id,
          bookingId: booking._id,
          ticketId: booking.ticketId,
          movieTitle,
          theatreName,
          time,
          totalAmount: amount,
        },
        'Redirecting to Stripe Checkout'
      )
    );
  }

  await failBookingPayment(booking);
  throw new ApiError(503, 'No payment provider available');
});

// @desc    Verify Razorpay payment after customer pays
// @route   POST /api/payments/razorpay/verify
// @access  Public
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing Razorpay payment details');
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature — payment not verified');
  }

  let booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
  if (!booking && bookingId) {
    booking = await Booking.findById(bookingId);
  }

  if (!booking) {
    throw new ApiError(404, 'Booking not found for this payment');
  }

  if (booking.paymentStatus === 'completed') {
    return res.status(200).json(new ApiResponse(200, booking, 'Already confirmed'));
  }

  await completeBookingPayment(booking, { razorpayPaymentId: razorpay_payment_id });

  const populated = await Booking.findById(booking._id).populate({
    path: 'show',
    populate: [
      { path: 'movie', select: 'title posterUrl backdropUrl' },
      { path: 'theatre', select: 'name city' },
    ],
  });

  res.status(200).json(new ApiResponse(200, populated, 'Payment verified — ticket is valid'));
});

// @desc    Verify Stripe session after redirect
// @route   GET /api/payments/stripe/verify
// @access  Public
export const verifyStripeSession = asyncHandler(async (req, res) => {
  const { session_id } = req.query;
  if (!session_id || !isStripeConfigured()) {
    throw new ApiError(400, 'Invalid session');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== 'paid') {
    throw new ApiError(400, 'Payment not completed');
  }

  const booking = await Booking.findById(session.client_reference_id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.paymentStatus !== 'completed') {
    await completeBookingPayment(booking, { stripeSessionId: session.id });
  }

  const populated = await Booking.findById(booking._id).populate({
    path: 'show',
    populate: [
      { path: 'movie', select: 'title posterUrl backdropUrl' },
      { path: 'theatre', select: 'name city' },
    ],
  });

  res.status(200).json(new ApiResponse(200, populated, 'Stripe payment confirmed'));
});

// @desc    Stripe webhook (production)
// @route   POST /api/payments/webhook/stripe
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || secret === 'your_stripe_webhook_secret_here') {
    return res.status(200).send('Webhook secret not configured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const booking = await Booking.findById(session.client_reference_id);
    if (booking && booking.paymentStatus === 'pending') {
      await completeBookingPayment(booking, { stripeSessionId: session.id });
    }
  }

  res.json({ received: true });
});

export const createCheckoutSession = processPayment;

export const confirmPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  let booking = await Booking.findById(bookingId);
  if (!booking) {
    booking = await Booking.findOne({ ticketId: bookingId });
  }
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  if (booking.paymentStatus !== 'completed') {
    throw new ApiError(402, 'Payment not completed yet');
  }
  res.status(200).json(new ApiResponse(200, booking, 'Payment confirmed'));
});

export const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const booking = await Booking.findOne({ ticketId }).populate({
    path: 'show',
    populate: [
      { path: 'movie', select: 'title posterUrl backdropUrl' },
      { path: 'theatre', select: 'name city' },
    ],
  });

  if (!booking) {
    throw new ApiError(404, 'Ticket not found');
  }

  res.status(200).json(new ApiResponse(200, booking, 'Ticket fetched'));
});

export const getPaymentConfig = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpay: isRazorpayConfigured(),
        stripe: isStripeConfigured(),
        currency: process.env.PAYMENT_CURRENCY || (isRazorpayConfigured() ? 'INR' : 'USD'),
        razorpayKeyId: isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : null,
      },
      'Payment config'
    )
  );
});
