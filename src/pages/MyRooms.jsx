import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./MyRooms.css";

const MyRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "rooms"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setRooms(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    await deleteDoc(doc(db, "rooms", id));
  };

  return (
    <div className="myrooms-page">
      <div className="header">
        <h2>My Rooms</h2>
        <button onClick={() => navigate("/add-room")}>
          + Add Room
        </button>
      </div>

      {loading && <p>Loading your rooms...</p>}

      {!loading && rooms.length === 0 && (
        <div className="empty">
          <p>You haven’t added any rooms yet.</p>
          <button onClick={() => navigate("/add-room")}>
            List your first room
          </button>
        </div>
      )}

      <div className="room-grid">
        {rooms.map((room) => (
          <div className="room-card" key={room.id}>
            <div className="room-top">
              <h3>{room.title}</h3>
              <span
                className={`status ${
                  room.status === "booked" ? "booked" : "available"
                }`}
              >
                {room.status || "available"}
              </span>
            </div>

            <p className="location">{room.location}</p>
            <p className="rent">₹{room.rent} / month</p>

            <div className="actions">
              <button
                className="edit"
                onClick={() => navigate(`/edit-room/${room.id}`)}
              >
                ✏️ Edit
              </button>

              <button
                className="delete"
                onClick={() => handleDelete(room.id)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRooms;
