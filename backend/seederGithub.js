import mongoose from 'mongoose';
import dotenv from 'dotenv';
import https from 'https';
import Movie from './models/Movie.js';

dotenv.config();

const trailerPool = [
  "YoHD9XEInc0", "zSWdZVtXT7E", "EXeTwQWrcwY", "5PSNL1qE6VY", "vKQi3bBA1y8", 
  "owK1qxDselE", "sY1S34973zA", "s7EdQ4FqbhY", "bLvqoHBptjg", "6hB3S9bIaco",
  "eOrNdBpGMv8", "xjDjIWPwcPU", "8ugaeA-nMTc", "zAGVQLHvwOY", "Div0iP65aZo"
];

const fetchMovies = () => {
  return new Promise((resolve, reject) => {
    https.get('https://raw.githubusercontent.com/erik-sytnyk/movies-list/master/db.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Real Photo Covers...');

    // Fetch the raw JSON dataset
    const db = await fetchMovies();
    // Filter out movies without valid posters and take exactly 50
    const rawMovies = db.movies.filter(m => m.posterUrl && m.posterUrl.startsWith('http')).slice(0, 50);

    const targetGenres = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Adventure'];

    const formattedMovies = rawMovies.map((m, index) => {
      // Pick a random trailer from the pool
      const trailer = trailerPool[index % trailerPool.length];
      
      // Assign 1 or 2 random genres from our specific frontend list to ensure tabs work perfectly
      const numGenres = Math.random() > 0.5 ? 2 : 1;
      const assignedGenres = [];
      for(let i=0; i<numGenres; i++) {
        const randomGenre = targetGenres[Math.floor(Math.random() * targetGenres.length)];
        if(!assignedGenres.includes(randomGenre)) {
          assignedGenres.push(randomGenre);
        }
      }
      
      return {
        title: m.title,
        description: m.plot || `Experience the thrilling journey of ${m.title}.`,
        duration: parseInt(m.runtime) || 120,
        releaseDate: new Date(m.year, 0, 1),
        genres: assignedGenres.length > 0 ? assignedGenres : ['Action'],
        posterUrl: m.posterUrl,
        backdropUrl: m.posterUrl,
        trailerUrl: `https://www.youtube.com/watch?v=${trailer}`,
        rating: (Math.random() * 3 + 6.5).toFixed(1),
        isTrending: index < 15 // Make top 15 trending
      };
    });

    await Movie.deleteMany();
    await Movie.insertMany(formattedMovies);

    console.log(`Exactly ${formattedMovies.length} totally distinct movies with real photo covers imported!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
