import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaQrcode, FaListAlt, FaChair } from 'react-icons/fa';
import TicketScanner from '../components/admin/TicketScanner';
import { useLocation } from 'react-router-dom';

const TheatreDashboard = () => {
  const location = useLocation();
  const showScanner = location.pathname.endsWith('/scanner');

  if (showScanner) {
    return (
      <div className="min-h-screen bg-dark py-8 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-7xl mx-auto">
          <Link to="/theatre-owner" className="text-primary text-sm font-bold mb-6 inline-block hover:underline">
            ← Back to portal
          </Link>
          <TicketScanner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-bold text-white">Theatre Owner Portal</h2>
          <div className="text-sm text-gray-400">Scan tickets & manage entry</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/theatre-owner/scanner"
            className="glass p-8 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/5 transition border border-white/10 hover:border-primary"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary text-2xl">
              <FaQrcode />
            </div>
            <h3 className="text-xl font-bold text-white">Scan Tickets</h3>
            <p className="text-sm text-gray-400 mt-2">Verify paid QR tickets at cinema entry</p>
          </Link>

          <div className="glass p-8 rounded-xl flex flex-col items-center justify-center text-center opacity-60 border border-white/10">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-500 text-2xl">
              <FaListAlt />
            </div>
            <h3 className="text-xl font-bold text-white">Manage Shows</h3>
            <p className="text-sm text-gray-400 mt-2">Use Admin portal to schedule shows</p>
          </div>

          <div className="glass p-8 rounded-xl flex flex-col items-center justify-center text-center opacity-60 border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500 text-2xl">
              <FaChair />
            </div>
            <h3 className="text-xl font-bold text-white">Screen Layouts</h3>
            <p className="text-sm text-gray-400 mt-2">Configured per theatre in database</p>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <h3 className="text-lg font-bold text-amber-400 mb-2">Real payments</h3>
          <p className="text-gray-400 text-sm">
            Customers pay via Razorpay or Stripe. Only tickets with <strong className="text-white">completed</strong> payment
            should be accepted at the scanner. See PAYMENTS_SETUP.md to connect your bank account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TheatreDashboard;
