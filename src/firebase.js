import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyDPXSnCB9EYclXdEDreQ8Rtnqc7w9yZAzk",
  authDomain: "fir-3f832.firebaseapp.com",
  projectId: "fir-3f832",
  storageBucket: "fir-3f832.firebasestorage.app",
  messagingSenderId: "642751756246",
  appId: "1:642751756246:web:afe6f52a3b522426f39677"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestoreDb =getFirestore(app);
export const googleProvider = new GoogleAuthProvider();