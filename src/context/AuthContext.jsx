import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // 🛑 NOT LOGGED IN → DO NOTHING
      if (!currentUser) return;

      // 🚨 EMAIL NOT VERIFIED
      if (!currentUser.emailVerified) {
        // already on verify page? then don't loop
        if (location.pathname !== "/verify-email") {
          navigate("/verify-email", { replace: true });
        }
        return;
      }

      // ✅ EMAIL VERIFIED → ALLOW NORMAL FLOW
      if (
        currentUser.emailVerified &&
        (location.pathname === "/login" ||
          location.pathname === "/register" ||
          location.pathname === "/verify-email")
      ) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => unsub();
  }, [navigate, location.pathname]);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ✅ GOOGLE SIGN IN (UNCHANGED LOGIC)
  const signInWithGoogle = async (navigate) => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isNewUser = result._tokenResponse?.isNewUser;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (isNewUser || !snap.exists()) {
      navigate("/choose-role"); // 👈 NEW GOOGLE USER
    } else {
      navigate("/dashboard"); // 👈 EXISTING USER
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, logout, signInWithGoogle }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
