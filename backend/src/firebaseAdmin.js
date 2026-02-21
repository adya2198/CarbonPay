// // backend/src/firebaseAdmin.js

// import admin from "firebase-admin";
// import dotenv from "dotenv";

// dotenv.config();

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     }),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // optional
//   });
// }

// export const firebaseAdmin = admin;

// backend/src/firebaseAdmin.js

// backend/src/firebaseAdmin.js

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the service account file
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");

// Read and parse the JSON key
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const firebaseAdmin = admin;