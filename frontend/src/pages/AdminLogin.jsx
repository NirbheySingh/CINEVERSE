import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminLoginUser, reset } from '../redux/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { motion } from 'framer-motion';
import { FaShieldAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isSuccess && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
    dispatch(reset());
  }, [isSuccess, user, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLoginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass rounded-2xl border border-primary/20"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 text-primary text-2xl mb-4">
            <FaShieldAlt />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-gray-400 text-sm">
            Manage shows, stats, and platform data — separate from customer booking.
          </p>
        </div>

        {isError && message && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <Input
            label="Admin Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="admin@cineverse.com"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Admin password"
            required
          />
          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>
              Sign In as Admin
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">Default admin (after seeding):</p>
          <p>Email: admin@cineverse.com</p>
          <p>Password: password123</p>
          <p className="mt-2 text-gray-500">Run <code className="text-primary">node seederTheatres.js</code> in backend if this account does not exist.</p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Booking movies as a customer?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            User Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
