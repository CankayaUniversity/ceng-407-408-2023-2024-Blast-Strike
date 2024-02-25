// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig  = {
  apiKey: "AIzaSyDdoDVEz6wVhYYhQ8mEMdImAE2Ox9OvM40",
  authDomain: "blaststrikereactnative.firebaseapp.com",
  projectId: "blaststrikereactnative",
  storageBucket: "blaststrikereactnative.appspot.com",
  messagingSenderId: "963338014725",
  appId: "1:963338014725:web:a42d177630d0d542bacc6c",
  measurementId: "G-1V3JR0XB21"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

 
export { db };