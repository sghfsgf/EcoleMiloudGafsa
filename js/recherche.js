
/* =========================================================
   ECOLE MILOUD GAFSA
   RECHERCHE DU SITE

   Recherche dans :
   - Rubriques statiques
   - Annonces Firestore
   - Documents Firestore

   Documents :
   - categorie
   - cible
   - fichier = Bytes Firestore
   - compatibilité ancienne URL
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
   RUBRIQUES STATIQUES
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

        titre: "مناظرة السيزيام",

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
   LIBELLÉS CATÉGORIES
   ========================================================= */

const libellesCategorie = {

    documents:
        "📚 الوثائق",

    horaires:
        "🕐 جداول الأوقات",

    examens:
        "📝 جداول الامتحانات",

    "concours-six":
        "🎓 مناظرة السيزيام"
};


/* =========================================================
   LIBELLÉS DESTINATIONS
   ========================================================= */

const libellesDestination = {

    sana1:
        "السنة الأولى",

    sana2:
        "السنة الثانية",

    sana3:
        "السنة الثالثة",

    sana4:
        "السنة الرابعة",

    sana5:
        "السنة الخامسة",

    sana6:
        "السنة السادسة",

    trimestre1:
        "الثلاثي الأول",

    trimestre2:
        "الثلاثي الثاني",

    trimestre3:
        "الثلاثي الثالث",

    calendrier:
        "الرزنامة والمواعيد",

    "anciens-sujets":
        "مواضيع السنوات السابقة",

    preparation:
        "تمارين للتحضير",

    annonces:
        "الإعلانات",

    general:
        "الوثائق العامة"
};


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

        /* Normalisation Alif */

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
   ÉLÉMENTS HTML
   ========================================================= */

const searchBox =
    document.querySelector(
        ".search-box"
    );


const searchInput =
    document.getElementById(
        "search"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


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
   ZONE RÉSULTATS
   ========================================================= */

let searchResults =
    document.getElementById(
        "searchResults"
    );


if (
    !searchResults &&
    searchBox
) {

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
   DESTINATION DOCUMENT
   ========================================================= */

function obtenirLibelleDestination(
    categorie,
    cible
) {

    const destination =
        libellesDestination[
            cible
        ];


    if (destination) {

        return destination;
    }


    if (
        categorie ===
        "documents"
    ) {

        return "الوثائق العامة";
    }


    return "";
}


/* =========================================================
   ID DE LA CARTE CIBLE
   ========================================================= */

function obtenirIdCarte(
    categorie,
    cible
) {

    if (
        categorie ===
        "horaires"
    ) {

        return (
            "horaire-" +
            cible
        );
    }


    if (
        categorie ===
        "examens"
    ) {

        return (
            "examen-" +
            cible
        );
    }


    if (
        categorie ===
        "concours-six"
    ) {

        return (
            "concours-" +
            cible
        );
    }


    if (
        categorie ===
        "documents"
    ) {

        return "document-general";
    }


    return "";
}


/* =========================================================
   OUVRIR UN DOCUMENT
   ========================================================= */

function ouvrirDocument(
    documentData
) {

    try {


        /* =========================================
           NOUVEAU SYSTÈME :
           fichier = Bytes Firestore
        ========================================== */

        if (
            documentData.fichier &&
            typeof documentData
                .fichier
                .toUint8Array ===
            "function"
        ) {

            const bytes =
                documentData
                    .fichier
                    .toUint8Array();


            const type =
                documentData.typeFichier ||
                "application/pdf";


            const blob =
                new Blob(
                    [bytes],
                    {
                        type:
                            type
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            /* PDF */

            if (
                type ===
                "application/pdf"
            ) {

                window.open(
                    url,
                    "_blank"
                );


                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    60000
                );


                return;
            }


            /* DOC / DOCX */

            const lien =
                document.createElement(
                    "a"
                );


            lien.href =
                url;


            lien.download =
                documentData.nomFichier ||
                "document";


            document.body.appendChild(
                lien
            );


            lien.click();


            lien.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                5000
            );


            return;
        }


        /* =========================================
           COMPATIBILITÉ ANCIENS DOCUMENTS URL
        ========================================== */

        if (
            documentData.url
        ) {

            window.open(
                documentData.url,
                "_blank"
            );


            return;
        }


        /* =========================================
           DOCUMENT ABSENT
        ========================================== */

        alert(
            "الوثيقة غير متوفرة."
        );


    } catch (error) {

        console.error(
            "Erreur ouverture document :",
            error
        );


        alert(
            "تعذر فتح الوثيقة."
        );
    }
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


    /* Effacer anciens résultats */

    searchResults.innerHTML =
        "";


    /* Recherche vide */

    if (!terme) {

        return;
    }


    searchResults.innerHTML = `

        <div
            class="search-results-loading"
        >
            🔎 جاري البحث...
        </div>

    `;


    let resultats = [];


    /* =====================================================
       1. RUBRIQUES STATIQUES
    ====================================================== */

    sections.forEach(
        function (section) {

            const texte =
                normaliser(
                    section.titre +
                    " " +
                    section.texte
                );


            if (
                texte.includes(
                    terme
                )
            ) {

                resultats.push({

                    type:
                        "section",

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
            function (docSnap) {

                const data =
                    docSnap.data();


                const texte =
                    normaliser(

                        (data.titre || "") +
                        " " +
                        (data.contenu || "")
                    );


                if (
                    texte.includes(
                        terme
                    )
                ) {

                    resultats.push({

                        type:
                            "annonce",

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
            function (docSnap) {

                const data =
                    docSnap.data();


                /* -----------------------------------------
                   Catégorie
                ----------------------------------------- */

                const categorie =
                    data.categorie ||
                    "documents";


                /* -----------------------------------------
                   Cible
                ----------------------------------------- */

                const cible =
                    data.cible ||
                    "general";


                /* -----------------------------------------
                   Texte recherché
                ----------------------------------------- */

                const texte =
                    normaliser(

                        (data.titre || "") +
                        " " +

                        (data.description || "") +
                        " " +

                        (categorie || "") +
                        " " +

                        (cible || "") +
                        " " +

                        (
                            libellesCategorie[
                                categorie
                            ] || ""
                        ) +

                        " " +

                        (
                            libellesDestination[
                                cible
                            ] || ""
                        )
                    );


                if (
                    texte.includes(
                        terme
                    )
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

                        categorie:
                            categorie,

                        cible:
                            cible,

                        nomFichier:
                            data.nomFichier ||
                            "",

                        typeFichier:
                            data.typeFichier ||
                            "",

                        fichier:
                            data.fichier ||
                            null,

                        url:
                            data.url ||
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
        resultats.length ===
        0
    ) {

        searchResults.innerHTML = `

            <div
                class="search-no-result"
            >

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


    /* =====================================================
       RÉSULTATS
    ====================================================== */

    resultats.forEach(
        function (resultat) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-result-item";


            /* -----------------------------------------
               TITRE
            ----------------------------------------- */

            const h3 =
                document.createElement(
                    "h3"
                );


            h3.textContent =
                resultat.titre;


            /* -----------------------------------------
               DESCRIPTION
            ----------------------------------------- */

            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                resultat.texte ||
                "";


            /* -----------------------------------------
               TYPE
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
                    "📄 وثيقة";


                const categorie =
                    document.createElement(
                        "small"
                    );


                categorie.className =
                    "search-document-category";


                categorie.textContent =
                    libellesCategorie[
                        resultat.categorie
                    ] ||
                    "📄 وثيقة";


                item.appendChild(
                    categorie
                );


                const destination =
                    obtenirLibelleDestination(
                        resultat.categorie,
                        resultat.cible
                    );


                if (
                    destination
                ) {

                    const cible =
                        document.createElement(
                            "small"
                        );


                    cible.className =
                        "search-document-destination";


                    cible.textContent =
                        "📌 " +
                        destination;


                    item.appendChild(
                        cible
                    );
                }
            }


            /* Ajouter éléments */

            item.appendChild(
                h3
            );


            item.appendChild(
                p
            );


            item.appendChild(
                type
            );


            /* =================================================
               CLIC
            ================================================= */

            item.addEventListener(
                "click",
                function () {


                    /* -----------------------------------------
                       RUBRIQUE
                    ----------------------------------------- */

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


                    /* -----------------------------------------
                       ANNONCE
                    ----------------------------------------- */

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


                    /* -----------------------------------------
                       DOCUMENT
                    ----------------------------------------- */

                    if (
                        resultat.type ===
                        "document"
                    ) {

                        /* Aller à la bonne carte */

                        const carteId =
                            obtenirIdCarte(
                                resultat.categorie,
                                resultat.cible
                            );


                        if (
                            carteId
                        ) {

                            const carte =
                                document.getElementById(
                                    carteId
                                );


                            if (carte) {

                                carte.scrollIntoView({

                                    behavior:
                                        "smooth",

                                    block:
                                        "center"
                                });
                            }
                        }


                        /* Ouvrir le document */

                        ouvrirDocument(
                            resultat
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

if (
    searchButton
) {

    searchButton.addEventListener(
        "click",
        effectuerRecherche
    );
}


/* =========================================================
   TOUCHE ENTRÉE
   ========================================================= */

if (
    searchInput
) {

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

