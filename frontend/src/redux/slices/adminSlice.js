import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  stats: null,
  shows: [],
  formOptions: { movies: [], theatres: [] },
  isLoading: false,
  isSubmitting: false,
  isError: false,
  message: '',
};

export const fetchAdminStats = createAsyncThunk('admin/stats', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/stats');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAdminFormOptions = createAsyncThunk('admin/formOptions', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/form-options');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAdminShows = createAsyncThunk('admin/shows', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/shows');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createAdminShow = createAsyncThunk('admin/createShow', async (showData, thunkAPI) => {
  try {
    const response = await api.post('/admin/shows', showData);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteAdminShow = createAsyncThunk('admin/deleteShow', async (showId, thunkAPI) => {
  try {
    await api.delete(`/admin/shows/${showId}`);
    return showId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminMessage: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchAdminFormOptions.fulfilled, (state, action) => {
        state.formOptions = action.payload;
      })
      .addCase(fetchAdminShows.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminShows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shows = action.payload;
      })
      .addCase(fetchAdminShows.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createAdminShow.pending, (state) => {
        state.isSubmitting = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createAdminShow.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.shows = [action.payload, ...state.shows];
        if (state.stats) {
          state.stats.totalShows = (state.stats.totalShows || 0) + 1;
        }
      })
      .addCase(createAdminShow.rejected, (state, action) => {
        state.isSubmitting = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteAdminShow.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(deleteAdminShow.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.shows = state.shows.filter((s) => s._id !== action.payload);
        if (state.stats && state.stats.totalShows > 0) {
          state.stats.totalShows -= 1;
        }
      })
      .addCase(deleteAdminShow.rejected, (state, action) => {
        state.isSubmitting = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { clearAdminMessage } = adminSlice.actions;
export default adminSlice.reducer;
