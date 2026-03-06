// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoGsnP0x1B61U4wh7AqmonoxL-TcA3tyw",
  authDomain: "emotionapp-70c05.firebaseapp.com",
  projectId: "emotionapp-70c05",
  storageBucket: "emotionapp-70c05.firebasestorage.app",
  messagingSenderId: "661812792903",
  appId: "1:661812792903:web:8607ef9d56646f63dc6b62",
  measurementId: "G-4FPQTP3RJW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
// export const auth = getAuth(app);
