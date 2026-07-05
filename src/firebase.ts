/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyALscVEz80kYThISGxgMzeuKP5G1mTBuGI",
  authDomain: "reference-kingdom-n3bk6.firebaseapp.com",
  projectId: "reference-kingdom-n3bk6",
  storageBucket: "reference-kingdom-n3bk6.firebasestorage.app",
  messagingSenderId: "586982331148",
  appId: "1:586982331148:web:bb89434be42890f5f4af29"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom databaseId for Firestore
const firestoreDatabaseId = "ai-studio-c736de51-a89d-413a-8919-b1e82efb056f";
export const db = getFirestore(app, firestoreDatabaseId);

// Helper to check if currently rendered inside an iframe
export const isIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Safe fallback
  }
};

export { 
  signInWithPopup, 
  signInWithRedirect,
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
};
export type { User };
