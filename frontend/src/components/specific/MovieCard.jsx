import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaPlay, FaHeart, FaRegHeart, FaInfoCircle } from 'react-icons/fa';
import TrailerPlayer from './TrailerPlayer';

const MovieCard = ({ movie, onPlay }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  
  const [inWatchlist, setInWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cineverse_watchlist');
      if (saved) {
        return JSON.parse(saved).includes(movie._id);
      }
    } catch (e) {
      console.error('Error parsing watchlist from local storage', e);
    }
    return false;
  });

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 600);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsHovered(false);
  };

  const toggleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = !inWatchlist;
    setInWatchlist(newStatus);
    
    try {
      const saved = localStorage.getItem('cineverse_watchlist');
      let watchlist = saved ? JSON.parse(saved) : [];
      
      if (newStatus) {
        if (!watchlist.includes(movie._id)) watchlist.push(movie._id);
      } else {
        watchlist = watchlist.filter(id => id !== movie._id);
      }
      
      localStorage.setItem('cineverse_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error('Error saving watchlist to local storage', e);
    }
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay && movie.trailerUrl) {
      onPlay(movie.trailerUrl);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };
  
  const handleTicketsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/book/${movie._id}`, { 
      state: { movieTitle: movie.title, movieBackdrop: movie.backdropUrl } 
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.07, zIndex: 50 }}
      onHoverStart={handleMouseEnter}
      onHoverEnd={handleMouseLeave}
      onClick={handleCardClick}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group rounded-xl overflow-hidden cursor-pointer shadow-lg bg-[#0a0a0a] h-[380px] md:h-[420px] w-full border border-white/5 hover:border-white/20 hover:shadow-[0_0_40px_rgba(229,9,20,0.3)] transition-all block"
    >
      <div className="w-full h-full relative">
        {isHovered && movie.trailerUrl ? (
          <div className="absolute inset-0 z-0 bg-black">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <TrailerPlayer
                trailerUrl={movie.trailerUrl}
                width="150%"
                height="150%"
                playing
                muted
                controls={false}
                className="-ml-[25%] -mt-[25%] pointer-events-none opacity-90"
              />
            </motion.div>
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://placehold.co/500x750/111111/E50914/png?text=${encodeURIComponent(movie.title)}`;
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-50"
          />
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#e50914]/40 via-transparent to-transparent opacity-0 z-10 transition-opacity duration-500 group-hover:opacity-100 mix-blend-overlay pointer-events-none"></div>

        {/* Watchlist Icon */}
        <button 
          onClick={toggleWatchlist}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0"
        >
          {inWatchlist ? <FaHeart className="text-primary text-lg drop-shadow-[0_0_10px_rgba(229,9,20,0.8)]" /> : <FaRegHeart className="text-white text-lg" />}
        </button>
        
        {/* Content Box */}
        <div className="absolute bottom-0 left-0 w-full p-5 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out z-20 flex flex-col justify-end h-full pointer-events-none">
          
          <div className="mt-auto pointer-events-auto">
            <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg truncate tracking-tight pointer-events-none">{movie.title}</h3>
            
            <div className="flex items-center space-x-3 mb-3 pointer-events-none">
              <div className="flex items-center space-x-1 text-yellow-500 bg-black/60 border border-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                <FaStar className="w-3 h-3" />
                <span className="text-xs font-bold text-white">{movie.rating?.toFixed(1) || 'NR'}</span>
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                {movie.genres?.[0]}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}
              </span>
            </div>

            {/* Hover Action Buttons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={handlePlayClick}
                className="flex-1 py-2.5 bg-white text-black hover:bg-gray-200 text-center text-sm font-black uppercase rounded-md transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <FaPlay className="text-xs" /> Trailer
              </button>
              <button 
                onClick={handleTicketsClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-center text-sm font-black uppercase rounded-md transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.4)] hover:shadow-[0_0_20px_rgba(229,9,20,0.6)] cursor-pointer"
              >
                Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
