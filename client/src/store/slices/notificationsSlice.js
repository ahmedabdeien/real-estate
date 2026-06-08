import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications?limit=30");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications/unread-count");
      return res.data.count ?? 0;
    } catch {
      return rejectWithValue(0);
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/mark-all-read");
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification(state, { payload }) {
      state.list.unshift(payload);
      if (!payload.read) state.unreadCount += 1;
    },
    decrementUnread(state) {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    setUnreadCount(state, { payload }) {
      state.unreadCount = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.list = payload.notifications || payload || [];
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.list = state.list.map((n) => ({ ...n, read: true }));
      });
  },
});

export const { addNotification, decrementUnread, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
