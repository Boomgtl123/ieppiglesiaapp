import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCYaR5diu-Y7_ji3wu4bNxuH14uT1wOUYw",
  authDomain: "iepp-67678.firebaseapp.com",
  databaseURL: "https://iepp-67678-default-rtdb.firebaseio.com",
  projectId: "iepp-67678",
  storageBucket: "iepp-67678.firebasestorage.app",
  messagingSenderId: "1077203592518",
  appId: "1:1077203592518:web:a8d034e3ad841106f8b147",
  measurementId: "G-SR7Y043NMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators if running locally
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5002);
  connectFirestoreEmulator(db, "localhost", 8080);
}
