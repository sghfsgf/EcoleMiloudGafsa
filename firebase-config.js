/* =========================================================
   FIREBASE - ECOLE MILOUD GAFSA
   ========================================================= */

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "VOTRE_API_KEY",

    authDomain: "ecolemiloudgafsa.firebaseapp.com",

    projectId: "ecolemiloudgafsa",

    storageBucket: "ecolemiloudgafsa.firebasestorage.app",

    messagingSenderId: "1088965354679",

    appId: "VOTRE_APP_ID"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
