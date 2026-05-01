// ─────────────────────────────────────────────────────────────────────────────
// src/firebase/config.ts
//
// This file starts up (initializes) Firebase so the rest of the app can use it.
// Firebase is Google's platform that gives us:
//   • Authentication  → let users log in with Google or phone number
//   • Firestore       → a database to save user settings (home country, theme…)
//
// HOW FIREBASE WORKS:
//   1. You create a project on firebase.google.com
//   2. Firebase gives you a "config" object with secret keys
//   3. You call initializeApp(config) once when the app starts
//   4. After that, every other Firebase function knows which project to talk to
// ─────────────────────────────────────────────────────────────────────────────

// Import the main Firebase "start up" function from the Firebase SDK
import { initializeApp }          from "firebase/app";

// Import getAuth so we can manage user logins (Google, phone, etc.)
import { getAuth }                from "firebase/auth";

// Import getFirestore so we can read/write data to the Firestore database
import { getFirestore }           from "firebase/firestore";

// ─── Firebase configuration object ──────────────────────────────────────────
// These values come from: Firebase Console → Project Settings → Your Apps → SDK setup
// We read them from the .env file (import.meta.env.VITE_...) so the keys are
// never hard-coded directly in source code that might get shared.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,            // identifies your Firebase project to Google's servers
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,        // the domain used for Google sign-in popup
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,         // your unique project name in Firebase
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,     // where uploaded files would be stored (future use)
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,// used for push notifications (future use)
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              // unique ID for this web app within the project
};

// ─── Initialize Firebase ─────────────────────────────────────────────────────
// initializeApp() connects our app to the Firebase project.
// It must be called exactly ONCE before using any other Firebase feature.
// We store the result in `app` — other Firebase services need it as a reference.
const app = initializeApp(firebaseConfig);

// ─── Get Auth service ────────────────────────────────────────────────────────
// getAuth(app) returns the Authentication service tied to our Firebase project.
// We export it so other files (like AuthModal.tsx) can call signInWithGoogle(),
// signInWithPhoneNumber(), onAuthStateChanged(), etc.
export const auth = getAuth(app);

// ─── Get Firestore database service ─────────────────────────────────────────
// getFirestore(app) returns a reference to our Firestore database.
// We export it so other files can read/write documents (user settings, etc.)
export const db = getFirestore(app);

// Export the app itself in case any other file needs it directly
export default app;
