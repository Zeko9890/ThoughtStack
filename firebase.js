import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCpUwOE7LCjgAUfeN2HAs8Tez7jGeYZGgg",
    authDomain: "thoughtstack-6e3e5.firebaseapp.com",
    projectId: "thoughtstack-6e3e5",
    storageBucket: "thoughtstack-6e3e5.firebasestorage.app",
    messagingSenderId: "176500936445",
    appId: "1:176500936445:web:d4d5af28a0164a0b477894",
    measurementId: "G-1CNNHLSF1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Explicitly set Local Persistence so sessions survive browser restarts
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Firebase Auth persistence explicitly set to LOCAL ✅");
    })
    .catch((error) => {
        console.error("Firebase persistence setup failed:", error);
    });

// Attach to window so the rest of the application (non-modules) can access it
window.firebaseDB = db;
window.firebaseAuth = auth;
window.googleProvider = googleProvider;

console.log("Firebase Auth & Firestore ready for ThoughtStack registration! ✅");
