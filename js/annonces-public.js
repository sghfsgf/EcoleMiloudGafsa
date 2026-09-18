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


            /* Aucune annonce */

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

                    const article =
                        document.createElement(
                            "article"
                        );

                    article.className =
                        "announcement-card";


                    const titre =
                        document.createElement(
                            "h3"
                        );

                    titre.textContent =
                        annonce.titre ||
                        "إعلان";


                    const contenu =
                        document.createElement(
                            "p"
                        );

                    contenu.textContent =
                        annonce.contenu ||
                        "";


                    article.appendChild(
                        titre
                    );

                    article.appendChild(
                        contenu
                    );


                    /* Date facultative */

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


                    annoncesContainer.appendChild(
                        article
                    );

                }
            );

        },


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
