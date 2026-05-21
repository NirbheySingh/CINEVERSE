import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const moviesCount = await Movie.countDocuments();
  const showsCount = await Show.countDocuments();
  const bookings = await Booking.find({ paymentStatus: 'completed' });

  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: totalRevenue > 0 ? totalRevenue : 6000 },
  ];

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers: usersCount,
        totalMovies: moviesCount,
        totalShows: showsCount,
        totalBookings: bookings.length,
        totalRevenue,
        revenueData,
      },
      'Admin stats fetched'
    )
  );
});

// @desc    Get movies & theatres for show creation form
// @route   GET /api/admin/form-options
// @access  Private/Admin
export const getAdminFormOptions = asyncHandler(async (req, res) => {
  const movies = await Movie.find({}).select('title posterUrl').sort({ title: 1 });
  const theatres = await Theatre.find({}).select('name city screens').sort({ city: 1, name: 1 });

  const theatresWithScreens = theatres.map((t) => ({
    _id: t._id,
    name: t.name,
    city: t.city,
    screens: t.screens.map((s) => ({
      _id: s._id,
      name: s.name,
      capacity: s.capacity,
    })),
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      { movies, theatres: theatresWithScreens },
      'Form options fetched'
    )
  );
});

// @desc    Get all shows (admin)
// @route   GET /api/admin/shows
// @access  Private/Admin
export const getAdminShows = asyncHandler(async (req, res) => {
  const shows = await Show.find({})
    .populate('movie', 'title posterUrl duration')
    .populate('theatre', 'name city')
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, shows, 'Shows fetched'));
});

// @desc    Create a new show
// @route   POST /api/admin/shows
// @access  Private/Admin
export const createAdminShow = asyncHandler(async (req, res) => {
  const { movieId, theatreId, screenId, date, time } = req.body;

  if (!movieId || !theatreId || !screenId || !date || !time) {
    throw new ApiError(400, 'Movie, theatre, screen, date, and time are required');
  }

  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new ApiError(404, 'Movie not found');
  }

  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new ApiError(404, 'Theatre not found');
  }

  const screen = theatre.screens.id(screenId);
  if (!screen) {
    throw new ApiError(400, 'Invalid screen for this theatre');
  }

  const showDate = new Date(date);
  if (Number.isNaN(showDate.getTime())) {
    throw new ApiError(400, 'Invalid date');
  }

  const show = await Show.create({
    movie: movieId,
    theatre: theatreId,
    screenId,
    date: showDate,
    time: time.trim(),
    bookedSeats: [],
  });

  const populated = await Show.findById(show._id)
    .populate('movie', 'title posterUrl duration')
    .populate('theatre', 'name city');

  res.status(201).json(new ApiResponse(201, populated, 'Show created successfully'));
});

// @desc    Delete a show
// @route   DELETE /api/admin/shows/:id
// @access  Private/Admin
export const deleteAdminShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (!show) {
    throw new ApiError(404, 'Show not found');
  }

  const bookingCount = await Booking.countDocuments({ show: show._id });
  if (bookingCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete show with ${bookingCount} existing booking(s). Cancel bookings first.`
    );
  }

  await show.deleteOne();

  res.status(200).json(new ApiResponse(200, { _id: req.params.id }, 'Show deleted successfully'));
});
