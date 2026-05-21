import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { setSearchTerm } from '../redux/slices/movieSlice';
import { FaUserCircle, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const { searchTerm } = useSelector((state) => state.movie);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-lightText font-sans selection:bg-primary selection:text-white">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed w-full top-0 z-[100] transition-all duration-300 ${scrolled ? 'py-3 bg-black/70 backdrop-blur-xl shadow-lg border-b border-white/5' : 'py-6 bg-gradient-to-b from-black/90 to-transparent'}`}
      >
        <div className="px-6 lg:px-16 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="text-3xl font-black text-[#e50914] tracking-[0.15em] uppercase hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(229,9,20,0.6)]">
              CINEVERSE
            </Link>
            
            <div className="hidden md:flex relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors z-10" />
              <input 
                type="text" 
                placeholder="Movies, shows and more" 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-white/30 focus:bg-white/10 text-white w-64 focus:w-80 transition-all duration-300 shadow-inner placeholder-gray-500 backdrop-blur-md"
              />
            </div>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white font-semibold transition-colors hidden sm:block">Home</Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-sm hover:bg-amber-500/30 transition">
                    Admin Panel
                  </Link>
                )}
                {user.role === 'theatre_owner' && (
                  <Link to="/theatre-owner" className="text-primary hover:text-red-400 font-bold transition">Theatre</Link>
                )}
                
                <div className="flex items-center space-x-2 text-white bg-white/10 px-4 py-2 rounded-full border border-white/5 hover:bg-white/20 transition cursor-pointer">
                  <FaUserCircle className="text-xl" />
                  <span className="font-semibold text-sm">{user.name}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition group"
                >
                  <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link to="/login" className="text-white/80 hover:text-white font-bold transition">Sign In</Link>
                <Link to="/admin/login" className="text-amber-400/80 hover:text-amber-400 font-bold text-sm transition hidden sm:block">Admin</Link>
                <Link to="/register" className="px-6 py-2.5 bg-[#e50914] text-white font-bold rounded-md hover:bg-red-700 transition shadow-[0_0_15px_rgba(229,9,20,0.4)] hover:shadow-[0_0_25px_rgba(229,9,20,0.6)] hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </motion.header>

      <main className="flex-grow flex flex-col relative z-0">
        <Outlet />
      </main>

      <footer className="p-10 text-center text-gray-500 border-t border-white/5 mt-auto bg-black relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-black text-white/20 tracking-[0.2em] mb-4">CINEVERSE</h2>
          <div className="flex space-x-6 mb-6">
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Help Center</a>
          </div>
          <p className="font-medium tracking-wide text-sm">&copy; {new Date().getFullYear()} CineVerse. Built for Cinema Lovers.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
