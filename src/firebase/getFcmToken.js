import { messaging } from "./firebaseConfig";
import { getToken } from "firebase/messaging";

export const getFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.log("❌ No token received");
      return null;
    }
  } catch (error) {
    console.error("FCM Error:", error);
    return null;
  }
};
