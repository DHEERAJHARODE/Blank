import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./EditRoom.css"; // We'll create a CSS file

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", id));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title);
          setRent(data.rent);
          setLocation(data.location);
        } else {
          alert("Room not found!");
          navigate("/my-rooms");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        alert("Failed to fetch room data.");
        navigate("/my-rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "rooms", id), {
        title,
        rent,
        location,
        updatedAt: new Date(),
      });
      alert("Room updated successfully!");
      navigate("/my-rooms");
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update the room. Please try again.");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="editroom-page">
      <form onSubmit={handleUpdate} className="editroom-form">
        <h2>Edit Room</h2>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Rent</label>
        <input
          type="number"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          required
        />

        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <button type="submit" className="update-btn">
          Update Room
        </button>
      </form>
    </div>
  );
};

export default EditRoom;
