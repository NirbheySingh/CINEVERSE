import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import api from '../services/api';

const TicketSuccess = () => {
  const { bookingId: ticketParam } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [paymentPending, setPaymentPending] = useState(false);

  const state = location.state || {};
  const {
    movieTitle = 'CineVerse Movie',
    movieBackdrop = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    theatreName = 'CineVerse Theatre',
    time = '08:00 PM',
    seats = [],
    paymentMethod,
    totalAmount,
  } = state;

  const displaySeats = ticket?.seats?.map((s) => `${s.row}${s.number}`) || seats;
  const title = ticket?.show?.movie?.title || movieTitle;
  const backdrop = ticket?.show?.movie?.backdropUrl || movieBackdrop;
  const theatre = ticket?.show?.theatre?.name || theatreName;
  const showTime = ticket?.show?.time || time;
  const ticketId = ticket?.ticketId || ticketParam;
  const amount = ticket?.totalAmount ?? totalAmount;
  const method = ticket?.paymentMethod || paymentMethod;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    const load = async () => {
      try {
        if (sessionId) {
          const stripeRes = await api.get(`/payments/stripe/verify?session_id=${sessionId}`);
          setTicket(stripeRes.data.data);
          return;
        }

        const res = await api.get(`/payments/ticket/${ticketParam}`);
        const booking = res.data.data;
        setTicket(booking);

        if (booking.paymentStatus !== 'completed') {
          setPaymentPending(true);
        }
      } catch {
        // use location.state fallback
      }
    };
    if (ticketParam) load();
  }, [ticketParam, location.search]);

  return (
    <div className="min-h-[90vh] bg-dark flex flex-col items-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="mb-8"
      >
        <FaCheckCircle className="text-green-500 text-6xl shadow-[0_0_30px_rgba(34,197,94,0.5)] rounded-full bg-darker" />
      </motion.div>

      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        {paymentPending ? 'Payment Pending' : 'Booking Confirmed!'}
      </h2>
      <p className="text-gray-400 mb-2 text-center max-w-md">
        {paymentPending
          ? 'Your ticket is not valid until payment completes. Do not use for entry yet.'
          : `Payment completed${method ? ` via ${method.replace('_', ' ')}` : ''}. Show this QR at the theatre.`}
      </p>
      {amount != null && (
        <p className="text-primary font-bold mb-8">${Number(amount).toFixed(2)} paid</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative"
      >
        <div className="h-40 bg-gray-900 relative">
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute bottom-4 left-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-wider">CineVerse</h3>
          </div>
        </div>

        <div className="p-6 bg-white">
          <h4 className="text-2xl font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-gray-600 font-medium mb-6">{theatre}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">Date</p>
              <p className="font-bold text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Time</p>
              <p className="font-bold text-gray-900">{showTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase">Seats</p>
              <p className="font-bold text-primary">
                {Array.isArray(displaySeats) ? displaySeats.join(', ') : displaySeats}
              </p>
            </div>
          </div>

          <div className="relative h-8 flex items-center justify-center my-2">
            <div className="absolute left-[-2rem] w-8 h-8 bg-dark rounded-full" />
            <div className="absolute right-[-2rem] w-8 h-8 bg-dark rounded-full" />
            <div className="w-full border-t-2 border-dashed border-gray-300" />
          </div>

          <div className="flex flex-col items-center pt-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketId}`}
              alt="QR"
              className="w-32 h-32 mb-2"
            />
            <p className="text-xs font-mono text-gray-500 tracking-widest">{ticketId}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-3 glass hover:bg-white/10 text-white rounded-md font-semibold transition flex items-center gap-2"
        >
          <FaDownload /> Download PDF
        </button>
        <Link
          to="/"
          className="px-6 py-3 bg-white text-dark hover:bg-gray-200 rounded-md font-semibold transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default TicketSuccess;
