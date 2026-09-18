
/* =========================================================
   FIREBASE - ECOLE MILOUD GAFSA
   Authentication + Firestore + Storage
   ========================================================= */


/* Firebase App */

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


/* Authentication */

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* Firestore */

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* Storage */

import { getStorage }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


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
   INITIALISATION
   ========================================================= */

const app = initializeApp(firebaseConfig);


/* =========================================================
   SERVICES FIREBASE
   ========================================================= */

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

