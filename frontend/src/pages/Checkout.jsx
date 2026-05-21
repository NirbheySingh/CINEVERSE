import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaLock, FaGift, FaApplePay, FaPaypal, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    bookingId,
    seats = [],
    totalAmount = 0,
    showId,
    movieTitle,
    theatreName,
    time,
    movieBackdrop,
  } = location.state || {};

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentError, setPaymentError] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);

  const seatList = Array.isArray(seats) ? seats : [];
  const usesRazorpay = paymentConfig?.razorpay;
  const usesStripe = paymentConfig?.stripe && !usesRazorpay;
  const currencySymbol = paymentConfig?.currency === 'INR' ? '₹' : '$';
  const ticketSubtotal = totalAmount || seatList.length * 15;
  const convenienceFee = 3.5;
  const tax = ticketSubtotal * 0.18;
  const finalAmount = ticketSubtotal + convenienceFee + tax - discount;

  useEffect(() => {
    api.get('/payments/config').then((r) => setPaymentConfig(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('canceled') === 'true') {
      setPaymentError('Payment was canceled. You can try again.');
    }
    if (!showId) {
      setPaymentError('Please book seats from a valid show before checkout.');
    }
  }, [location.search, showId]);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'CINEVERSE10') {
      setDiscount(ticketSubtotal * 0.1);
      setPromoMessage('Promo applied: 10% off!');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid promo code');
    }
  };

  const handlePayment = async () => {
    setPaymentError('');
    if (seatList.length === 0) {
      setPaymentError('No seats selected. Go back and choose seats.');
      return;
    }
    if (!showId) {
      setPaymentError('Invalid booking session. Select a show and seats again.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.post('/payments/process', {
        showId,
        seats: seatList,
        subtotal: ticketSubtotal,
        finalAmount,
        paymentMethod,
        movieTitle,
        theatreName,
        time,
      });

      const data = response.data?.data;
      if (!data) {
        throw new Error('Invalid payment response');
      }

      const ticketState = {
        movieTitle: data.movieTitle || movieTitle,
        theatreName: data.theatreName || theatreName,
        time: data.time || time,
        movieBackdrop,
        seats: data.seats || seatList,
        paymentMethod,
        totalAmount: data.totalAmount ?? finalAmount,
        currency: data.currency || paymentConfig?.currency,
      };

      if (data.provider === 'razorpay') {
        await loadRazorpayScript();
        openRazorpayCheckout({
          data,
          onSuccess: async (razorpayResponse) => {
            try {
              await api.post('/payments/razorpay/verify', {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                bookingId: data.bookingId,
              });
              navigate(`/ticket/${data.ticketId}?success=true`, {
                state: ticketState,
                replace: true,
              });
            } catch (err) {
              setPaymentError(err.response?.data?.message || 'Payment verification failed');
              setIsProcessing(false);
            }
          },
          onDismiss: () => setIsProcessing(false),
          onError: (msg) => {
            setPaymentError(msg);
            setIsProcessing(false);
          },
        });
        return;
      }

      if (data.provider === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('Unknown payment provider');
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Payment failed. Please try again.';
      setPaymentError(msg);
      setIsProcessing(false);
    }
  };

  const paymentLabels = {
    card: usesRazorpay ? 'Card / UPI / Netbanking' : 'Credit / Debit Card',
    apple: 'Apple Pay',
    paypal: 'PayPal',
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

        <div className="flex-grow">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-black text-white tracking-tight">Checkout</h2>
            <p className="text-gray-400 mt-2 text-lg">
              Pay with {paymentLabels[paymentMethod]}. Amount: {currencySymbol}
              {finalAmount.toFixed(2)}
            </p>
            {usesRazorpay && (
              <p className="text-green-400/90 text-sm mt-2">
                Real payment via Razorpay — funds go to your linked bank account.
              </p>
            )}
            {usesStripe && (
              <p className="text-green-400/90 text-sm mt-2">
                Real payment via Stripe — secure card checkout.
              </p>
            )}
            {!paymentConfig && (
              <p className="text-yellow-400/90 text-sm mt-2">Loading payment options...</p>
            )}
            {paymentConfig && !usesRazorpay && !usesStripe && (
              <p className="text-red-400 text-sm mt-2">
                Payment not configured on server. See PAYMENTS_SETUP.md in the project.
              </p>
            )}
            {movieTitle && (
              <p className="text-primary font-bold mt-1">
                {movieTitle} • {theatreName} • {time}
              </p>
            )}
          </motion.div>

          {paymentError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {paymentError}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl mb-8 border border-white/10 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaCreditCard className="mr-3 text-primary text-2xl" /> Select Payment Method
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { id: 'card', icon: FaCreditCard, label: 'Credit Card' },
                { id: 'apple', icon: FaApplePay, label: 'Apple Pay' },
                { id: 'paypal', icon: FaPaypal, label: 'PayPal' },
              ].map(({ id, icon: Icon, label }) => (
                <label
                  key={id}
                  className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === id
                      ? 'bg-primary/20 border-2 border-primary shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                      : 'bg-black/50 border-2 border-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="hidden"
                  />
                  <Icon
                    className={`text-3xl ${paymentMethod === id ? (id === 'paypal' ? 'text-blue-500' : 'text-primary') : 'text-gray-400'}`}
                  />
                  <span className={`font-bold ${paymentMethod === id ? 'text-white' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {paymentMethod === id && (
                    <FaCheckCircle className="absolute top-3 right-3 text-primary" />
                  )}
                </label>
              ))}
            </div>

            <div className="p-4 bg-black/30 rounded-xl border border-white/10 text-gray-300 text-sm">
              {usesRazorpay ? (
                <p>
                  Click <strong className="text-white">Pay</strong> to open Razorpay secure checkout
                  (UPI, cards, netbanking, wallets). Money is deposited to the business bank account
                  linked in your Razorpay dashboard.
                </p>
              ) : usesStripe ? (
                <p>
                  Click <strong className="text-white">Pay</strong> to open Stripe Checkout. Card
                  details are handled by Stripe — not stored on this site.
                </p>
              ) : (
                <p>Configure Razorpay or Stripe API keys in backend <code>.env</code> to accept real payments.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-lg"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaGift className="text-primary" /> Promo Code
            </h3>
            <div className="flex gap-4 flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Enter Code (try CINEVERSE10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-grow px-5 py-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white font-bold uppercase"
              />
              <button
                type="button"
                onClick={applyPromo}
                className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Apply Code
              </button>
            </div>
            {promoMessage && (
              <p className={`mt-3 text-sm font-bold ${discount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {promoMessage}
              </p>
            )}
          </motion.div>
        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl p-8 rounded-3xl sticky top-28 border border-white/10 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">
              Order Summary
            </h3>

            <div className="mb-4 flex flex-wrap gap-2">
              {seatList.map((seat) => (
                <span
                  key={seat}
                  className="bg-white/10 text-white px-2 py-1 rounded text-sm font-bold"
                >
                  {seat}
                </span>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-300">
                <span>Tickets ({seatList.length})</span>
                <span className="text-white">{currencySymbol}{ticketSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Convenience Fee</span>
                <span className="text-white">{currencySymbol}{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Taxes (18%)</span>
                <span className="text-white">{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-bold">
                  <span>Promo</span>
                  <span>-{currencySymbol}{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-white font-black text-2xl mb-2">
              <span>Total</span>
              <span className="text-primary text-3xl">{currencySymbol}{finalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6 capitalize">via {paymentLabels[paymentMethod]}</p>

            <button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing || seatList.length === 0 || !showId || (!usesRazorpay && !usesStripe)}
              className="w-full py-5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl font-black text-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock /> Pay {currencySymbol}{finalAmount.toFixed(2)}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
