
import { FcGoogle } from "react-icons/fc";
import {GoogleAuthProvider, getAuth,signInWithPopup} from 'firebase/auth'
import { useDispatch } from 'react-redux';
import {signInSuccess} from '../redux/user/userSlice'
import { app } from "../../firebase";
import { useNavigate } from 'react-router-dom';
import React from "react";
 
export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch("/api/auth/google", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      
      if (error.code === "auth/popup-closed-by-user") {
        // Handle user closing the popup
        console.log("User closed the popup");
      } else {
        // Handle other authentication errors
        console.error("Authentication error:", error);
      }
    }
  };
  return (
    <button  onClick={handleGoogleClick} type='button'
    className=' hover:shadow text-black py-2 rounded border-2 hover:bg-white bg-gray-100 active:ring-offset-0 flex justify-center items-center'>
        <FcGoogle className='mx-1 text-lg '/>
        <span>Google</span>
    </button>
  )
}

