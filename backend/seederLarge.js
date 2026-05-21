import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

dotenv.config();

const movieTitles = [
  'Inception', 'Interstellar', 'The Dark Knight', 'Avatar', 'The Matrix', 
  'Gladiator', 'The Godfather', 'Pulp Fiction', 'Forrest Gump', 'The Shawshank Redemption',
  'Fight Club', 'The Lord of the Rings', 'Star Wars', 'Jurassic Park', 'Titanic',
  'The Avengers', 'Spider-Man', 'Black Panther', 'Iron Man', 'Joker',
  'Deadpool', 'Logan', 'Mad Max: Fury Road', 'John Wick', 'Die Hard',
  'Terminator 2', 'Alien', 'Blade Runner', 'The Shining', 'Psycho',
  'Goodfellas', 'Casino', 'The Departed', 'Wolf of Wall Street', 'Catch Me If You Can',
  'Dune', 'Oppenheimer', 'Tenet', 'Dunkirk', 'Memento',
  'The Prestige', 'Seven', 'Zodiac', 'Social Network', 'Gone Girl',
  'Parasite', 'Oldboy', 'Spirited Away', 'Princess Mononoke', 'Your Name',
  'A Quiet Place', 'Get Out', 'Us', 'Nope', 'Halloween'
];

const genresList = ['Action', 'Sci-Fi', 'Thriller', 'Drama', 'Comedy', 'Horror', 'Romance', 'Adventure', 'Fantasy', 'Crime', 'Animation'];

const mediaAssets = [
  {
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKdQ8emSGUEMjsS4yHAwrp.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0' // Inception
  },
  {
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjEVAZS3xZZIte61f3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E' // Interstellar
  },
  {
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY' // Dark Knight
  },
  {
    posterUrl: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' // Avengers
  },
  {
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8SPFPzAL.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=t06RUxPbpMAC' // Spider-Man
  }
];

const generateMovies = () => {
  return movieTitles.map((title, index) => {
    const asset = mediaAssets[index % mediaAssets.length];
    const g1 = genresList[Math.floor(Math.random() * genresList.length)];
    const g2 = genresList[Math.floor(Math.random() * genresList.length)];
    
    // Ensure we have at least 15 trending movies
    const isTrending = index < 15 || Math.random() > 0.7;
    
    return {
      title,
      description: `Experience the thrilling journey of ${title}, a cinematic masterpiece. Join the characters as they navigate through unexpected twists, profound drama, and breathtaking action sequences.`,
      duration: Math.floor(Math.random() * 60) + 90, // 90 to 150 mins
      releaseDate: new Date(new Date().setFullYear(2000 + Math.floor(Math.random() * 25))),
      genres: [...new Set([g1, g2])],
      posterUrl: asset.posterUrl,
      backdropUrl: asset.backdropUrl,
      trailerUrl: asset.trailerUrl,
      rating: parseFloat((Math.random() * 3 + 6.5).toFixed(1)), // 6.5 to 9.5
      isTrending,
    };
  });
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding 50+ Movies');

    await Movie.deleteMany();
    const movies = generateMovies();
    await Movie.insertMany(movies);

    console.log(`${movies.length} Movies Imported successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
