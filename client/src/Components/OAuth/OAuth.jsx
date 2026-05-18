import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useState } from "react";
import { TbLoaderQuarter } from "react-icons/tb";
import { HiExclamation } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FIREBASE_ERROR_MESSAGES = {
  "auth/unauthorized-domain":    "النطاق غير مصرح به في Firebase — أضف النطاق في Firebase Console.",
  "auth/popup-blocked":          "تم حجب النافذة المنبثقة. يرجى السماح بها في المتصفح.",
  "auth/account-exists-with-different-credential":
    "يوجد حساب بهذا البريد بطريقة تسجيل مختلفة.",
  "auth/operation-not-allowed":
    "هذه الطريقة غير مفعّلة — فعّلها من Firebase Console.",
};

export default function OAuth({ redirectTo = "/" }) {
  const { loginWithGoogle, loginWithFacebook, loginWithApple } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null); // "google" | "facebook" | "apple" | null
  const [error, setError] = useState(null);

  const handleLogin = async (provider, fn) => {
    setError(null);
    setLoading(provider);
    try {
      await fn();
      navigate(redirectTo);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        // user cancelled — no error
      } else {
        setError(FIREBASE_ERROR_MESSAGES[err.code] || err.message || "حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setLoading(null);
    }
  };

  const btnBase =
    "w-full py-3 flex items-center justify-center gap-3 font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 rounded-none";

  return (
    <div className="w-full space-y-2.5">
      {/* Google */}
      <button
        type="button"
        onClick={() => handleLogin("google", loginWithGoogle)}
        disabled={!!loading}
        className={btnBase}
        style={{
          background: "white",
          border: "1.5px solid rgba(138,105,36,0.2)",
          color: "#12283C",
          boxShadow: "0 2px 8px rgba(18,40,60,0.06)",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(138,105,36,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(138,105,36,0.2)"; }}
      >
        {loading === "google" ? (
          <TbLoaderQuarter className="animate-spin text-xl" style={{ color: "#8A6924" }} />
        ) : (
          <>
            <FcGoogle size={20} />
            <span>متابعة بواسطة Google</span>
          </>
        )}
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={() => handleLogin("facebook", loginWithFacebook)}
        disabled={!!loading}
        className={btnBase}
        style={{
          background: "white",
          border: "1.5px solid rgba(24,119,242,0.25)",
          color: "#12283C",
          boxShadow: "0 2px 8px rgba(18,40,60,0.06)",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(24,119,242,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(24,119,242,0.25)"; }}
      >
        {loading === "facebook" ? (
          <TbLoaderQuarter className="animate-spin text-xl text-[#1877F2]" />
        ) : (
          <>
            <FaFacebook size={20} className="text-[#1877F2]" />
            <span>متابعة بواسطة Facebook</span>
          </>
        )}
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleLogin("apple", loginWithApple)}
        disabled={!!loading}
        className={btnBase}
        style={{
          background: "white",
          border: "1.5px solid rgba(0,0,0,0.15)",
          color: "#12283C",
          boxShadow: "0 2px 8px rgba(18,40,60,0.06)",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}
      >
        {loading === "apple" ? (
          <TbLoaderQuarter className="animate-spin text-xl text-black" />
        ) : (
          <>
            <FaApple size={22} className="text-black" />
            <span>متابعة بواسطة Apple</span>
          </>
        )}
      </button>

      {error && (
        <div
          className="flex items-start gap-2 p-3 text-xs font-medium"
          style={{ background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626" }}
        >
          <HiExclamation className="shrink-0 mt-0.5" size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
