import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
export const getTheatres = asyncHandler(async (req, res) => {
  const theatres = await Theatre.find({});
  res.status(200).json(new ApiResponse(200, theatres, 'Theatres fetched'));
});

// @desc    Get shows for a specific movie in a specific city
// @route   GET /api/theatres/shows?movieId=...&city=...
// @access  Public
export const getShowsForMovie = asyncHandler(async (req, res) => {
  const { movieId, city } = req.query;

  if (!movieId || !city) {
    throw new ApiError(400, 'Movie ID and City are required');
  }

  // Find theatres in the city
  const theatres = await Theatre.find({ city });
  const theatreIds = theatres.map(t => t._id);

  // Find shows for this movie in these theatres
  const shows = await Show.find({
    movie: movieId,
    theatre: { $in: theatreIds },
    // date: { $gte: new Date() } // Future shows only
  }).populate('theatre', 'name address facilities screens');

  res.status(200).json(new ApiResponse(200, shows, 'Shows fetched successfully'));
});

// @desc    Get specific show details (including seats)
// @route   GET /api/theatres/shows/:id
// @access  Public
export const getShowDetails = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id).populate('theatre').populate('movie', 'title posterUrl');
  
  if (!show) {
    throw new ApiError(404, 'Show not found');
  }

  // Find the specific screen layout
  const screen = show.theatre.screens.id(show.screenId);

  res.status(200).json(new ApiResponse(200, { show, screenLayout: screen.seatLayout }, 'Show details fetched'));
});
