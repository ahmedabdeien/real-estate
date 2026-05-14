import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    fetchConfigStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchConfigSuccess(state, action) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchConfigFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateConfig(state, action) {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export const {
  fetchConfigStart,
  fetchConfigSuccess,
  fetchConfigFailure,
  updateConfig,
} = configSlice.actions;

export default configSlice.reducer;
