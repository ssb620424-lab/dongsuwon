// firebase-config.js — 동수원노인전문요양원
const firebaseConfig = {
  apiKey:            "AIzaSyCbDAkuc88WrNVeHPq-Wv32sFYh5cUnCCU",
  authDomain:        "dongsuwon-care.firebaseapp.com",
  projectId:         "dongsuwon-care",
  storageBucket:     "dongsuwon-care.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

try {
  firebase.initializeApp(firebaseConfig);
  window.db   = firebase.firestore();
  window.auth = firebase.auth();
} catch (e) {
  console.warn('Firebase init failed:', e.message);
}
