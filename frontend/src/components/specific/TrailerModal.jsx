import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import TrailerPlayer from './TrailerPlayer';
import { normalizeTrailerUrl } from '../../utils/videoUtils';

const TrailerModal = ({ isOpen, onClose, trailerUrl }) => {
  const src = normalizeTrailerUrl(trailerUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl mx-4 bg-darker rounded-xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-primary text-white rounded-full flex items-center justify-center transition-colors duration-300 backdrop-blur-md"
            >
              <FaTimes />
            </button>

            <div className="relative w-full aspect-video bg-black">
              {src ? (
                <TrailerPlayer
                  trailerUrl={src}
                  playing
                  controls
                  muted={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl font-light">
                  Trailer not available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;
