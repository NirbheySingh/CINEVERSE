import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  theatres: [],
  shows: [],
  currentShowDetails: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getShowsForMovie = createAsyncThunk('booking/getShows', async ({ movieId, city }, thunkAPI) => {
  try {
    const response = await api.get(`/theatres/shows?movieId=${movieId}&city=${city}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getShowDetails = createAsyncThunk('booking/getShowDetails', async (showId, thunkAPI) => {
  try {
    const response = await api.get(`/theatres/shows/${showId}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShowsForMovie.pending, (state) => { state.isLoading = true; })
      .addCase(getShowsForMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shows = action.payload;
      })
      .addCase(getShowsForMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getShowDetails.pending, (state) => { state.isLoading = true; })
      .addCase(getShowDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShowDetails = action.payload;
      });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
