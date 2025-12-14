import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  const handleClick = async (n) => {
    await updateDoc(doc(db, "notifications", n.id), { read: true });
    navigate(n.redirectTo);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav style={styles.nav}>
      <h3>RoomRent</h3>

      <div style={styles.links}>
        <Link to="/">Home</Link>

        {user && (
          <div style={{ position: "relative" }}>
            🔔 {unreadCount > 0 && <span>({unreadCount})</span>}
            <div style={styles.dropdown}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    background: n.read ? "#eee" : "#dff6ff",
                  }}
                >
                  {n.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/rooms">Rooms</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#f5f5f5",
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: "25px",
    right: 0,
    width: "300px",
    background: "#fff",
    border: "1px solid #ccc",
    zIndex: 10,
  },
};

export default Navbar;
