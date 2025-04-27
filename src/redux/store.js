
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import authReducer from "./authSlice";
import eventsReducer from "./eventSlice";
import ragReducer from "./ragSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventsReducer,
        rag: ragReducer

    }
});

// Export type-only access for components
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;