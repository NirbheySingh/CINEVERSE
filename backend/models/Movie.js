import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Please add a poster image URL'],
    },
    backdropUrl: {
      type: String,
      required: [true, 'Please add a backdrop image URL'],
    },
    trailerUrl: {
      type: String,
      // Will integrate with YouTube/TMDB in Phase 6
    },
    duration: {
      type: Number, // In minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    cast: [
      {
        name: String,
        role: String,
        profileImageUrl: String,
      },
    ],
    crew: [
      {
        name: String,
        role: String,
        profileImageUrl: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
