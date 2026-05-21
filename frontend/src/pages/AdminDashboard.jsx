import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FaUsers,
  FaFilm,
  FaTicketAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaTrash,
  FaPlus,
  FaChartLine,
  FaList,
} from 'react-icons/fa';
import {
  fetchAdminStats,
  fetchAdminShows,
  fetchAdminFormOptions,
  deleteAdminShow,
  clearAdminMessage,
} from '../redux/slices/adminSlice';
import ShowForm from '../components/admin/ShowForm';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-6 rounded-xl flex items-center justify-between"
  >
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value ?? '—'}</h3>
    </div>
    <div className={`p-4 rounded-full ${color} bg-opacity-20`}>{icon}</div>
  </motion.div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { stats, shows, isLoading, isSubmitting, isError, message } = useSelector(
    (state) => state.admin
  );
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [showFormOpen, setShowFormOpen] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminShows());
    dispatch(fetchAdminFormOptions());
  }, [dispatch]);

  const handleDelete = async (showId, movieTitle) => {
    if (!window.confirm(`Delete show for "${movieTitle}"? This cannot be undone.`)) {
      return;
    }
    await dispatch(deleteAdminShow(showId));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'shows', label: 'Manage Shows', icon: <FaList /> },
  ];

  const revenueData = stats?.revenueData || [];

  return (
    <div
      className="min-h-screen relative py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 justify-between items-start mb-8 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80 mb-2">CineVerse Admin</p>
            <h2 className="text-4xl font-bold text-white">Admin Dashboard</h2>
            <p className="mt-2 text-gray-300 max-w-2xl">
              View platform analytics and schedule movie shows across theatres.
            </p>
          </div>
          <div className="text-sm text-gray-200 glass px-4 py-2 rounded-full">
            Welcome, <span className="text-white font-semibold">{user?.name || 'Admin'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                dispatch(clearAdminMessage());
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                  : 'glass text-gray-300 hover:text-white hover:border-primary/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {isError && message && activeTab === 'shows' && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex justify-between items-center">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => dispatch(clearAdminMessage())}
              className="text-red-300 hover:text-white underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString()}
                icon={<FaUsers className="text-2xl text-blue-500" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Movies"
                value={stats?.totalMovies?.toLocaleString()}
                icon={<FaFilm className="text-2xl text-purple-500" />}
                color="bg-purple-500"
              />
              <StatCard
                title="Active Shows"
                value={stats?.totalShows?.toLocaleString()}
                icon={<FaCalendarAlt className="text-2xl text-amber-500" />}
                color="bg-amber-500"
              />
              <StatCard
                title="Bookings"
                value={stats?.totalBookings?.toLocaleString()}
                icon={<FaTicketAlt className="text-2xl text-green-500" />}
                color="bg-green-500"
              />
              <StatCard
                title="Revenue"
                value={stats ? `$${stats.totalRevenue?.toLocaleString()}` : '—'}
                icon={<FaDollarSign className="text-2xl text-primary" />}
                color="bg-primary"
              />
            </div>

            <div className="glass p-6 rounded-xl mb-8">
              <h3 className="text-xl font-bold text-white mb-6">Revenue Analytics</h3>
              <div className="h-80 w-full">
                {isLoading && !stats ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading stats...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f0f11', borderColor: '#ffffff20' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#e50914"
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#e50914' }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Quick tip</h3>
              <p className="text-gray-400 text-sm">
                Go to <button type="button" onClick={() => setActiveTab('shows')} className="text-primary hover:underline font-medium">Manage Shows</button> to create screenings. Users book from the movie page once shows exist for their city.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'shows' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Scheduled Shows</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {shows.length} show{shows.length !== 1 ? 's' : ''} in the system
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-md hover:bg-red-700 transition shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              >
                <FaPlus /> Add Show
              </button>
            </div>

            <div className="glass rounded-xl overflow-hidden border border-white/10">
              {isLoading ? (
                <div className="p-12 text-center text-gray-400">Loading shows...</div>
              ) : shows.length === 0 ? (
                <div className="p-12 text-center">
                  <FaCalendarAlt className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-white font-semibold text-lg mb-2">No shows scheduled yet</p>
                  <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                    Create your first show to enable ticket booking. Make sure movies and theatres are seeded in MongoDB.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-md hover:bg-red-700 transition"
                  >
                    <FaPlus /> Create First Show
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-gray-300">
                    <thead className="text-xs uppercase bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4">Movie</th>
                        <th className="px-6 py-4">Theatre</th>
                        <th className="px-6 py-4">City</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4 text-center">Booked</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shows.map((show) => (
                        <tr
                          key={show._id}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {show.movie?.posterUrl && (
                                <img
                                  src={show.movie.posterUrl}
                                  alt={show.movie.title}
                                  className="w-10 h-14 object-cover rounded shadow"
                                />
                              )}
                              <span className="font-medium text-white">{show.movie?.title || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{show.theatre?.name || '—'}</td>
                          <td className="px-6 py-4">{show.theatre?.city || '—'}</td>
                          <td className="px-6 py-4">{formatDate(show.date)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-semibold">
                              {show.time}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {show.bookedSeats?.length || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleDelete(show._id, show.movie?.title)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition disabled:opacity-50"
                              title="Delete show"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <ShowForm isOpen={showFormOpen} onClose={() => setShowFormOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
