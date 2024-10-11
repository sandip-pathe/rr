import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";




const firebaseConfig = {
  apiKey: "AIzaSyCbZ2UJYQ64x7dV--BASCyH-gycriurzxU",
  authDomain: "notify-3cb81.firebaseapp.com",
  projectId: "notify-3cb81",
  storageBucket: "notify-3cb81.appspot.com",
  messagingSenderId: "119896455826",
  appId: "1:119896455826:web:639364f1bf90603d3a444b",
  measurementId: "G-HXM7PM8LT4"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);