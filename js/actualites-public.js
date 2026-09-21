// =====================================================
// ACTUALITES-PUBLIC.JS
// Affichage public des actualités depuis Firestore
// =====================================================

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { db } from "../firebase-config.js";


// =====================================================
// CONTENEUR HTML
// =====================================================

const actualitesContainer =
    document.getElementById("actualitesContainer");


// Vérification de sécurité
if (!actualitesContainer) {

    console.error(
        "❌ actualitesContainer introuvable dans index.html"
    );

} else {


    // =================================================
    // REQUÊTE FIRESTORE
    // =================================================

    const actualitesRef =
        collection(db, "actualites");

    const actualitesQuery =
        query(
            actualitesRef,
            orderBy("createdAt", "desc")
        );


    // =================================================
    // ÉCOUTE EN TEMPS RÉEL
    // =================================================

    onSnapshot(
        actualitesQuery,

        (snapshot) => {

            console.log(
                "📰 Nombre d'actualités :",
                snapshot.size
            );


            // Vider le conteneur

            actualitesContainer.innerHTML = "";


            // Aucune actualité

            if (snapshot.empty) {

                actualitesContainer.innerHTML = `
                    <p class="empty-message">
                        لا توجد مستجدات حاليًا.
                    </p>
                `;

                return;
            }


            // =================================================
            // PARCOURIR LES ACTUALITÉS
            // =================================================

            snapshot.forEach((docSnapshot) => {

                const actualite =
                    docSnapshot.data();


                console.log(
                    "📰 Actualité :",
                    docSnapshot.id,
                    actualite
                );


                // Création de la carte

                const card =
                    document.createElement("article");

                card.className =
                    "announcement-card";


                // Titre

                const title =
                    document.createElement("h3");

                title.textContent =
                    actualite.titre || "مستجد جديد";


                // Contenu

                const content =
                    document.createElement("p");

                content.textContent =
                    actualite.description || "";


                // Assemblage

                card.appendChild(title);

                card.appendChild(content);


                actualitesContainer.appendChild(card);

            });

        },

        (error) => {

            console.error(
                "❌ Erreur lors du chargement des actualités :",
                error
            );


            actualitesContainer.innerHTML = `
                <p class="error-message">
                    تعذر تحميل المستجدات حاليًا.
                </p>
            `;

        }
    );

}


