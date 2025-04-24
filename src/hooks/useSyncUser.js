// src/hooks/useSyncUser.js
import { useEffect } from "react";
import { useUser,useAuth } from "@clerk/clerk-react";
import { useApiAuth } from "../services/api";
import axios from "axios";
export const useSyncUser = () => {
  const { isSignedIn, user } = useUser();
  const {getToken}=useAuth();
//   const dispatch=useDispatch();
//  const openModal=()=>{
//     dispatch(openAuthModal());
//  }
  useEffect(() => {
    const sync = async () => {
      if (!isSignedIn || !user) return;

      try {
        const {userApi}=useApiAuth(getToken,);
        const data= {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        await userApi.checkOrCreateUser(data);
      } catch (err) {
        console.error("Failed to sync user:", err);
      }
    };
    sync();
  }, [isSignedIn, user]);
};
