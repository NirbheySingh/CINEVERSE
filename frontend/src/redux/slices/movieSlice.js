import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  movies: [],
  trending: [],
  upcoming: [],
  movieDetails: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  searchTerm: '',
  selectedGenre: 'All',
};

export const getMovies = createAsyncThunk('movies/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/movies');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getTrendingMovies = createAsyncThunk('movies/getTrending', async (_, thunkAPI) => {
  try {
    const response = await api.get('/movies/trending');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMovieById = createAsyncThunk('movies/getById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/movies/${id}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    resetMovieState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedGenre: (state, action) => {
      state.selectedGenre = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMovies.pending, (state) => { state.isLoading = true; })
      .addCase(getMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.movies = action.payload.movies;
      })
      .addCase(getMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrendingMovies.fulfilled, (state, action) => {
        state.trending = action.payload;
      })
      .addCase(getMovieById.pending, (state) => { state.isLoading = true; })
      .addCase(getMovieById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movieDetails = action.payload;
      });
  },
});

export const { resetMovieState, setSearchTerm, setSelectedGenre } = movieSlice.actions;
export default movieSlice.reducer;
