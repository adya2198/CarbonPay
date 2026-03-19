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