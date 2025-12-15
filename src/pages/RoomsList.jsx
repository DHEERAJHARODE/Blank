import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "./RoomsList.css";

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() })
      );
      setRooms(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="rooms-page">
      <h2>Available Rooms</h2>
      <p className="subtitle">
        Handpicked rooms from trusted owners
      </p>

      {rooms.length === 0 && (
        <div className="empty-state">
          <p>No rooms available yet 🏠</p>
        </div>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <Link
            to={`/room/${room.id}`}
            className="room-link"
            key={room.id}
          >
            <div className="room-card">
              <div className="room-image">
                <span>Room</span>
              </div>

              <div className="room-info">
                <h3>{room.title}</h3>
                <p className="location">📍 {room.location}</p>

                <div className="room-footer">
                  <span className="price">₹{room.rent}/month</span>
                  <span className="view">View</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoomsList;
