import { createSlice } from '@reduxjs/toolkit';

const saved = JSON.parse(localStorage.getItem('viewPrefs') || '{}');

const viewSlice = createSlice({
  name: 'view',
  initialState: {
    units:      saved.units      || 'grid',
    properties: saved.properties || 'grid',
    customers:  saved.customers  || 'table',
    payments:   saved.payments   || 'table',
    expenses:   saved.expenses   || 'table',
  },
  reducers: {
    setView: (state, { payload: { page, view } }) => {
      state[page] = view;
      localStorage.setItem('viewPrefs', JSON.stringify({ ...state, [page]: view }));
    },
  },
});

export const { setView } = viewSlice.actions;
export default viewSlice.reducer;
