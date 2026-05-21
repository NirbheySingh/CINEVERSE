import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShowsForMovie } from '../redux/slices/bookingSlice';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaVideo, FaInfoCircle } from 'react-icons/fa';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

const TheatreList = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { shows, isLoading, message } = useSelector((state) => state.booking);
  const { movieTitle, movieBackdrop } = location.state || {};
  const [city, setCity] = useState('Mumbai');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (movieId && city) {
      dispatch(getShowsForMovie({ movieId, city }));
    }
  }, [dispatch, movieId, city]);

  const handleShowClick = (show) => {
    navigate(`/seat-booking/${show._id}`, {
      state: {
        movieId,
        theatreName: show.theatre?.name,
        time: show.time,
        movieTitle,
        movieBackdrop,
        city,
      },
    });
  };

  const groupedByTheatre = shows.reduce((acc, show) => {
    const key = show.theatre?._id || show.theatre?.name || 'unknown';
    if (!acc[key]) {
      acc[key] = { theatre: show.theatre, shows: [] };
    }
    acc[key].shows.push(show);
    return acc;
  }, {});

  const theatreGroups = Object.values(groupedByTheatre);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      {movieBackdrop && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src={movieBackdrop} alt="" className="w-full h-full object-cover blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/80 to-[#050505]" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-white/10 pb-8"
        >
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">
            Select Theatre & Timing
          </h2>
          {movieTitle && (
            <p className="text-2xl text-primary font-bold mb-4">{movieTitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <FaMapMarkerAlt className="text-primary" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-black/50 border border-white/20 text-white px-4 py-2 rounded-lg font-bold focus:outline-none focus:border-primary"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-darker">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {isLoading && (
          <p className="text-gray-400 text-center py-12">Loading shows...</p>
        )}

        {!isLoading && theatreGroups.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl border border-white/10">
            <p className="text-white font-bold text-lg mb-2">No shows in {city}</p>
            <p className="text-gray-400 text-sm mb-4">
              {message || 'Ask admin to schedule shows for this city in the Admin Panel.'}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {theatreGroups.map((group, tIdx) => (
            <motion.div
              key={group.theatre?._id || tIdx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * tIdx }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl flex flex-col md:flex-row justify-between gap-8 border border-white/10"
            >
              <div className="md:w-1/3">
                <h3 className="text-2xl font-black text-white mb-3">{group.theatre?.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FaMapMarkerAlt />
                  <span>{group.theatre?.city || city}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-500/80 text-xs font-bold uppercase mt-4 bg-yellow-500/10 px-2 py-1 w-max rounded">
                  <FaInfoCircle /> Non-Cancellable
                </div>
              </div>

              <div className="md:w-2/3 flex flex-wrap items-center gap-4">
                {group.shows.map((show) => (
                  <button
                    key={show._id}
                    type="button"
                    onClick={() => handleShowClick(show)}
                    className="px-6 py-3 bg-black/40 border border-green-500/30 text-green-400 text-sm font-black rounded-xl hover:bg-green-500/20 hover:border-green-400 transition-all"
                  >
                    <FaVideo className="inline mr-2 opacity-70" />
                    {show.time}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TheatreList;
