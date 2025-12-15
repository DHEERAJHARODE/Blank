import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";

const AddRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "rooms"), {
        title,
        rent,
        location,
        ownerId: user.uid,
        status: "available",
        createdAt: new Date(),
      });

      alert("Room listed successfully 🎉");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-page">
      <form className="add-room-card" onSubmit={handleAddRoom}>
        <h2>List a New Room</h2>
        <p className="subtitle">
          Fill in the details to start receiving booking requests
        </p>

        <div className="form-group">
          <label>Room Title</label>
          <input
            placeholder="e.g. Fully furnished room near metro"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Monthly Rent (₹)</label>
          <input
            type="number"
            placeholder="e.g. 8000"
            onChange={(e) => setRent(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            placeholder="e.g. Andheri East, Mumbai"
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <button disabled={loading} type="submit">
          {loading ? "Saving..." : "Publish Room"}
        </button>
      </form>
    </div>
  );
};

export default AddRoom;
