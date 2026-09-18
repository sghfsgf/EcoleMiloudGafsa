
/* =========================================================
   ECOLE MILOUD GAFSA
   RECHERCHE DU SITE
   Recherche dans :
   - Rubriques statiques
   - Annonces Firestore
   - Documents Firestore
   ========================================================= */


/* =========================================================
   FIRESTORE
   ========================================================= */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    db
} from "../firebase-config.js";


/* =========================================================
   RUBRIQUES STATIQUES DU SITE
   ========================================================= */

const sections = [

    {
        id: "accueil",
        titre: "الرئيسية",
        texte:
            "الموقع الرسمي للمدرسة الابتدائية نهج ميلود"
    },

    {
        id: "horaires",
        titre: "جداول الأوقات",
        texte:
            "جداول أوقات الدراسة حسب المستوى الدراسي"
    },

    {
        id: "examens",
        titre: "جداول الامتحانات",
        texte:
            "جداول الامتحانات حسب الثلاثي والمستوى الدراسي"
    },

    {
        id: "concours-six",
        titre: "مناظرة السادسة",
        texte:
            "مناظرة الدخول إلى المدارس الإعدادية النموذجية"
    },

    {
        id: "documents",
        titre: "الوثائق",
        texte:
            "الوثائق المدرسية والمذكرات"
    },

    {
        id: "annonces",
        titre: "الإعلانات",
        texte:
            "آخر الإعلانات والمعلومات الخاصة بالمدرسة"
    },

    {
        id: "activites",
        titre: "أنشطة المدرسة",
        texte:
            "الأنشطة الثقافية والتربوية والرياضية والترفيهية"
    },

    {
        id: "galerie",
        titre: "معرض الصور",
        texte:
            "صور وذكريات أنشطة المدرسة"
    },

    {
        id: "ecole",
        titre: "حول المدرسة",
        texte:
            "تعريف بالمدرسة الابتدائية نهج ميلود"
    },

    {
        id: "contact",
        titre: "اتصل بنا",
        texte:
            "معلومات الاتصال بالمدرسة"
    }

];


/* =========================================================
   NORMALISATION TEXTE ARABE
   ========================================================= */

function normaliser(texte) {

    return String(texte || "")
        .toLowerCase()

        /* Supprimer les voyelles arabes */
        .replace(
            /[\u064B-\u065F\u0670]/g,
            ""
        )

        /* Supprimer le tatweel */
        .replace(
            /\u0640/g,
            ""
        )

        /* Alif */
        .replace(
            /[إأآٱ]/g,
            "ا"
        )

        /* Alif maqṣūra */
        .replace(
            /ى/g,
            "ي"
        )

        /* Ta marbuta */
        .replace(
            /ة/g,
            "ه"
        )

        /* Espaces multiples */
        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


/* =========================================================
   ÉLÉMENTS
   ========================================================= */

const searchBox =
    document.querySelector(".search-box");

const searchInput =
    document.getElementById("search");

const searchButton =
    document.getElementById("searchButton");


/* =========================================================
   VÉRIFICATION
   ========================================================= */

if (
    !searchBox ||
    !searchInput ||
    !searchButton
) {

    console.error(
        "Éléments de recherche introuvables."
    );

}


/* =========================================================
   ZONE DES RÉSULTATS
   ========================================================= */

let searchResults =
    document.getElementById(
        "searchResults"
    );


if (!searchResults && searchBox) {

    searchResults =
        document.createElement(
            "div"
        );

    searchResults.id =
        "searchResults";

    searchBox.appendChild(
        searchResults
    );
}


/* =========================================================
   EFFECTUER UNE RECHERCHE
   ========================================================= */

async function effectuerRecherche() {

    if (
        !searchInput ||
        !searchResults
    ) {
        return;
    }


    const terme =
        normaliser(
            searchInput.value
        );


    /* Effacer les anciens résultats */

    searchResults.innerHTML =
        "";


    /* Recherche vide */

    if (!terme) {
        return;
    }


    searchResults.innerHTML = `
        <div class="search-results-loading">
            🔎 جاري البحث...
        </div>
    `;


    let resultats = [];


    /* =====================================================
       1. RUBRIQUES STATIQUES
    ====================================================== */

    sections.forEach(
        section => {

            const texte =
                normaliser(
                    section.titre +
                    " " +
                    section.texte
                );


            if (
                texte.includes(terme)
            ) {

                resultats.push({

                    type: "section",

                    titre:
                        section.titre,

                    texte:
                        section.texte,

                    id:
                        section.id
                });
            }

        }
    );


    /* =====================================================
       2. ANNONCES FIRESTORE
    ====================================================== */

    try {

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


        const annoncesSnapshot =
            await getDocs(
                annoncesQuery
            );


        annoncesSnapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const texte =
                    normaliser(
                        (data.titre || "") +
                        " " +
                        (data.contenu || "")
                    );


                if (
                    texte.includes(terme)
                ) {

                    resultats.push({

                        type: "annonce",

                        titre:
                            data.titre ||
                            "إعلان",

                        texte:
                            data.contenu ||
                            "",

                        id:
                            "annonces"
                    });
                }

            }
        );


    } catch (error) {

        console.error(
            "Erreur recherche annonces :",
            error
        );
    }


    /* =====================================================
       3. DOCUMENTS FIRESTORE
    ====================================================== */

    try {

        const documentsQuery =
            query(
                collection(
                    db,
                    "documents"
                ),
                where(
                    "publie",
                    "==",
                    true
                )
            );


        const documentsSnapshot =
            await getDocs(
                documentsQuery
            );


        documentsSnapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const texte =
                    normaliser(
                        (data.titre || "") +
                        " " +
                        (data.description || "") +
                        " " +
                        (data.categorie || "")
                    );


                if (
                    texte.includes(terme)
                ) {

                    resultats.push({

                        type:
                            "document",

                        titre:
                            data.titre ||
                            "وثيقة",

                        texte:
                            data.description ||
                            "",

                        url:
                            data.url ||
                            "",

                        categorie:
                            data.categorie ||
                            ""
                    });
                }

            }
        );


    } catch (error) {

        console.error(
            "Erreur recherche documents :",
            error
        );
    }


    /* =====================================================
       AFFICHAGE
    ====================================================== */

    afficherResultats(
        resultats
    );
}


/* =========================================================
   AFFICHER LES RÉSULTATS
   ========================================================= */

function afficherResultats(
    resultats
) {

    if (
        !searchResults
    ) {
        return;
    }


    searchResults.innerHTML =
        "";


    /* Aucun résultat */

    if (
        resultats.length === 0
    ) {

        searchResults.innerHTML = `

            <div class="search-no-result">

                🔎 لا توجد نتائج لهذا البحث.

            </div>

        `;

        return;
    }


    /* Nombre de résultats */

    const titre =
        document.createElement(
            "div"
        );


    titre.className =
        "search-results-title";


    titre.textContent =
        `نتائج البحث: ${resultats.length}`;


    searchResults.appendChild(
        titre
    );


    /* Résultats */

    resultats.forEach(
        resultat => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-result-item";


            /* -----------------------------------------
               Titre
            ----------------------------------------- */

            const h3 =
                document.createElement(
                    "h3"
                );


            h3.textContent =
                resultat.titre;


            /* -----------------------------------------
               Description
            ----------------------------------------- */

            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                resultat.texte ||
                "";


            /* -----------------------------------------
               Type
            ----------------------------------------- */

            const type =
                document.createElement(
                    "small"
                );


            if (
                resultat.type ===
                "section"
            ) {

                type.textContent =
                    "📂 Rubrique";

            }
            else if (
                resultat.type ===
                "annonce"
            ) {

                type.textContent =
                    "📢 إعلان";

            }
            else if (
                resultat.type ===
                "document"
            ) {

                type.textContent =
                    "📚 وثيقة";
            }


            item.appendChild(
                h3
            );


            item.appendChild(
                p
            );


            item.appendChild(
                type
            );


            /* -----------------------------------------
               Clic
            ----------------------------------------- */

            item.addEventListener(
                "click",
                function () {

                    /* Rubrique */

                    if (
                        resultat.type ===
                        "section"
                    ) {

                        const section =
                            document.getElementById(
                                resultat.id
                            );


                        if (section) {

                            section.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });
                        }

                        return;
                    }


                    /* Annonce */

                    if (
                        resultat.type ===
                        "annonce"
                    ) {

                        const section =
                            document.getElementById(
                                "annonces"
                            );


                        if (section) {

                            section.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });
                        }

                        return;
                    }


                    /* Document */

                    if (
                        resultat.type ===
                            "document" &&
                        resultat.url
                    ) {

                        window.open(
                            resultat.url,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }

                }
            );


            searchResults.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   BOUTON RECHERCHE
   ========================================================= */

if (searchButton) {

    searchButton.addEventListener(
        "click",
        effectuerRecherche
    );
}


/* =========================================================
   TOUCHE ENTRÉE
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                effectuerRecherche();
            }
        }
    );
}

