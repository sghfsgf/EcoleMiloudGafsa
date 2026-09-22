// =====================================================
// ACTUALITES-PUBLIC.JS
// Affichage public des actualités depuis Firestore
//
// Validité : 10 jours
// Badge "جديد" : 3 premiers jours
//
// Règles supplémentaires :
// - Si une actualité correspond à une annonce supprimée,
//   cette actualité ne doit plus être affichée.
// - Si une actualité correspond à un document supprimé,
//   cette actualité ne doit plus être affichée.
// =====================================================

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { db } from "../firebase-config.js";

// =====================================================
// PARAMÈTRES
// =====================================================

const DUREE_VALIDITE_JOURS = 10;

const DUREE_NOUVEAUTE_JOURS = 3;


// =====================================================
// CONTENEUR HTML
// =====================================================

const actualitesContainer =
    document.getElementById("actualitesContainer");


// =====================================================
// VÉRIFICATION DE SÉCURITÉ
// =====================================================

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
            where("actif", "==", true),
            orderBy("createdAt", "desc")
        );


    // =================================================
    // ÉCOUTE EN TEMPS RÉEL
    // =================================================

    onSnapshot(
        actualitesQuery,

        async (snapshot) => {

            console.log(
                "📰 Nombre d'actualités Firestore :",
                snapshot.size
            );


            // =================================================
            // VIDER LE CONTENEUR
            // =================================================

            actualitesContainer.innerHTML = "";


            // Compteur des actualités encore valides

            let nombreActualitesValides = 0;


            // =================================================
            // PARCOURIR LES ACTUALITÉS
            // =================================================

            for (const docSnapshot of snapshot.docs) {

                const actualite =
                    docSnapshot.data();


                console.log(
                    "📰 Actualité :",
                    docSnapshot.id,
                    actualite
                );


                // =================================================
                // 1. VÉRIFIER SI L'ACTUALITÉ EST ACTIVE
                // =================================================

                if (actualite.actif !== true) {

                    console.log(
                        "⏸️ Actualité inactive :",
                        docSnapshot.id
                    );

                    continue;
                }


                // =================================================
                // 2. VÉRIFIER createdAt
                // =================================================

                if (!actualite.createdAt) {

                    console.warn(
                        "⚠️ createdAt absent :",
                        docSnapshot.id
                    );

                    continue;
                }


                // =================================================
                // 3. CALCULER L'ÂGE DE L'ACTUALITÉ
                // =================================================

                const dateCreation =
                    actualite.createdAt.toDate();

                const maintenant =
                    new Date();

                const ageMs =
                    maintenant.getTime() -
                    dateCreation.getTime();


                const ageJours =
                    ageMs /
                    (1000 * 60 * 60 * 24);


                console.log(
                    "📅 Âge de l'actualité :",
                    docSnapshot.id,
                    ageJours.toFixed(2),
                    "jours"
                );


                // =================================================
                // 4. EXPIRATION APRÈS 10 JOURS
                // =================================================

                if (ageJours >= DUREE_VALIDITE_JOURS) {

                    console.log(
                        "⌛ Actualité expirée :",
                        docSnapshot.id
                    );

                    continue;
                }


                // =================================================
                // 5. VÉRIFICATION DE LA SOURCE
                //
                // Si l'actualité est liée à une annonce
                // OU à un document, on vérifie que la source
                // existe toujours dans Firestore.
                // =================================================

               if (
    actualite.referenceId &&
    (
        actualite.type === "annonce" ||
        actualite.type === "annonce-modification" ||
        actualite.type === "document" ||
        actualite.type === "document-modification"
    )
) {

                    try {

                        // -------------------------------------------------
                        // Déterminer la collection source
                        // -------------------------------------------------

                        const collectionSource =
                            actualite.type === "annonce"
                                ? "annonces"
                                : "documents";


                        // -------------------------------------------------
                        // Référence vers la source
                        // -------------------------------------------------

                        const sourceRef =
                            doc(
                                db,
                                collectionSource,
                                actualite.referenceId
                            );


                        // -------------------------------------------------
                        // Vérifier si la source existe
                        // -------------------------------------------------

                        const sourceSnapshot =
                            await getDoc(sourceRef);


                        // -------------------------------------------------
                        // Source supprimée
                        // -------------------------------------------------

                        if (!sourceSnapshot.exists()) {

                            console.log(
                                "🗑️ Source supprimée → actualité masquée :",
                                actualite.type,
                                actualite.referenceId
                            );

                            continue;
                        }

                    } catch (error) {

                        console.error(
                            "❌ Erreur lors de la vérification de la source :",
                            actualite.type,
                            actualite.referenceId,
                            error
                        );

                        // En cas d'erreur, on n'affiche pas
                        // une actualité dont la source ne peut
                        // pas être vérifiée.

                        continue;
                    }
                }


                // =================================================
                // 6. ACTUALITÉ VALIDE
                // =================================================

                nombreActualitesValides++;


                // =================================================
                // 7. CRÉATION DE LA CARTE
                // =================================================

                const card =
                    document.createElement("article");

                card.className =
                    "announcement-card";


                // =================================================
                // 8. BADGE "جديد"
                // Pendant les 3 premiers jours
                // =================================================

                if (ageJours < DUREE_NOUVEAUTE_JOURS) {

                    const badge =
                        document.createElement("span");

                    badge.className =
                        "actualite-badge-nouveau";

                    badge.textContent =
                        "جديد";

                    card.appendChild(badge);
                }


                // =================================================
                // 9. TITRE
                // =================================================

                const title =
                    document.createElement("h3");

                title.textContent =
                    actualite.titre ||
                    "مستجد جديد";


                // =================================================
                // 10. CONTENU
                // =================================================

                const content =
                    document.createElement("p");

                content.textContent =
                    actualite.description ||
                    "";


                // =================================================
                // 11. ASSEMBLAGE
                // =================================================

                card.appendChild(title);

                card.appendChild(content);

                actualitesContainer.appendChild(card);

            }


            // =================================================
            // 12. AUCUNE ACTUALITÉ VALIDE
            // =================================================

            if (nombreActualitesValides === 0) {

                actualitesContainer.innerHTML = `
                    <p class="empty-message">
                        لا توجد مستجدات حاليًا.
                    </p>
                `;
            }

        },


        // =================================================
        // ERREUR FIRESTORE
        // =================================================

        (error) => {

            console.error(
                "❌ Erreur lors du chargement des actualités :",
                error
            );

            const errorBox =
                document.createElement("div");

            errorBox.className =
                "error-message";


            const title =
                document.createElement("strong");

            title.textContent =
                "تعذر تحميل المستجدات حاليًا";


            const details =
                document.createElement("p");

            details.style.direction = "ltr";
            details.style.textAlign = "left";
            details.style.marginTop = "10px";

            details.textContent =
                (error?.code || "unknown") +
                " — " +
                (error?.message || "Erreur inconnue");


            errorBox.appendChild(title);
            errorBox.appendChild(details);

            actualitesContainer.replaceChildren(errorBox);
        }
    );

}
