import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "../firebase-config.js";


/* =========================================================
   CONNEXION ADMIN
   ========================================================= */

export async function connexionAdmin(email, password) {

    const resultat =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    const user = resultat.user;


    /* Vérification du rôle dans Firestore */

    const adminRef =
        doc(db, "users", user.uid);

    const adminSnap =
        await getDoc(adminRef);


    if (
        !adminSnap.exists() ||
        adminSnap.data().role !== "admin"
    ) {

        await signOut(auth);

        throw new Error(
            "Compte non autorisé."
        );
    }


    return user;
}


/* =========================================================
   DÉCONNEXION
   ========================================================= */

export async function deconnexion() {

    await signOut(auth);

}
