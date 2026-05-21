import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

dotenv.config();

const moviesData = [
  { title: "Inception", trailer: "YoHD9XEInc0", poster: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop: "/8ZTVqvKdQ8emSGUEMjsS4yHAwrp.jpg" },
  { title: "Interstellar", trailer: "zSWdZVtXT7E", poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop: "/xJHokMbljvjVAjmpVuO24NGl2.jpg" },
  { title: "The Dark Knight", trailer: "EXeTwQWrcwY", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop: "/hqkIcbrOHL86UncnH21k7n.jpg" },
  { title: "Avatar", trailer: "5PSNL1qE6VY", poster: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", backdrop: "/vL5LR6WdxWPjUUegMVB4A3A.jpg" },
  { title: "The Matrix", trailer: "vKQi3bBA1y8", poster: "/f89U3ADr1oiB1s9GvwJwBQA4c.jpg", backdrop: "/ncEsesgOJDNrTUED89hYbA117jM.jpg" },
  { title: "Gladiator", trailer: "owK1qxDselE", poster: "/ty8TGRuvJLPUmAR1H1nRIsgwvq0.jpg", backdrop: "/hU1O9yl2C1pARlO1nS7pXG.jpg" },
  { title: "The Godfather", trailer: "sY1S34973zA", poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", backdrop: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg" },
  { title: "Pulp Fiction", trailer: "s7EdQ4FqbhY", poster: "/d5iIlFn5s0ImszYzBPbOYKQcbJ5.jpg", backdrop: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg" },
  { title: "Forrest Gump", trailer: "bLvqoHBptjg", poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", backdrop: "/3h1JZGDhZ8nzxdgvkxha0qBwXk3.jpg" },
  { title: "The Shawshank Redemption", trailer: "6hB3S9bIaco", poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", backdrop: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg" },
  { title: "Fight Club", trailer: "qtRKdVHc-cE", poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", backdrop: "/rr7E0NoGKxjbM8tT58514s3p3.jpg" },
  { title: "The Lord of the Rings: The Fellowship of the Ring", trailer: "V75dSyq10b8", poster: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop: "/lXhgNSYw26R8B8m4KxUARJ5k9Q3.jpg" },
  { title: "Star Wars: Episode IV - A New Hope", trailer: "vZ734NWnAHA", poster: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", backdrop: "/4iJfYYoQzZcONB9hNzg0J0wW1W.jpg" },
  { title: "Jurassic Park", trailer: "QDatC4mLCp0", poster: "/9i3plLl89DHMz7mahksDaAo7HIS.jpg", backdrop: "/3Mib88029Fw2F5J1h30Q1.jpg" },
  { title: "Titanic", trailer: "CHekzSiZcw4", poster: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", backdrop: "/533xMwbx4hBntQ0jD8t3lG.jpg" },
  { title: "The Avengers", trailer: "eOrNdBpGMv8", poster: "/RYMX2wcKCBAr24UyPD7xwmja8y.jpg", backdrop: "/9BBTo41Z2a8AHDX3.jpg" },
  { title: "Spider-Man: No Way Home", trailer: "JfVOs4VSpmA", poster: "/1g0dhYtq4irTY1R80vFAeW867.jpg", backdrop: "/14QbnygCuTO0wl7.jpg" },
  { title: "Black Panther", trailer: "xjDjIWPwcPU", poster: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg", backdrop: "/6ELJEzQJ3Y45C9N.jpg" },
  { title: "Iron Man", trailer: "8ugaeA-nMTc", poster: "/78lPtwv72eTNqwd9OsLqlJZ1zJ.jpg", backdrop: "/5b40A1rT0O.jpg" },
  { title: "Joker", trailer: "zAGVQLHvwOY", poster: "/udDclJoHjfpt8NcCGlzE6cXL1jG.jpg", backdrop: "/n6bUvigpRFqSwmwpF1snIGegA.jpg" },
  { title: "Deadpool", trailer: "ONHBaC-pfsk", poster: "/yGSxMiF0cRVZk2R.jpg", backdrop: "/en971MEXui9wT7pL.jpg" },
  { title: "Logan", trailer: "Div0iP65aZo", poster: "/fnbjcWG8B6uF3J.jpg", backdrop: "/gX3M9A3oB9h1.jpg" },
  { title: "Mad Max: Fury Road", trailer: "hEJnMQG9ev8", poster: "/8tZYtuWeZ1q2hR.jpg", backdrop: "/nlCHW7E6R8W.jpg" },
  { title: "John Wick", trailer: "C0BMx-qxsP4", poster: "/wY300vT2x6N1bN.jpg", backdrop: "/rL0O5G7n6J92.jpg" },
  { title: "Die Hard", trailer: "jaJlwem17X4", poster: "/aJCtkxJzK6b3P.jpg", backdrop: "/g8aB0g9vB4D9.jpg" },
  { title: "Terminator 2: Judgment Day", trailer: "CRRlbK5w8AE", poster: "/we53Y3h0L6X1Xg.jpg", backdrop: "/wW7O3f5qD8X1.jpg" },
  { title: "Alien", trailer: "LjLamj-b0I8", poster: "/vfrQk5J5X1L8q2.jpg", backdrop: "/Amk3J4lWk4F9.jpg" },
  { title: "Blade Runner", trailer: "eMVDTaBgjcO", poster: "/vfzE3pjE5H62F8.jpg", backdrop: "/p5H7PZ9W2R.jpg" },
  { title: "The Shining", trailer: "5Cb3ik6zPjc", poster: "/b6ko0J4aF4B.jpg", backdrop: "/m4o9n7D5t1z9.jpg" },
  { title: "Psycho", trailer: "Wz719b9QUqY", poster: "/yz1D3n7H2W5G.jpg", backdrop: "/hG3o4M9b2R.jpg" },
  { title: "Goodfellas", trailer: "qo5jJpHtI1Y", poster: "/aKuFiU82N1D5P.jpg", backdrop: "/sw5D4E1jG5r5.jpg" },
  { title: "Casino", trailer: "EJXDMHOgB0X", poster: "/4TSJ9v1B6w8V.jpg", backdrop: "/3Z5D1E4vT8m.jpg" },
  { title: "The Departed", trailer: "iojhqm0JTW4", poster: "/t8cT3A8Q0y9X.jpg", backdrop: "/d6z4D9Q4b1P.jpg" },
  { title: "The Wolf of Wall Street", trailer: "iszwuX1AK6A", poster: "/pWHf4d5T1y9a.jpg", backdrop: "/cW6A6D7T9n5H.jpg" },
  { title: "Catch Me If You Can", trailer: "71rDQ7z4eF8", poster: "/ctj9o1h7eG6w.jpg", backdrop: "/yR8p9Q1d5n.jpg" },
  { title: "Dune", trailer: "n9xhKv3A7f0", poster: "/d5NXSklXo0W8X.jpg", backdrop: "/jZ1J9N7a0V.jpg" },
  { title: "Oppenheimer", trailer: "uYPbbksJxIg", poster: "/8Gxv8G2n7M9D.jpg", backdrop: "/fm6K1c7F6b3L.jpg" },
  { title: "Tenet", trailer: "LdOM0x0XDMo", poster: "/k68N4F9O8eL0L.jpg", backdrop: "/wzJ6x7H6E2yR.jpg" },
  { title: "Dunkirk", trailer: "F-eMt3SrgXU", poster: "/bOXmQ1w8X9E2B.jpg", backdrop: "/c6W9d6V9d8L2.jpg" },
  { title: "Memento", trailer: "0vS0E9bBSL0", poster: "/yuNs095X4Y1a.jpg", backdrop: "/gM5x6N4t9Q2Y.jpg" },
  { title: "The Prestige", trailer: "o4gHCmTQDZI", poster: "/tK1zy5Z6F7P8P.jpg", backdrop: "/n8J4y5H4T3J.jpg" },
  { title: "Seven", trailer: "znmZoVkCjpI", poster: "/6yoghty7A0qR7.jpg", backdrop: "/r4A6n6D2Y0V.jpg" },
  { title: "Zodiac", trailer: "yNncHPl1XXM", poster: "/l2E1f1w6D5R1S.jpg", backdrop: "/t2A5n1O6b8B.jpg" },
  { title: "The Social Network", trailer: "lB95KLmpLR4", poster: "/n0ybibF6v7yR.jpg", backdrop: "/s2b6F2v5Z8A.jpg" },
  { title: "Gone Girl", trailer: "2-_-1nJf8XG", poster: "/qy9a7y6G4F1D.jpg", backdrop: "/x7v5Q5f2E3P.jpg" },
  { title: "Parasite", trailer: "5xH0HfPT9I", poster: "/7IiTTgM8Q5D5E.jpg", backdrop: "/s7w3P1n3V7E.jpg" },
  { title: "Oldboy", trailer: "2HkjrJ6IK5E", poster: "/p6M2r5B8Y0O.jpg", backdrop: "/j8m9E3v3K7B.jpg" },
  { title: "Spirited Away", trailer: "ByXuk9QqQkk", poster: "/39wm2A3V0C1C.jpg", backdrop: "/Ab8E6T1N8D.jpg" },
  { title: "Princess Mononoke", trailer: "4OiMOHXWBac", poster: "/jHWm5K3B1G5B.jpg", backdrop: "/1n1O8Q9Q8I.jpg" },
  { title: "Your Name", trailer: "xU47nhruN-Q", poster: "/q719T7y9Y2C2Y.jpg", backdrop: "/v1D7P6I2D4v.jpg" }
];

const genresList = ['Action', 'Sci-Fi', 'Thriller', 'Drama', 'Comedy', 'Horror', 'Romance', 'Adventure', 'Fantasy', 'Crime', 'Animation'];

const generateMovies = () => {
  return moviesData.map((data, index) => {
    const g1 = genresList[Math.floor(Math.random() * genresList.length)];
    const g2 = genresList[Math.floor(Math.random() * genresList.length)];
    const isTrending = index < 12;
    
    // Construct real TMDB URLs
    const posterUrl = data.poster ? `https://image.tmdb.org/t/p/w500${data.poster}` : `https://placehold.co/500x750/111111/E50914/png?text=${encodeURIComponent(data.title)}`;
    const backdropUrl = data.backdrop ? `https://image.tmdb.org/t/p/original${data.backdrop}` : `https://placehold.co/1280x720/111111/E50914/png?text=${encodeURIComponent(data.title)}`;

    return {
      title: data.title,
      description: `Experience the thrilling journey of ${data.title}, a cinematic masterpiece. Join the characters as they navigate through unexpected twists, profound drama, and breathtaking action sequences.`,
      duration: Math.floor(Math.random() * 60) + 90,
      releaseDate: new Date(new Date().setFullYear(2000 + Math.floor(Math.random() * 25))),
      genres: [...new Set([g1, g2])],
      posterUrl,
      backdropUrl,
      trailerUrl: `https://www.youtube.com/watch?v=${data.trailer}`,
      rating: parseFloat((Math.random() * 3 + 6.5).toFixed(1)),
      isTrending,
    };
  });
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding 50 Unique Movies');

    // Remove old duplicates
    await Movie.deleteMany();
    
    const movies = generateMovies();
    await Movie.insertMany(movies);

    console.log(`${movies.length} Unique Movies with distinct trailers and TMDB posters imported successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();

