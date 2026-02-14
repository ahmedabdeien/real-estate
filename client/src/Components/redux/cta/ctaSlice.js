import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ctas: [],
    loading: false,
    error: null,
};

const ctaSlice = createSlice({
    name: 'cta',
    initialState,
    reducers: {
        fetchCTAsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCTAsSuccess: (state, action) => {
            state.ctas = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchCTAsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        createCTASuccess: (state, action) => {
            state.ctas.push(action.payload);
            state.loading = false;
            state.error = null;
        },
        updateCTASuccess: (state, action) => {
            state.ctas = state.ctas.map((cta) =>
                cta._id === action.payload._id ? action.payload : cta
            );
            state.loading = false;
            state.error = null;
        },
        deleteCTASuccess: (state, action) => {
            state.ctas = state.ctas.filter((cta) => cta._id !== action.payload);
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    fetchCTAsStart,
    fetchCTAsSuccess,
    fetchCTAsFailure,
    createCTASuccess,
    updateCTASuccess,
    deleteCTASuccess,
} = ctaSlice.actions;

export default ctaSlice.reducer;
