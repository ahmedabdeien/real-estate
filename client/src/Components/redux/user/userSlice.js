import {createSlice} from '@reduxjs/toolkit'

const initialState ={
    currentUser:null,
    error:null,
    loading:false,
};

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        signInStart:(state)=>{
            state.loading = true;
        },
        signInSuccess:(state,action)=>{
            state.currentUser = action.payload;            
            state.loading = false;
            state.error = null;
        },
        signInFailure:(state,action)=>{
            state.error = action.payload;
            state.loading = false;
           
        },
        updateStart: (state) =>{
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state,action) =>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFailure: (state,action) =>{
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart:(state)=>{
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess:(state)=>{
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure:(state,action)=>{
            state.error = action.payload;
            state.loading = false;
        },

        logOutUserStart:(state)=>{
            state.loading = true;
        },
        logOutUserSuccess:(state)=>{
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        logOutUserFailure:(state,action)=>{
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateFailure,
    updateSuccess,
    updateStart,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    logOutUserStart,
    logOutUserSuccess,
    logOutUserFailure,
  } = userSlice.actions;
export default userSlice.reducer;