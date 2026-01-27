
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDD35BVMFNTK_bOU9oj2xM04tLx2vkyBPw",
  authDomain: "crypto-blog-7fc3b.firebaseapp.com",
  projectId: "crypto-blog-7fc3b",
  storageBucket: "crypto-blog-7fc3b.firebasestorage.app",
  messagingSenderId: "27977826846",
  appId: "1:27977826846:web:eb93a3a3515f3f42fa640f",
  measurementId: "G-5PCVHTSYE7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
