import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const RoomDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "rooms", id)).then((snap) => {
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", id),
      where("seekerId", "==", user.uid)
    );

    getDocs(q).then((snap) => {
      if (!snap.empty) setRequested(true);
    });
  }, [user, id]);

  const handleBooking = async () => {
    await addDoc(collection(db, "bookings"), {
      roomId: id,
      ownerId: room.ownerId,
      seekerId: user.uid,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      userId: room.ownerId,
      message: `📩 Booking request for "${room.title}"`,
      redirectTo: "/booking-requests",
      read: false,
      createdAt: serverTimestamp(),
    });

    setRequested(true);
  };

  if (!room) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>{room.title}</h2>

      {room.status === "booked" && <p>❌ Room booked</p>}

      {user?.uid !== room.ownerId && room.status !== "booked" && (
        <button disabled={requested} onClick={handleBooking}>
          {requested ? "Request Sent" : "Request Booking"}
        </button>
      )}
    </div>
  );
};

export default RoomDetails;
