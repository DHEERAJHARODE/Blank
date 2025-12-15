import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) setRole(docSnap.data().role);

      setLoading(false);
    };

    fetchRole();
  }, [user]);

  if (loading) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back, <span>{user.email}</span></p>
      </div>

      {role === "owner" && <OwnerDashboard />}
      {role === "room-seeker" && <SeekerDashboard />}
    </div>
  );
};

/* OWNER */
const OwnerDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <h3 className="role-title">Owner Panel</h3>

      <div className="dashboard-grid">
        <div
          className="dashboard-card"
          onClick={() => navigate("/add-room")}
        >
          <h4>➕ Add New Room</h4>
          <p>List a new room for rent</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/my-rooms")}
        >
          <h4>🏠 My Rooms</h4>
          <p>View & manage your rooms</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/booking-requests")}
        >
          <h4>📩 Booking Requests</h4>
          <p>Approve or reject requests</p>
        </div>
      </div>
    </>
  );
};

/* SEEKER */
const SeekerDashboard = () => (
  <>
    <h3 className="role-title">Room Seeker Panel</h3>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h4>🔍 Browse Rooms</h4>
        <p>Find rooms that match your needs</p>
      </div>

      <div className="dashboard-card">
        <h4>📨 My Requests</h4>
        <p>Track your booking requests</p>
      </div>
    </div>
  </>
);

export default Dashboard;
