// Import modules using Google CDN links (V9 Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBguMl7HKPfKqrCZI77HFtZ2VEFvjRAQms",
  authDomain: "acs20251204.firebaseapp.com",
  projectId: "acs20251204",
  storageBucket: "acs20251204.firebasestorage.app",
  messagingSenderId: "1098809722952",
  appId: "1:1098809722952:web:5b63eff20e2a0cc992707d"
};

// Initialize Firebase App and Auth service
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Get DOM Elements ---
const loadEl = document.querySelector('#load');
const userStatusEl = document.querySelector('#user-status');
const userDetailsEl = document.querySelector('#user-details');
const signInBtn = document.querySelector('#google-signin-btn');
const signOutBtn = document.querySelector('#signout-btn');
const errorContainer = document.querySelector('#error-container');

loadEl.textContent = 'Firebase SDK loaded and initializing.';

// --- Helper: Display Error ---
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
  console.error(message);
}

function clearError() {
  errorContainer.style.display = 'none';
  errorContainer.textContent = '';
}

// --- 1. Handle Redirect Result (Check for errors returning from Google) ---
getRedirectResult(auth)
  .then((result) => {
    // If the user just returned from the redirect flow, result will be defined.
    // If they are just loading the page normally, it will be null.
    if (result) {
      console.log("Redirect sign-in successful for:", result.user.email);
      // No need to update UI here, onAuthStateChanged will handle it.
    }
  })
  .catch((error) => {
    showError(`Login Failed: ${error.message}`);
  });

// --- 2. Authentication State Listener ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    userStatusEl.textContent = `Welcome back, ${user.displayName}!`;
    userDetailsEl.innerHTML = `User ID: ${user.uid}<br>Email: ${user.email}`;
    userDetailsEl.style.display = 'block';
    
    signInBtn.style.display = 'none';
    signOutBtn.style.display = 'block';
    
    loadEl.textContent = 'User is authenticated.';
    clearError(); // Clear any previous login errors if we are now auth'd
  } else {
    // User is signed out
    userStatusEl.textContent = 'You are currently signed out.';
    userDetailsEl.style.display = 'none';
    
    signInBtn.style.display = 'block';
    signOutBtn.style.display = 'none';
    
    loadEl.textContent = 'Ready to sign in.';
  }
});

// --- 3. Sign-In Handler (Redirect) ---
signInBtn.addEventListener('click', () => {
  loadEl.textContent = 'Redirecting to Google...';
  clearError();
  signInWithRedirect(auth, googleProvider);
  // Note: The page will redirect away, so no .then() is needed here usually.
  // Errors will be caught by getRedirectResult when the page reloads.
});

// --- 4. Sign-Out Handler ---
signOutBtn.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful.");
      // UI updates automatically via onAuthStateChanged
    })
    .catch((error) => showError(`Sign-out Error: ${error.message}`));
});