import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieById } from '../redux/slices/movieSlice';
import { FaClock, FaStar, FaCalendarAlt, FaPlay, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';
import TrailerModal from '../components/specific/TrailerModal';
import { motion } from 'framer-motion';

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { movieDetails: movie, isLoading } = useSelector((state) => state.movie);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    dispatch(getMovieById(id));
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20 relative">
      {/* Immersive Backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={movie.backdropUrl || movie.posterUrl} 
          alt={movie.title} 
          onError={(e) => {
            e.target.src = `https://placehold.co/1280x720/111111/E50914/png?text=${encodeURIComponent(movie.title + ' Backdrop')}`;
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-72 flex-shrink-0 mx-auto md:mx-0 group"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:border-white/20 transition-colors">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                onError={(e) => {
                  e.target.src = `https://placehold.co/500x750/111111/E50914/png?text=${encodeURIComponent(movie.title)}`;
                }}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="flex flex-col gap-4 mt-8">
              <Link 
                to={`/book/${movie._id}`} 
                state={{ movieTitle: movie.title, movieBackdrop: movie.backdropUrl }}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-center text-white py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:from-red-500 hover:to-red-700 transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <FaTicketAlt /> Book Tickets
              </Link>
              {movie.trailerUrl && (
                <button 
                  onClick={() => setIsTrailerOpen(true)}
                  className="w-full bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-3 backdrop-blur-md border border-white/10 transform hover:-translate-y-1"
                >
                  <FaPlay className="text-sm" /> Watch Trailer
                </button>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-grow text-white pt-8 md:pt-32"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-lg">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-8 font-medium">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                <FaStar className="text-yellow-400 text-lg" /> 
                <span className="text-white font-bold text-base">{movie.rating?.toFixed(1) || 'NR'}</span>
              </div>
              <span className="flex items-center gap-2"><FaClock className="text-gray-400" /> {movie.duration} mins</span>
              <span className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> {new Date(movie.releaseDate).getFullYear()}</span>
              
              <div className="flex gap-2">
                {movie.genres?.map(g => (
                  <span key={g} className="px-3 py-1 bg-primary/20 text-red-200 border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">{g}</span>
                ))}
              </div>
            </div>

            <div className="mb-10 max-w-4xl">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
                Overview
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
                {movie.description}
              </p>
            </div>

            {/* Cast Section Placeholder - Using generic UI since DB might not have cast yet */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-l-4 border-primary pl-3">Top Cast</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="flex flex-col items-center min-w-[110px] group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden mb-3 border-2 border-transparent group-hover:border-primary transition-colors shadow-lg">
                      <img src={`https://i.pravatar.cc/150?img=${idx + 10}`} alt={`Actor ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-sm font-bold text-center text-gray-200 group-hover:text-white transition-colors">Actor {idx}</span>
                    <span className="text-xs text-gray-500 text-center">Character Name</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        trailerUrl={movie.trailerUrl} 
      />
    </div>
  );
};

export default MovieDetails;
