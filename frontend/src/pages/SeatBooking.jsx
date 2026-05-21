import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShowDetails } from '../redux/slices/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaTicketAlt } from 'react-icons/fa';

const FALLBACK_LAYOUT = [
  { row: 'A', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { row: 'B', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { row: 'C', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { row: 'D', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { row: 'E', seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
];

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentShowDetails, isLoading } = useSelector((state) => state.booking);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const location = useLocation();
  const {
    movieId,
    theatreName,
    time,
    movieTitle,
    movieBackdrop,
  } = location.state || {};

  const show = currentShowDetails?.show;
  const screenLayout = currentShowDetails?.screenLayout || FALLBACK_LAYOUT;
  const bookedSet = new Set(
    (show?.bookedSeats || []).map((s) => `${s.row}${s.number}`)
  );

  const isRealShow = showId && showId.length === 24;

  useEffect(() => {
    if (isRealShow) {
      dispatch(getShowDetails(showId));
    }
  }, [dispatch, showId, isRealShow]);

  const getSeatPrice = (row) => {
    const rowData = screenLayout.find((r) => r.row === row);
    const seat = rowData?.seats?.[0];
    return seat?.price || 15;
  };

  const toggleSeat = (seatId, price) => {
    if (bookedSet.has(seatId)) return;

    if (selectedSeats.find((s) => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, { id: seatId, price }]);
    }
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleBook = () => {
    if (selectedSeats.length === 0) {
      alert('Please select a seat');
      return;
    }

    navigate('/checkout', {
      state: {
        seats: selectedSeats.map((s) => s.id),
        totalAmount,
        showId: isRealShow ? showId : undefined,
        movieId: movieId || show?.movie?._id,
        theatreName: theatreName || show?.theatre?.name,
        time: time || show?.time,
        movieTitle: movieTitle || show?.movie?.title,
        movieBackdrop: movieBackdrop || show?.movie?.posterUrl,
      },
    });
  };

  const displayTitle = movieTitle || show?.movie?.title;
  const displayTheatre = theatreName || show?.theatre?.name;
  const displayTime = time || show?.time;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      {movieBackdrop && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src={movieBackdrop} alt="" className="w-full h-full object-cover blur-md" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-white mb-2">Select Your Seats</h2>
          {displayTitle && <p className="text-xl text-primary font-bold">{displayTitle}</p>}
          {displayTheatre && (
            <p className="text-gray-400 mt-1">
              {displayTheatre} • {displayTime}
            </p>
          )}
        </motion.div>

        {isLoading && isRealShow ? (
          <p className="text-center text-gray-400 py-12">Loading seat map...</p>
        ) : (
          <>
            <div className="mb-16 flex flex-col items-center">
              <div className="w-full max-w-2xl h-1 bg-white/20 rounded-full mb-12 relative">
                <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-bold text-center mt-6">
                  Screen
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pb-12">
              {screenLayout.map((rowObj, rowIdx) => (
                <motion.div
                  key={rowObj.row}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * rowIdx }}
                  className="flex items-center gap-6"
                >
                  <span className="text-gray-500 font-black w-6">{rowObj.row}</span>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {rowObj.seats.map((seat) => {
                      const num = typeof seat === 'object' ? seat.number : seat;
                      const seatId = `${rowObj.row}${num}`;
                      const price = typeof seat === 'object' ? seat.price : getSeatPrice(rowObj.row);
                      const isBooked = bookedSet.has(seatId);
                      const isSelected = selectedSeats.some((s) => s.id === seatId);

                      return (
                        <button
                          key={seatId}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSeat(seatId, price)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-t-2xl rounded-b-md transition-all ${
                            isBooked
                              ? 'bg-white/5 cursor-not-allowed opacity-40'
                              : isSelected
                                ? 'bg-primary shadow-[0_0_15px_rgba(229,9,20,0.6)]'
                                : 'bg-white/10 hover:bg-white/25 border border-white/10'
                          }`}
                          title={`${seatId} — $${price}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-gray-500 font-black w-6">{rowObj.row}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <AnimatePresence>
          {selectedSeats.length > 0 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 p-6"
            >
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.id}
                        className="bg-white/10 text-white px-2 py-1 rounded text-sm font-bold"
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Total: <span className="text-primary text-xl font-black">${totalAmount}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBook}
                  className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-black text-lg flex items-center gap-3"
                >
                  Proceed to Checkout <FaArrowRight />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeatBooking;
