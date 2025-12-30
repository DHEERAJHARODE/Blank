import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        alert("Please login again to resend email.");
        navigate("/login");
        return;
      }

      await sendEmailVerification(auth.currentUser);
      alert("Verification email resent. Check inbox or spam.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut(auth); // 🔥 MUST LOGOUT
    navigate("/login");
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify your email</h2>

        <p className="subtitle">
          We’ve sent a verification link to your email.
        </p>

        <p className="info-text">
          Please check your inbox or spam folder and click the
          verification link to activate your account.
        </p>

        <button onClick={handleResend} disabled={loading}>
          {loading ? "Sending..." : "Resend Email"}
        </button>

        <p className="back-login" onClick={handleBackToLogin}>
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
