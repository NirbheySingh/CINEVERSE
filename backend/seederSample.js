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
    https.get('https://api.sampleapis.com/movies/drama', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
};

const targetGenres = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Adventure'];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Premium Photo Covers...');

    const db = await fetchMovies();
    // Filter out missing posters and take exactly 50
    const rawMovies = db.filter(m => m.posterURL && m.posterURL.startsWith('http')).slice(0, 50);

    const formattedMovies = rawMovies.map((m, index) => {
      const trailer = trailerPool[index % trailerPool.length];
      
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
        description: `Experience the thrilling journey of ${m.title}, a true masterpiece of modern cinema.`,
        duration: Math.floor(Math.random() * 60) + 90,
        releaseDate: new Date(2000 + Math.floor(Math.random() * 24), 0, 1),
        genres: assignedGenres.length > 0 ? assignedGenres : ['Action'],
        posterUrl: m.posterURL,
        backdropUrl: m.posterURL, // Will be used alongside CSS gradient blur
        trailerUrl: `https://www.youtube.com/watch?v=${trailer}`,
        rating: (Math.random() * 3 + 6.5).toFixed(1),
        isTrending: index < 15 // Top 15 in the trending row
      };
    });

    await Movie.deleteMany();
    await Movie.insertMany(formattedMovies);

    console.log(`Exactly ${formattedMovies.length} movies with active premium photo covers imported!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
