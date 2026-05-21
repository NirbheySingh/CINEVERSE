import Movie from '../models/Movie.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { fallbackMovies } from '../data/fallbackMovies.js';

// @desc    Fetch all movies (with search and pagination)
// @route   GET /api/movies
// @access  Public
export const getMovies = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 50;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  let count = 0;
  let movies = [];
  
  if (mongoose.connection.readyState === 1) {
    try {
      count = await Movie.countDocuments({ ...keyword });
      let dbMovies = await Movie.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        
      // Patch missing posters from DB
      movies = dbMovies.map(movie => {
         const obj = movie.toObject ? movie.toObject() : movie;
         if (!obj.posterUrl || obj.posterUrl.length < 10 || obj.posterUrl.includes('undefined')) {
            const fb = fallbackMovies.find(f => f.title === obj.title) || fallbackMovies[0];
            obj.posterUrl = fb.posterUrl;
            obj.backdropUrl = fb.backdropUrl;
         }
         return obj;
      });
    } catch (error) {
      console.log("DB fetch failed, falling back to JSON");
    }
  } else {
    console.log("DB disconnected, instantly serving fallback JSON");
  }

  // FALLBACK SYSTEM: Bypass DB if empty or blocked
  if (!movies || movies.length === 0) {
    movies = fallbackMovies;
    if (req.query.keyword) {
       movies = movies.filter(m => m.title.toLowerCase().includes(req.query.keyword.toLowerCase()));
    }
    count = movies.length;
  }

  res.status(200).json(
    new ApiResponse(200, { movies, page, pages: Math.ceil(count / pageSize) }, 'Movies fetched successfully')
  );
});

// @desc    Fetch a single movie by ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = asyncHandler(async (req, res) => {
  let movie = null;
  
  if (mongoose.connection.readyState === 1) {
    try {
      let dbMovie = await Movie.findById(req.params.id);
      if (dbMovie) {
         movie = dbMovie.toObject ? dbMovie.toObject() : dbMovie;
         if (!movie.posterUrl || movie.posterUrl.length < 10 || movie.posterUrl.includes('undefined')) {
            const fb = fallbackMovies.find(f => f.title === movie.title) || fallbackMovies[0];
            movie.posterUrl = fb.posterUrl;
            movie.backdropUrl = fb.backdropUrl;
         }
      }
    } catch (error) {
      console.log("DB findById failed, falling back to JSON");
    }
  }

  // FALLBACK SYSTEM
  if (!movie) {
    movie = fallbackMovies.find(m => m._id === req.params.id);
  }

  if (movie) {
    res.status(200).json(new ApiResponse(200, movie, 'Movie fetched successfully'));
  } else {
    throw new ApiError(404, 'Movie not found');
  }
});

// @desc    Fetch trending movies
// @route   GET /api/movies/trending
// @access  Public
export const getTrendingMovies = asyncHandler(async (req, res) => {
  let movies = [];
  
  if (mongoose.connection.readyState === 1) {
    try {
      let dbMovies = await Movie.find({ isTrending: true }).limit(50);
      movies = dbMovies.map(movie => {
         const obj = movie.toObject ? movie.toObject() : movie;
         if (!obj.posterUrl || obj.posterUrl.length < 10 || obj.posterUrl.includes('undefined')) {
            const fb = fallbackMovies.find(f => f.title === obj.title) || fallbackMovies[0];
            obj.posterUrl = fb.posterUrl;
            obj.backdropUrl = fb.backdropUrl;
         }
         return obj;
      });
    } catch (error) {
      console.log("DB trending fetch failed, falling back to JSON");
    }
  }

  if (!movies || movies.length === 0) {
    movies = fallbackMovies.filter(m => m.isTrending).slice(0, 50);
  }

  res.status(200).json(new ApiResponse(200, movies, 'Trending movies fetched'));
});

// @desc    Fetch upcoming movies
// @route   GET /api/movies/upcoming
// @access  Public
export const getUpcomingMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ isUpcoming: true }).limit(50);
  res.status(200).json(new ApiResponse(200, movies, 'Upcoming movies fetched'));
});
