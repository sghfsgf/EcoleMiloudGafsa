
/* =========================================================
   ECOLE MILOUD GAFSA
   AFFICHAGE PUBLIC DES ANNONCES
   ========================================================= */

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db
} from "../firebase-config.js";


/* =========================================================
   CONTENEUR
   ========================================================= */

const annoncesContainer =
    document.getElementById("annoncesContainer");


if (!annoncesContainer) {

    console.error(
        "annoncesContainer introuvable."
    );

} else {


    /* =====================================================
       FONCTION : DÉTECTER UNE ANNONCE NOUVELLE
       🆕 جديد pendant 3 jours
    ====================================================== */

    function annonceEstNouvelle(annonce) {

        if (
            !annonce.createdAt ||
            typeof annonce.createdAt.toMillis !== "function"
        ) {
            return false;
        }

        const dateCreation =
            annonce.createdAt.toMillis();

        const maintenant =
            Date.now();

        const troisJours =
            3 * 24 * 60 * 60 * 1000;

        const difference =
            maintenant - dateCreation;

        return (
            difference >= 0 &&
            difference <= troisJours
        );
    }


    /* =====================================================
       REQUÊTE : UNIQUEMENT LES ANNONCES PUBLIÉES
    ====================================================== */

    const annoncesQuery =
        query(
            collection(
                db,
                "annonces"
            ),
            where(
                "publie",
                "==",
                true
            )
        );


    /* =====================================================
       ÉCOUTE EN TEMPS RÉEL
    ====================================================== */

    onSnapshot(
        annoncesQuery,

        (snapshot) => {

            annoncesContainer.innerHTML = "";


            /* =================================================
               AUCUNE ANNONCE
            ================================================== */

            if (snapshot.empty) {

                annoncesContainer.innerHTML = `

                    <article class="announcement-card">

                        <h3>
                            الإعلانات
                        </h3>

                        <p>
                            لا توجد إعلانات حاليا.
                        </p>

                    </article>

                `;

                return;
            }


            /* =================================================
               RÉCUPÉRER LES ANNONCES
            ================================================== */

            const annonces = [];


            snapshot.forEach(
                docSnap => {

                    const data =
                        docSnap.data();


                    annonces.push({
                        id: docSnap.id,
                        ...data
                    });

                }
            );


            /* =================================================
               TRI PAR DATE
               Plus récente → plus ancienne
            ================================================== */

            annonces.sort(
                (a, b) => {

                    const dateA =
                        a.createdAt?.toMillis
                            ? a.createdAt.toMillis()
                            : 0;

                    const dateB =
                        b.createdAt?.toMillis
                            ? b.createdAt.toMillis()
                            : 0;

                    return dateB - dateA;
                }
            );


            /* =================================================
               AFFICHAGE
            ================================================== */

            annonces.forEach(
                annonce => {

                    /* -----------------------------------------
                       CARTE
                    ----------------------------------------- */

                    const article =
                        document.createElement(
                            "article"
                        );

                    article.className =
                        "announcement-card";


                    /* -----------------------------------------
                       TITRE
                    ----------------------------------------- */

                    const titre =
                        document.createElement(
                            "h3"
                        );

                    titre.textContent =
                        annonce.titre ||
                        "إعلان";


                    /* -----------------------------------------
                       BADGE NOUVELLE ANNONCE
                    ----------------------------------------- */

                    if (
                        annonceEstNouvelle(
                            annonce
                        )
                    ) {

                        const badge =
                            document.createElement(
                                "span"
                            );

                        badge.className =
                            "badge-nouveau";

                        badge.textContent =
                            "🆕 جديد";

                        titre.appendChild(
                            badge
                        );
                    }


                    /* -----------------------------------------
                       CONTENU
                    ----------------------------------------- */

                    const contenu =
                        document.createElement(
                            "p"
                        );

                    contenu.textContent =
                        annonce.contenu ||
                        "";


                    /* -----------------------------------------
                       AJOUT DU TITRE ET DU CONTENU
                    ----------------------------------------- */

                    article.appendChild(
                        titre
                    );

                    article.appendChild(
                        contenu
                    );


                    /* =================================================
                       DATE FACULTATIVE
                    ================================================== */

                    if (
                        annonce.createdAt &&
                        typeof annonce.createdAt.toDate ===
                            "function"
                    ) {

                        const date =
                            document.createElement(
                                "small"
                            );


                        const dateObj =
                            annonce.createdAt.toDate();


                        date.textContent =
                            dateObj.toLocaleDateString(
                                "ar-TN"
                            );


                        date.className =
                            "announcement-date";


                        article.appendChild(
                            date
                        );
                    }


                    /* -----------------------------------------
                       AJOUT DE LA CARTE
                    ----------------------------------------- */

                    annoncesContainer.appendChild(
                        article
                    );

                }
            );

        },


        /* =====================================================
           GESTION DES ERREURS
        ====================================================== */

        (error) => {

            console.error(
                "Erreur chargement annonces :",
                error
            );


            annoncesContainer.innerHTML = `

                <article class="announcement-card">

                    <h3>
                        الإعلانات
                    </h3>

                    <p>
                        تعذر تحميل الإعلانات حاليا.
                    </p>

                </article>

            `;
        }
    );
}
