// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANB_lV7QqEU8t91mdCanWL7lTx1z3Xmeg",
  authDomain: "ganttchartdb.firebaseapp.com",
  projectId: "ganttchartdb",
  storageBucket: "ganttchartdb.firebasestorage.app",
  messagingSenderId: "922366998782",
  appId: "1:922366998782:web:19894a40c24bd5667ecdaf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
export default auth;
