// Import modules using Google CDN links (V9 Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence, 
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// --- DEBUG LOGGER ---
const debugConsole = document.getElementById('debug-console');
function logToScreen(msg, type = 'info') {
  const div = document.createElement('div');
  div.textContent = `> ${msg}`;
  div.className = 'log-entry';
  if (type === 'error') div.classList.add('log-error');
  if (type === 'success') div.classList.add('log-success');
  debugConsole.appendChild(div);
  debugConsole.scrollTop = debugConsole.scrollHeight; // Auto-scroll
  console.log(msg); // Keep browser console sync
}

logToScreen("Script loaded. Initializing Firebase...", 'info');

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

logToScreen("Firebase initialized.", 'success');

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
  logToScreen(message, 'error');
}

function clearError() {
  errorContainer.style.display = 'none';
  errorContainer.textContent = '';
}

// --- 0. Ensure Persistence is Local (Critical for Redirect flows) ---
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    logToScreen("Persistence set to: LOCAL", 'success');
  })
  .catch((error) => {
    logToScreen(`Persistence Error: ${error.message}`, 'error');
  });

// --- 1. Handle Redirect Result (Check for errors returning from Google) ---
logToScreen("Checking getRedirectResult...");
getRedirectResult(auth)
  .then((result) => {
    // If the user just returned from the redirect flow, result will be defined.
    if (result) {
      logToScreen(`Redirect Result Found! User: ${result.user.email}`, 'success');
    } else {
      logToScreen("No Redirect Result found (Normal Load).");
    }
  })
  .catch((error) => {
    showError(`Redirect Failed: ${error.message}`);
  });

// --- 2. Authentication State Listener ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    logToScreen(`AuthState Changed: SIGNED IN as ${user.email}`, 'success');
    // User is signed in
    userStatusEl.textContent = `Welcome back, ${user.displayName}!`;
    userDetailsEl.innerHTML = `User ID: ${user.uid}<br>Email: ${user.email}`;
    userDetailsEl.style.display = 'block';
    
    signInBtn.style.display = 'none';
    signOutBtn.style.display = 'block';
    
    loadEl.textContent = 'User is authenticated.';
    clearError(); 
  } else {
    logToScreen("AuthState Changed: SIGNED OUT", 'info');
    // User is signed out
    userStatusEl.textContent = 'You are currently signed out.';
    userDetailsEl.style.display = 'none';
    
    signInBtn.style.display = 'block';
    signOutBtn.style.display = 'none';
    
    loadEl.textContent = 'Ready to sign in.';
  }
});

// --- 3. Sign-In Handler (Hybrid) ---
signInBtn.addEventListener('click', () => {
  clearError();
  
  // Check hostname to decide method
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  logToScreen(`Sign In Clicked. Hostname: ${window.location.hostname}`, 'info');

  if (isLocalhost) {
    logToScreen("Detected Localhost. Using POPUP...", 'info');
    loadEl.textContent = 'Signing in with Popup (Localhost)...';
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        logToScreen(`Popup Success: ${result.user.email}`, 'success');
      })
      .catch((error) => {
        showError(`Popup Login Failed: ${error.message}`);
      });
  } else {
    logToScreen("Detected Production/Remote. Using REDIRECT...", 'info');
    loadEl.textContent = 'Redirecting to Google...';
    signInWithRedirect(auth, googleProvider);
  }
});

// --- 4. Sign-Out Handler ---
signOutBtn.addEventListener('click', () => {
  logToScreen("Sign Out Clicked.", 'info');
  signOut(auth)
    .then(() => {
      logToScreen("Sign-out successful.", 'success');
    })
    .catch((error) => showError(`Sign-out Error: ${error.message}`));
});