import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Scan / verify ticket QR at theatre entry
// @route   POST /api/tickets/verify
// @access  Admin / Theatre owner
export const verifyTicketScan = asyncHandler(async (req, res) => {
  const { ticketId } = req.body;

  if (!ticketId || !String(ticketId).trim()) {
    throw new ApiError(400, 'Ticket ID is required');
  }

  const booking = await Booking.findOne({ ticketId: String(ticketId).trim() }).populate({
    path: 'show',
    populate: [
      { path: 'movie', select: 'title' },
      { path: 'theatre', select: 'name city address' },
    ],
  });

  if (!booking) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { valid: false, message: 'Invalid ticket — not found in system' },
        'Invalid ticket'
      )
    );
  }

  if (booking.paymentStatus !== 'completed') {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: `Payment ${booking.paymentStatus} — do not allow entry`,
          booking,
        },
        'Unpaid ticket'
      )
    );
  }

  const alreadyScanned = !!booking.scannedAt;

  if (!alreadyScanned) {
    booking.scannedAt = new Date();
    booking.scannedBy = req.user?._id;
    await booking.save();
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        alreadyScanned,
        message: alreadyScanned
          ? 'Ticket already used — verify guest identity'
          : 'Valid ticket — entry allowed',
        booking: {
          ticketId: booking.ticketId,
          movie: booking.show?.movie?.title,
          theatre: booking.show?.theatre?.name,
          city: booking.show?.theatre?.city,
          time: booking.show?.time,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          paymentMethod: booking.paymentMethod,
          scannedAt: booking.scannedAt,
        },
      },
      'Ticket verified'
    )
  );
});

// @desc    Revenue from completed payments (admin)
// @route   GET /api/tickets/revenue
// @access  Admin
export const getPaymentRevenue = asyncHandler(async (req, res) => {
  const completed = await Booking.find({ paymentStatus: 'completed' });
  const totalRevenue = completed.reduce((sum, b) => sum + b.totalAmount, 0);
  const scanned = completed.filter((b) => b.scannedAt).length;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalBookings: completed.length,
        totalRevenue,
        currency: process.env.PAYMENT_CURRENCY || 'INR',
        ticketsScanned: scanned,
        recent: completed.slice(-10).reverse(),
      },
      'Revenue fetched'
    )
  );
});
