import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDBc3cfBSPTd5PrJQ-1T9DLoBS7dEsdp6M",
  authDomain: "ecommercereact-d360f.firebaseapp.com",
  projectId: "ecommercereact-d360f",
  storageBucket: "ecommercereact-d360f.firebasestorage.app",
  messagingSenderId: "125517700975",
  appId: "1:125517700975:web:9073255756670a70dc129a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
