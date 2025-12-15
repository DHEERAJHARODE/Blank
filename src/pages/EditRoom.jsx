import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./EditRoom.css";
import imageCompression from "browser-image-compression";

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", id));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title);
          setRent(data.rent);
          setLocation(data.location);
          if (data.image) setImagePreview(data.image);
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
    setLoading(true);

    try {
      let imageBase64 = imagePreview; // Default to existing preview

      if (imageFile) {
        // Compress new image
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(imageFile, options);

        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      }

      await updateDoc(doc(db, "rooms", id), {
        title,
        rent,
        location,
        image: imageBase64,
        updatedAt: new Date(),
      });

      alert("Room updated successfully!");
      navigate("/my-rooms");
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update the room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="editroom-page">
      <form onSubmit={handleUpdate} className="editroom-form">
        <h2>Edit Room</h2>

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Rent</label>
        <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} required />

        <label>Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />

        <label>Room Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="image-preview"
          />
        )}

        <button type="submit" className="update-btn">
          Update Room
        </button>
      </form>
    </div>
  );
};

export default EditRoom;
