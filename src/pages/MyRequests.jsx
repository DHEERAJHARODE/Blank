import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import "./MyRequests.css";

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "bookings"), where("seekerId", "==", user.uid));

    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      for (let d of snap.docs) {
        const data = d.data();
        const roomSnap = await getDoc(doc(db, "rooms", data.roomId));

        list.push({
          id: d.id,
          ...data,
          roomTitle: roomSnap.data()?.title || "Room",
        });
      }
      setRequests(list);
    });

    return () => unsub();
  }, [user?.uid]);

  return (
    <div className="my-requests-page">
      <h2>My Booking Requests</h2>

      {requests.length === 0 ? (
        <p className="empty">No booking requests yet 📭</p>
      ) : (
        <div className="requests-list">
          {requests.map((r) => (
            <div className="request-card" key={r.id}>
              <h4>{r.roomTitle}</h4>
              <p>Status: <span className={`status ${r.status}`}>{r.status}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
