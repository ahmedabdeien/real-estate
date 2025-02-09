import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice'
import { app } from "../../firebase";
import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch("/api/auth/google", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Google authentication failed');
      }

      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.error("Authentication error:", error);
      // Add error toast here if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleGoogleClick}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full py-3 rounded-xl bg-white border border-gray-300 hover:border-blue-500
        hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center
        space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <FcGoogle className="text-xl" />
          <span className="text-gray-700 font-medium">Continue with Google</span>
        </>
      )}
    </motion.button>
  )
}