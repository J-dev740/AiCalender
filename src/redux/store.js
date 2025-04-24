import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store=configureStore({
    reducer:{
        auth:authReducer,    
    }
})
export default store;



// // Export type-only access for components
// export const useAppDispatch = () => useDispatch();
// export const useAppSelector = useSelector;