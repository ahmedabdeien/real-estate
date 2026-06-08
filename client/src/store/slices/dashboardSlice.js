import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const [projects, units, leads, tasks] = await Promise.allSettled([
        api.get("/projects?limit=1000"),
        api.get("/units?limit=1000"),
        api.get("/leads?limit=1000"),
        api.get("/tasks?limit=1000"),
      ]);
      return {
        projectsCount: projects.value?.data?.total ?? projects.value?.data?.projects?.length ?? 0,
        unitsCount: units.value?.data?.total ?? units.value?.data?.units?.length ?? 0,
        leadsCount: leads.value?.data?.total ?? leads.value?.data?.leads?.length ?? 0,
        tasksCount: tasks.value?.data?.total ?? tasks.value?.data?.tasks?.length ?? 0,
        recentLeads: leads.value?.data?.leads?.slice(0, 5) ?? [],
        recentTasks: tasks.value?.data?.tasks?.filter((t) => t.status !== "done")?.slice(0, 5) ?? [],
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      projectsCount: 0,
      unitsCount: 0,
      leadsCount: 0,
      tasksCount: 0,
      recentLeads: [],
      recentTasks: [],
    },
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    resetDashboard(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => {
        state.stats = payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
