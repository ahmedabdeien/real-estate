import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/settings");
      return res.data.settings || {};
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  "settings/saveSettings",
  async (updates, { rejectWithValue }) => {
    try {
      const res = await api.post("/settings", { updates });
      return res.data.settings || {};
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "خطأ في الحفظ");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: {},
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    updateLocalSetting(state, { payload }) {
      state.data[payload.key] = payload.value;
    },
    resetSettings(state) {
      state.data = {};
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSettings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(saveSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveSettings.fulfilled, (state, { payload }) => {
        state.data = { ...state.data, ...payload };
        state.saving = false;
      })
      .addCase(saveSettings.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { updateLocalSetting, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
