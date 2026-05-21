import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMovies, getTrendingMovies, setSelectedGenre } from '../redux/slices/movieSlice';
import MovieCard from '../components/specific/MovieCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaFilm, FaInfoCircle } from 'react-icons/fa';
import TrailerModal from '../components/specific/TrailerModal';

const ALL_GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Adventure'];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { movies, trending, isLoading, searchTerm, selectedGenre } = useSelector((state) => state.movie);
  const [activeTrailer, setActiveTrailer] = useState(null);

  useEffect(() => {
    dispatch(getTrendingMovies());
    dispatch(getMovies());
  }, [dispatch]);

  const filteredMovies = movies?.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genres?.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const heroMovie = trending?.[0];

  return (
    <div className="w-full bg-[#050505] min-h-screen pb-16">
      {/* Cinematic Hero Section */}
      <div className="relative w-full h-[85vh] lg:h-[100vh] overflow-hidden">
        <motion.div
          className="absolute inset-0 hero-background"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.85) 100%),
              url('${heroMovie?.backdropUrl || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80&fm=webp'}'),
              url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=60&fm=webp')`,
          }}
        />

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-y-0 left-0 w-full lg:w-[55%] bg-gradient-to-r from-black/95 via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(229,9,20,0.18),transparent_60%)] blur-3xl animate-hero-glow" />
          <div className="absolute right-10 top-24 w-56 h-56 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08),transparent_55%)] blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex items-center px-6 lg:px-16 pt-20 pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-[#e50914] text-sm font-black tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
                <span className="w-4 h-6 bg-[#e50914] inline-block rounded-sm shadow-[0_0_10px_rgba(229,9,20,0.8)]"></span> CINEVERSE <span className="text-white">ORIGINAL</span>
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black text-white mb-6 drop-shadow-2xl tracking-tighter leading-none">
              {heroMovie?.title || "Welcome to CineVerse"}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed font-medium max-w-2xl drop-shadow-lg line-clamp-3">
              {heroMovie?.description || "Experience cinema like never before. Dive into our handpicked collection of breathtaking masterpieces, featuring stunning visuals, immersive trailers, and seamless booking."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTrailer(heroMovie?.trailerUrl || "https://www.youtube.com/watch?v=YoHD9XEInc0")}
                className="px-8 py-3.5 bg-white text-black rounded-lg font-bold text-lg hover:bg-white/80 transition-all duration-300 flex items-center gap-3 shadow-xl hover:scale-105"
              >
                <FaPlay className="text-xl" />
                Play Now
              </button>
              <button 
                onClick={() => setActiveTrailer("https://www.youtube.com/watch?v=d9MyW72ELq0")}
                className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-bold text-lg hover:from-red-500 hover:to-red-700 transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_30px_rgba(229,9,20,0.8)] hover:scale-105"
              >
                <FaFilm className="text-xl" />
                Watch Reel Sizzler
              </button>
              <button 
                onClick={() => navigate(`/movie/${heroMovie?._id}`)}
                className="px-8 py-3.5 bg-gray-500/30 text-white rounded-lg font-bold text-lg hover:bg-gray-500/50 transition-all duration-300 flex items-center gap-3 backdrop-blur-md border border-white/10 hover:scale-105"
              >
                <FaInfoCircle className="text-xl" />
                More Info
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trending Horizontal Slider */}
      {!searchTerm && (
        <div className="pl-6 lg:pl-16 py-8 relative z-20 -mt-24 lg:-mt-32">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-wide drop-shadow-lg">Trending Now</h2>
          {isLoading ? (
            <div className="flex gap-4 overflow-x-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[240px] h-[360px] bg-white/5 rounded-lg animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar pr-16 pt-2">
              {trending?.map((movie, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={movie._id} 
                  className="snap-start min-w-[260px] w-[260px] lg:min-w-[280px] lg:w-[280px]"
                >
                  <MovieCard movie={movie} onPlay={setActiveTrailer} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommended & Filtering */}
      <div id="recommended-section" className="px-6 lg:px-16 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-white tracking-wide border-l-4 border-primary pl-4">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Recommended For You'}
          </h2>
          
          {/* Genre Filters */}
          {!searchTerm && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar mt-6 md:mt-0 pb-2">
              {ALL_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => dispatch(setSelectedGenre(genre))}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap border ${
                    selectedGenre === genre 
                      ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105' 
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-[420px] bg-white/5 rounded-lg animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filteredMovies?.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} onPlay={setActiveTrailer} />
            ))}
          </motion.div>
        ) : (
          <div className="py-24 text-center glass rounded-2xl mx-auto max-w-2xl border border-white/5">
            <h3 className="text-3xl text-gray-300 font-bold mb-4">No movies found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      <TrailerModal 
        isOpen={!!activeTrailer} 
        onClose={() => setActiveTrailer(null)} 
        trailerUrl={activeTrailer || ""} 
      />
    </div>
  );
};

export default Home;
