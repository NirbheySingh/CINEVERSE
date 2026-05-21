import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';

dotenv.config();

const times = ['10:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'];

const importShows = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Shows...');

    const movies = await Movie.find({}).limit(5);
    const theatres = await Theatre.find({}).limit(8);

    if (movies.length === 0) {
      console.log('No movies found. Run: node seeder.js');
      process.exit(1);
    }
    if (theatres.length === 0) {
      console.log('No theatres found. Run: node seederTheatres.js');
      process.exit(1);
    }

    await Show.deleteMany();

    const shows = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    movies.forEach((movie, mi) => {
      const theatre = theatres[mi % theatres.length];
      const screen = theatre.screens[0];
      if (!screen) return;

      times.forEach((time, ti) => {
        const date = new Date(today);
        date.setDate(date.getDate() + (ti % 3));
        shows.push({
          movie: movie._id,
          theatre: theatre._id,
          screenId: screen._id,
          date,
          time,
          bookedSeats: [],
        });
      });
    });

    await Show.insertMany(shows);
    console.log(`${shows.length} shows imported successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importShows();
