import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";

const BookingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = [];

      for (let docSnap of snapshot.docs) {
        const data = docSnap.data();
        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));

        list.push({
          id: docSnap.id,
          ...data,
          roomTitle: roomSnap.exists()
            ? roomSnap.data().title
            : "Unknown Room",
        });
      }

      setRequests(list);
    });

    return () => unsubscribe();
  }, [user]);

  // ✅ ACCEPT BOOKING
  const handleAccept = async (booking) => {
    // 1️⃣ Accept booking
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "accepted",
    });

    // 2️⃣ Mark room booked
    await updateDoc(doc(db, "rooms", booking.roomId), {
      status: "booked",
    });

    // 3️⃣ Notify accepted seeker (FIXED ROUTE)
    await addDoc(collection(db, "notifications"), {
      userId: booking.seekerId,
      message: `🎉 Your booking for "${booking.roomTitle}" was accepted`,
      type: "booking",
      roomId: booking.roomId,
      redirectTo: `/room/${booking.roomId}`, // ✅ FIXED
      read: false,
      createdAt: Timestamp.now(),
    });

    // 4️⃣ Reject other pending bookings
    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", booking.roomId),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);

    snap.forEach(async (d) => {
      const data = d.data();

      await updateDoc(doc(db, "bookings", d.id), {
        status: "rejected",
      });

      await addDoc(collection(db, "notifications"), {
        userId: data.seekerId,
        message: `❌ Booking rejected. Room already booked.`,
        type: "booking",
        roomId: booking.roomId,
        redirectTo: `/room/${booking.roomId}`, // ✅ FIXED
        read: false,
        createdAt: Timestamp.now(),
      });
    });

    alert("Booking accepted!");
  };

  // ❌ REJECT BOOKING
  const handleReject = async (booking) => {
    await updateDoc(doc(db, "bookings", booking.id), {
      status: "rejected",
    });

    await addDoc(collection(db, "notifications"), {
      userId: booking.seekerId,
      message: `❌ Your booking for "${booking.roomTitle}" was rejected`,
      type: "booking",
      roomId: booking.roomId,
      redirectTo: `/room/${booking.roomId}`, // ✅ FIXED
      read: false,
      createdAt: Timestamp.now(),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Booking Requests</h2>

      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <h3>{req.roomTitle}</h3>
          <p><b>Seeker ID:</b> {req.seekerId}</p>
          <p><b>Status:</b> {req.status}</p>

          {req.status === "pending" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleAccept(req)}>✔ Accept</button>
              <button
                onClick={() => handleReject(req)}
                style={{ background: "red", color: "#fff" }}
              >
                ✖ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
};

export default BookingRequests;
