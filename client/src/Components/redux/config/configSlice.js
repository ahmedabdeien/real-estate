import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    config: {
        siteName: 'El Sarh Real Estate',
        logo: '/assets/images/logoElsarh.png',
        primaryColor: '#005B94',
        accentColor: '#5BC1D7',
        contact: {
            phone: '+20 121 262 2210',
            email: 'elsarhegypt@gmail.com',
            hotline: '19000',
        },
        socialLinks: {
            facebook: 'https://facebook.com/elsarh',
            instagram: 'https://instagram.com/elsarh',
            whatsapp: 'https://wa.me/201212622210',
        }
    },
    loading: false,
    error: null,
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        fetchConfigStart: (state) => {
            state.loading = true;
        },
        fetchConfigSuccess: (state, action) => {
            state.config = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchConfigFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateConfigSuccess: (state, action) => {
            state.config = { ...state.config, ...action.payload };
        }
    },
});

export const {
    fetchConfigStart,
    fetchConfigSuccess,
    fetchConfigFailure,
    updateConfigSuccess
} = configSlice.actions;

export default configSlice.reducer;
