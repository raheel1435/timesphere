// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useAuth.ts
//
// Manages Firebase Authentication state for the entire app.
//
// WHAT THIS DOES:
//   • Watches whether a user is logged in or out
//   • Provides functions to log in (Google, phone) and log out
//   • Saves/loads the user's profile from Firestore
//
// FIREBASE AUTH FLOW:
//   1. User clicks "Login with Google" → Google popup opens
//   2. User picks their Google account → Firebase gives us a User object
//   3. onAuthStateChanged fires every time the login state changes
//   4. We store the user's profile in Firestore so settings persist
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }                      from "react";
import {
  onAuthStateChanged,      // listens for login/logout events
  signInWithPopup,         // opens a popup for Google login
  GoogleAuthProvider,      // Google sign-in provider
  RecaptchaVerifier,       // required for phone auth (proves user is human)
  signInWithPhoneNumber,   // sends SMS code to phone number
  signOut                  // logs the user out
} from "firebase/auth";
import type {
  User,                    // TypeScript type for a Firebase user
  ConfirmationResult       // returned after sending SMS – used to verify the code
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"; // Firestore functions
import { auth, db }    from "../firebase/config"; // our Firebase instances
import type { UserProfile } from "../types";        // type-only import

// ─────────────────────────────────────────────────────────────────────────────
export function useAuth() {

  // "user" holds the Firebase User object when logged in, or null when logged out
  const [user,        setUser]        = useState<User | null>(null);

  // "profile" holds our extended user data from Firestore (home country, theme, etc.)
  const [profile,     setProfile]     = useState<UserProfile | null>(null);

  // "loading" is true while we're checking if the user is already logged in
  const [loading,     setLoading]     = useState<boolean>(true);

  // "smsResult" stores the result of sending an SMS so we can verify the code later
  const [smsResult,   setSmsResult]   = useState<ConfirmationResult | null>(null);

  // "authError" stores any error message from the login process
  const [authError,   setAuthError]   = useState<string | null>(null);

  // ── Watch for login/logout events ─────────────────────────────────────────
  useEffect(() => {
    async function loadOrCreateProfile(firebaseUser: User) {
      const ref  = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid:          firebaseUser.uid,
          displayName:  firebaseUser.displayName,
          phone:        firebaseUser.phoneNumber,
          homeTimezone: "Europe/Stockholm",
          homeCountry:  "SE",
          theme:        "auto",
          createdAt:    Date.now()
        };
        await setDoc(ref, { ...newProfile, createdAt: serverTimestamp() });
        setProfile(newProfile);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadOrCreateProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── loginWithGoogle ────────────────────────────────────────────────────────
  // Opens a Google sign-in popup.
  // The user picks their Google account and we get back their name/email/photo.
  async function loginWithGoogle() {
    setAuthError(null); // clear previous errors
    try {
      const provider = new GoogleAuthProvider(); // create a Google provider object
      await signInWithPopup(auth, provider);     // open the Google popup window
      // onAuthStateChanged above will fire automatically after success
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google login failed";
      setAuthError(msg);
    }
  }

  // ── sendSmsCode ───────────────────────────────────────────────────────────
  // Sends an SMS verification code to the given phone number.
  // phoneNumber should include country code, e.g. "+46701234567"
  async function sendSmsCode(phoneNumber: string, containerId: string) {
    setAuthError(null); // clear previous errors
    try {
      // RecaptchaVerifier is required by Firebase to prevent bots.
      // "invisible" mode runs silently without showing a CAPTCHA to the user.
      const recaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });

      // Send the SMS and save the result so we can verify the code next
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
      setSmsResult(result); // save for the verification step
      return true;          // tell the caller it worked
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SMS send failed";
      setAuthError(msg);
      return false; // tell the caller it failed
    }
  }

  // ── verifySmsCode ─────────────────────────────────────────────────────────
  // After the user receives the SMS and types the 6-digit code, we verify it.
  async function verifySmsCode(code: string) {
    setAuthError(null);
    if (!smsResult) { setAuthError("No pending SMS verification."); return false; }
    try {
      await smsResult.confirm(code); // confirm() checks the code with Firebase
      setSmsResult(null);            // clear the pending SMS state
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      setAuthError(msg);
      return false;
    }
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await signOut(auth); // Firebase signs the user out
    setProfile(null);    // clear the local profile copy
  }

  // ── updateProfile ─────────────────────────────────────────────────────────
  // Saves changes to the user's profile in Firestore
  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return;
    const ref = doc(db, "users", user.uid);       // document reference
    await setDoc(ref, updates, { merge: true });  // merge: true = only update the changed fields
    setProfile(prev => prev ? { ...prev, ...updates } : null); // update local state too
  }

  // Return everything components need
  return {
    user,           // Firebase User object (or null)
    profile,        // our extended UserProfile (or null)
    loading,        // true while checking auth state on startup
    authError,      // any login error message
    smsResult,      // whether we're waiting for an SMS code
    loginWithGoogle,// function to start Google login
    sendSmsCode,    // function to send an SMS to a phone number
    verifySmsCode,  // function to verify the SMS code the user typed
    logout,         // function to log out
    updateProfile   // function to save settings changes
  };
}
