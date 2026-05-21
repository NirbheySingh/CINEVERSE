import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { FaSignOutAlt, FaHome, FaChartLine, FaCalendarAlt, FaShieldAlt, FaQrcode } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Overview', icon: <FaChartLine />, exact: true },
    { to: '/admin', label: 'Manage Shows', icon: <FaCalendarAlt />, tab: 'shows' },
    { to: '/admin/scanner', label: 'Ticket Scanner', icon: <FaQrcode />, exact: true },
  ];

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="hidden lg:flex w-64 flex-col fixed h-full border-r border-white/10 bg-black/80 backdrop-blur-xl z-50">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-primary mb-1">
            <FaShieldAlt />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Portal</span>
          </div>
          <h1 className="text-xl font-black tracking-wider text-white">CINEVERSE</h1>
          <p className="text-xs text-gray-500 mt-2">Platform management — not customer booking</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              state={item.tab ? { tab: item.tab } : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                isActive(item.to, item.exact)
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition text-sm font-medium"
          >
            <FaHome />
            View Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex justify-between items-center">
          <div className="lg:hidden">
            <span className="text-primary font-bold text-sm uppercase tracking-widest">Admin</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
              {user?.role}
            </span>
            <span className="text-sm text-gray-300 hidden sm:inline">{user?.name}</span>
            <span className="text-xs text-gray-500 hidden md:inline">{user?.email}</span>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
