import {createSlice} from '@reduxjs/toolkit';

const authSlice=createSlice({
    name:'auth',
    initialState:{
        open:false,
        isAuthenticated: false,
        authLoading:false,
        user:null
    },
    reducers:{
        openAuthModal: (state) => { 
            state.open = true;
         },
        closeAuthModal: state => { state.open = false },
        setAuthLoading: (state,action) => { state.authLoading = action.payload },
        logoutUser: (state) => {
            state.isAuthenticated = false;
            state.user = null;
          },
          setUser: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
          },
    }
})
export const { openAuthModal, closeAuthModal,setAuthLoading, logoutUser, setUser } = authSlice.actions;
export const selectAuthOpen = state => state.auth.open;
export default authSlice.reducer;