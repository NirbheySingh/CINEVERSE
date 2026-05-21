import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import AdminSelect from './AdminSelect';
import Input from '../common/Input';
import { createAdminShow, clearAdminMessage } from '../../redux/slices/adminSlice';

const TIME_SLOTS = [
  '10:00 AM', '12:30 PM', '03:00 PM', '05:30 PM', '08:00 PM', '10:30 PM',
];

const emptyForm = {
  movieId: '',
  theatreId: '',
  screenId: '',
  date: '',
  time: '',
};

const ShowForm = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { formOptions, isSubmitting, isError, message } = useSelector((state) => state.admin);
  const [form, setForm] = useState(emptyForm);

  const selectedTheatre = formOptions.theatres?.find((t) => t._id === form.theatreId);
  const screenOptions = (selectedTheatre?.screens || []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.capacity} seats)`,
  }));

  const movieOptions = (formOptions.movies || []).map((m) => ({
    value: m._id,
    label: m.title,
  }));

  const theatreOptions = (formOptions.theatres || []).map((t) => ({
    value: t._id,
    label: `${t.name} — ${t.city}`,
  }));

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm);
      dispatch(clearAdminMessage());
    }
  }, [isOpen, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'theatreId') {
        next.screenId = '';
      }
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createAdminShow(form));
    if (createAdminShow.fulfilled.match(result)) {
      setForm(emptyForm);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass w-full max-w-lg rounded-2xl p-8 border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Schedule New Show</h3>
              <p className="text-sm text-gray-400 mt-1">Link a movie to a theatre screen and time slot</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <FaTimes />
            </button>
          </div>

          {isError && message && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {message}
            </div>
          )}

          {formOptions.movies?.length === 0 || formOptions.theatres?.length === 0 ? (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm">
              Seed movies and theatres first: run <code className="text-primary">node seeder.js</code> and{' '}
              <code className="text-primary">node seederTheatres.js</code> in the backend folder.
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <AdminSelect
                label="Movie"
                name="movieId"
                value={form.movieId}
                onChange={onChange}
                options={movieOptions}
                placeholder="Select a movie"
                required
              />
              <AdminSelect
                label="Theatre"
                name="theatreId"
                value={form.theatreId}
                onChange={onChange}
                options={theatreOptions}
                placeholder="Select a theatre"
                required
              />
              <AdminSelect
                label="Screen"
                name="screenId"
                value={form.screenId}
                onChange={onChange}
                options={screenOptions}
                placeholder={form.theatreId ? 'Select a screen' : 'Choose theatre first'}
                required
                disabled={!form.theatreId}
              />
              <Input
                label="Show Date"
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                required
              />
              <AdminSelect
                label="Show Time"
                name="time"
                value={form.time}
                onChange={onChange}
                options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                placeholder="Select time slot"
                required
              />
              <div className="mt-6 flex gap-3">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  <span className="flex items-center justify-center gap-2">
                    <FaPlus /> Create Show
                  </span>
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-md border border-white/20 text-gray-300 hover:bg-white/10 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShowForm;
