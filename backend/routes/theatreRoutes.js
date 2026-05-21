import express from 'express';
import {
  getTheatres,
  getShowsForMovie,
  getShowDetails,
} from '../controllers/theatreController.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/shows', getShowsForMovie);
router.get('/shows/:id', getShowDetails);

export default router;
