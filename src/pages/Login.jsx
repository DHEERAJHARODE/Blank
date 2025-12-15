import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, messaging } from "../firebase/firebaseConfig";
import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔔 Save FCM Token
  const saveFcmToken = async (user) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: "BFRmxxb7F7Ysi6B4RgbXFlzib5Hytpl8Ky_hyUovI9ys-ZMv5kEaA8I4_s-jh4ikMxQgXPwjZKiFo2JlsD1bYtM",
      });

      if (!token) return;

      await updateDoc(doc(db, "users", user.uid), {
        fcmToken: token,
        updatedAt: new Date(),
      });

      console.log("FCM token saved ✅");
    } catch (error) {
      console.error("FCM error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 SAVE TOKEN AFTER LOGIN
      await saveFcmToken(user);

      alert("Login successful ✅");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
  },
};

export default Login;
