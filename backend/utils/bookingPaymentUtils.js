import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { generateTicketId } from './paymentUtils.js';

export const lockSeatsOnShow = async (show, parsedSeats) => {
  const conflict = show.bookedSeats.some((bs) =>
    parsedSeats.some((s) => s.row === bs.row && s.number === bs.number)
  );
  if (conflict) {
    throw new ApiError(400, 'One or more seats are already booked');
  }

  show.bookedSeats.push(
    ...parsedSeats.map((s) => ({
      row: s.row,
      number: s.number,
      status: 'locked',
      lockedAt: new Date(),
    }))
  );
  await show.save();
};

export const confirmSeatsOnShow = async (showId, parsedSeats) => {
  const show = await Show.findById(showId);
  if (!show) return;

  parsedSeats.forEach((seat) => {
    const entry = show.bookedSeats.find(
      (bs) => bs.row === seat.row && bs.number === seat.number
    );
    if (entry) {
      entry.status = 'booked';
      entry.lockedAt = undefined;
    }
  });
  await show.save();
};

export const releaseSeatsOnShow = async (showId, parsedSeats) => {
  const show = await Show.findById(showId);
  if (!show) return;

  show.bookedSeats = show.bookedSeats.filter(
    (bs) =>
      !parsedSeats.some((s) => s.row === bs.row && s.number === bs.number)
  );
  await show.save();
};

export const createPendingBooking = async ({
  showId,
  parsedSeats,
  amount,
  method,
  userId,
  currency = 'INR',
}) => {
  const show = await Show.findById(showId);
  if (!show) {
    throw new ApiError(404, 'Show not found');
  }

  await lockSeatsOnShow(show, parsedSeats);

  const ticketId = generateTicketId();
  const booking = await Booking.create({
    user: userId,
    show: showId,
    seats: parsedSeats,
    totalAmount: amount,
    paymentMethod: method,
    paymentStatus: 'pending',
    ticketId,
    currency,
  });

  return booking;
};

export const completeBookingPayment = async (booking, paymentMeta = {}) => {
  booking.paymentStatus = 'completed';
  if (paymentMeta.razorpayPaymentId) {
    booking.razorpayPaymentId = paymentMeta.razorpayPaymentId;
  }
  if (paymentMeta.stripeSessionId) {
    booking.stripeSessionId = paymentMeta.stripeSessionId;
  }
  await booking.save();
  await confirmSeatsOnShow(booking.show, booking.seats);
  return booking;
};

export const failBookingPayment = async (booking) => {
  booking.paymentStatus = 'failed';
  await booking.save();
  await releaseSeatsOnShow(booking.show, booking.seats);
  return booking;
};
