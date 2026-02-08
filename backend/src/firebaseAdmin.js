import admin from "firebase-admin";
import dotenv from "dotenv";
export const storage = getStorage(app);


dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAdmin = admin;
