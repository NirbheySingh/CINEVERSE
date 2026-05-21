import express from 'express';
import {
  getMovies,
  getMovieById,
  getTrendingMovies,
  getUpcomingMovies,
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/trending', getTrendingMovies);
router.get('/upcoming', getUpcomingMovies);
router.get('/:id', getMovieById);

export default router;
