import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import imageCompression from "browser-image-compression";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setForm(snap.data());
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= IMAGE UPLOAD (BASE64) ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      // Compress image (same logic as AddRoom)
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to Base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });

      // Save image in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        profileImage: base64Image,
      });

      setForm({ ...form, profileImage: base64Image });
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      name: form.name,
      phone: form.phone,
      gender: form.gender,
    });
    alert("Profile updated successfully ✅");
  };

  return (
    <div className="profile-page">
      <h2>Edit Profile</h2>

      {/* ================= PROFILE IMAGE ================= */}
      <div className="photo-section">
        <div className="image-wrapper">
          <img
            src={
              form.profileImage ||
              "https://www.w3schools.com/howto/img_avatar.png"
            }
            alt="Profile"
          />

          {loading && <div className="image-overlay">Uploading...</div>}

          {!loading && (
            <label className="camera-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="camera-icon"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <label>Email</label>
      <input value={user.email} disabled />

      <label>Name</label>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
      />

      <label>Phone</label>
      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone number"
      />

      <label>Gender</label>
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
      >
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <button onClick={saveProfile}>Save Changes</button>
    </div>
  );
};

export default Profile;
