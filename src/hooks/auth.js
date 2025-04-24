// import { useUser } from "@clerk/clerk-react";
// import {useDispatch} from 'react-redux';
// import { openAuthModal } from "../redux/authSlice";

// export const useAuthGuard = () => {
//     const { isSignedIn } = useUser();
//     const dispatch = useDispatch();
//     return (onAuthorized)=>{
//         if(isSignedIn){
//             return onAuthorized();

//         }else{
//             dispatch(openAuthModal());
//         }

//     }
// }