import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { app } from "../../firebase";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { TbLoaderQuarter } from "react-icons/tb";
import { HiExclamation } from "react-icons/hi";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
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

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'فشل تسجيل الدخول بجوجل');

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      console.error("Google auth error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('النطاق غير مصرح به في Firebase. أضف localhost إلى Authorized Domains في Firebase Console.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(null); // user cancelled - no error shown
      } else if (err.code === 'auth/popup-blocked') {
        setError('تم حجب النافذة المنبثقة. يرجى السماح لها في المتصفح والمحاولة مجدداً.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول بجوجل.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full py-3 flex items-center justify-center gap-3 font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
        style={{
          background: 'white',
          border: '1.5px solid rgba(138,105,36,0.2)',
          color: '#12283C',
          boxShadow: '0 2px 8px rgba(18,40,60,0.06)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(138,105,36,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(138,105,36,0.2)'; }}
      >
        {isLoading ? (
          <TbLoaderQuarter className="animate-spin text-xl" style={{ color: '#8A6924' }} />
        ) : (
          <>
            <FcGoogle size={20} />
            <span>متابعة بواسطة Google</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 text-xs font-medium rounded-none"
          style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
          <HiExclamation className="shrink-0 mt-0.5" size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
