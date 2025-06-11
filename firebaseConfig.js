// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8-ll49fMG0jEBaRdKOmWV6SCHy_XiLmw",
  authDomain: "gpa-calculator-36241.firebaseapp.com",
  projectId: "gpa-calculator-36241",
  storageBucket: "gpa-calculator-36241.firebasestorage.app",
  messagingSenderId: "1079293258381",
  appId: "1:1079293258381:web:608bdfa478a23f8da1d0c4",
  measurementId: "G-B234837BVJ"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

export default app;