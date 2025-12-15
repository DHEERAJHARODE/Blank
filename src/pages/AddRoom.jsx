import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "./AddRoom.css";

const AddRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageBase64 = null;

      if (imageFile) {
        // Compress image
        const options = {
          maxSizeMB: 0.5, // max 0.5MB
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(imageFile, options);

        // Convert to Base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      }

      await addDoc(collection(db, "rooms"), {
        title,
        rent,
        location,
        image: imageBase64,
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

        <div className="form-group">
          <label>Room Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImageFile(file);

              // Preview
              const reader = new FileReader();
              reader.onloadend = () => setImagePreview(reader.result);
              reader.readAsDataURL(file);
            }}
            required
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                marginTop: "10px",
                width: "100%",
                borderRadius: "10px",
                maxHeight: "200px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <button disabled={loading} type="submit">
          {loading ? "Saving..." : "Publish Room"}
        </button>
      </form>
    </div>
  );
};

export default AddRoom;
