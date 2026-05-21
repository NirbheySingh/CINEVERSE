import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Create new booking (and lock seats temporarily)
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats, totalAmount, paymentMethod } = req.body;

  if (!seats || seats.length === 0) {
    throw new ApiError(400, 'No seats selected');
  }

  // Find the show
  const show = await Show.findById(showId);
  if (!show) {
    throw new ApiError(404, 'Show not found');
  }

  // Check if seats are already booked
  const isAlreadyBooked = show.bookedSeats.some(bs => 
    seats.some(s => s.row === bs.row && s.number === bs.number)
  );

  if (isAlreadyBooked) {
    throw new ApiError(400, 'One or more selected seats are already booked or locked');
  }

  // Generate a random ticket ID
  const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    show: showId,
    seats,
    totalAmount,
    paymentMethod,
    paymentStatus: 'pending', // Will be updated by Payment phase
    ticketId
  });

  // Temporarily lock the seats in the show model
  const lockedSeats = seats.map(s => ({
    row: s.row,
    number: s.number,
    status: 'booked', // Skipping 'locked' state for simplicity in Phase 7
  }));

  show.bookedSeats.push(...lockedSeats);
  await show.save();

  res.status(201).json(new ApiResponse(201, booking, 'Booking created successfully'));
});

// @desc    Get user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: 'show',
      populate: [
        { path: 'movie', select: 'title posterUrl' },
        { path: 'theatre', select: 'name city address' }
      ]
    });

  res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched'));
});
