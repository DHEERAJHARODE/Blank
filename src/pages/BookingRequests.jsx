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
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const BookingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];

      for (let d of snap.docs) {
        const data = d.data();
        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomSnap.data()?.title,
        });
      }

      setRequests(list);
    });

    return () => unsub();
  }, [user?.uid]);

  const accept = async (b) => {
    await updateDoc(doc(db, "bookings", b.id), { status: "accepted" });
    await updateDoc(doc(db, "rooms", b.roomId), { status: "booked" });

    await addDoc(collection(db, "notifications"), {
      userId: b.seekerId,
      message: `🎉 Booking accepted for "${b.roomTitle}"`,
      redirectTo: `/room/${b.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });

    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", b.roomId),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    snap.forEach((d) =>
      updateDoc(doc(db, "bookings", d.id), { status: "rejected" })
    );
  };

  const reject = async (b) => {
    await updateDoc(doc(db, "bookings", b.id), { status: "rejected" });

    await addDoc(collection(db, "notifications"), {
      userId: b.seekerId,
      message: `❌ Booking rejected`,
      redirectTo: `/room/${b.roomId}`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Booking Requests</h2>

      {requests.map((r) => (
        <div key={r.id}>
          <p>{r.roomTitle}</p>
          {r.status === "pending" && (
            <>
              <button onClick={() => accept(r)}>Accept</button>
              <button onClick={() => reject(r)}>Reject</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingRequests;
