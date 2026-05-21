import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movie: movieReducer,
    booking: bookingReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
