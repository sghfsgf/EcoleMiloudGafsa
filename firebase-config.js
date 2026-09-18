/* =========================================================
   FIREBASE - ECOLE MILOUD GAFSA
   Authentication + Firestore
   ========================================================= */


/* =========================================================
   FIREBASE APP
   ========================================================= */

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


/* =========================================================
   FIREBASE AUTHENTICATION
   ========================================================= */

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================================
   FIRESTORE
   ========================================================= */

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   CONFIGURATION FIREBASE
   ========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyDejW6NPVy9lfP2CIblz_dWc7xsgDyizwM",

    authDomain: "ecolemiloudgafsa.firebaseapp.com",

    projectId: "ecolemiloudgafsa",

    storageBucket: "ecolemiloudgafsa.firebasestorage.app",

    messagingSenderId: "1088965354679",

    appId: "1:1088965354679:web:6eb1fddfcf34dffb781932"
};


/* =========================================================
   INITIALISATION DE FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);


/* =========================================================
   EXPORT AUTHENTIFICATION
   ========================================================= */

export const auth = getAuth(app);


/* =========================================================
   EXPORT FIRESTORE
   ========================================================= */

export const db = getFirestore(app);
