import { initializeApp, getApps, cert } from "firebase-admin/app";

export function initializeFirebaseAdmin() {
  if (getApps().length > 0) return; // already initialized

  const projectId = process.env.FIREBASE_PROJECT_ID || "elsarh-real-estate";

  // If you have a service account JSON file, set FIREBASE_SERVICE_ACCOUNT_JSON env var
  // Otherwise we use the project ID only (works for token verification with public keys)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({ credential: cert(serviceAccount) });
      console.log("✅ Firebase Admin initialized with service account");
      return;
    } catch (e) {
      console.warn("⚠️ Firebase service account JSON invalid, falling back to projectId");
    }
  }

  // Fallback: initialize with just the project ID
  // Token verification still works using Google's public keys
  initializeApp({ projectId });
  console.log("✅ Firebase Admin initialized with projectId:", projectId);
}
