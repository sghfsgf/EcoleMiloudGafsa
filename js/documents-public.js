
/* =========================================================
   ECOLE MILOUD GAFSA
   DOCUMENTS-PUBLIC.JS

   Affichage public des documents depuis Firestore.

   Logique :
   - uniquement les documents publiés
   - lecture de categorie + cible
   - routage vers la bonne destination
   - ouverture des PDF
   - téléchargement des DOC / DOCX
   - compatibilité avec anciens documents
   - indication 🆕 جديد pendant 3 jours
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
   CONTENEURS PRINCIPAUX
   ========================================================= */

const horairesContainer =
    document.getElementById(
        "horairesContainer"
    );


const examensContainer =
    document.getElementById(
        "examensContainer"
    );


const concoursSixContainer =
    document.getElementById(
        "concoursSixContainer"
    );


const documentsContainer =
    document.getElementById(
        "documentsContainer"
    );


/* =========================================================
   VÉRIFICATION
   ========================================================= */

console.log(
    "documents-public.js chargé correctement."
);


/* =========================================================
   LIBELLÉS DES DESTINATIONS
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
   OBTENIR LE SLOT EXACT
   grâce à categorie + cible
   ========================================================= */

function obtenirSlot(
    categorie,
    cible
) {

    const slots =
        document.querySelectorAll(
            ".dynamic-document-slot"
        );


    /* -----------------------------------------
       Recherche exacte
    ----------------------------------------- */

    for (
        const slot of slots
    ) {

        if (
            slot.dataset.categorie ===
                categorie &&

            slot.dataset.cible ===
                cible
        ) {

            return slot;
        }
    }


    /* -----------------------------------------
       Compatibilité :
       ancien document général
    ----------------------------------------- */

    if (
        categorie ===
        "documents"
    ) {

        for (
            const slot of slots
        ) {

            if (
                slot.dataset.categorie ===
                    "documents"
            ) {

                return slot;
            }
        }
    }


    /* -----------------------------------------
       Compatibilité :
       ancienne catégorie sans cible
    ----------------------------------------- */

    let container = null;


    if (
        categorie ===
        "horaires"
    ) {

        container =
            horairesContainer;

    } else if (
        categorie ===
        "examens"
    ) {

        container =
            examensContainer;

    } else if (
        categorie ===
        "concours-six"
    ) {

        container =
            concoursSixContainer;

    } else {

        container =
            documentsContainer;
    }


    /*
     * On crée un slot de secours uniquement
     * si un ancien document n'a pas de cible.
     */

    if (container) {

        let fallback =
            container.querySelector(
                ".dynamic-document-fallback"
            );


        if (!fallback) {

            fallback =
                document.createElement(
                    "div"
                );


            fallback.className =
                "dynamic-document-fallback";


            container.appendChild(
                fallback
            );
        }


        return fallback;
    }


    return null;
}

/* =========================================================
   OBTENIR LE SLOT D'EXAMEN
   grâce au niveau + trimestre
   ========================================================= */

function obtenirSlotExamen(
    cible,
    trimestre
) {

    const slots =
        document.querySelectorAll(
            ".dynamic-document-slot"
        );


    /* -----------------------------------------
       Recherche du niveau scolaire
    ----------------------------------------- */

    for (
        const slot of slots
    ) {

        if (
            slot.dataset.categorie ===
                "examens" &&

            slot.dataset.cible ===
                cible
        ) {

            /*
             * Chercher le sous-espace
             * correspondant au trimestre.
             */

            let trimestreSlot =
                slot.querySelector(
                    `[data-trimestre="${trimestre}"]`
                );


            /*
             * Si le trimestre n'existe pas encore,
             * on le crée automatiquement.
             */

            if (!trimestreSlot) {

                trimestreSlot =
                    document.createElement(
                        "div"
                    );


                trimestreSlot.className =
                    "examen-trimestre";


                trimestreSlot.dataset.trimestre =
                    trimestre;


                const titreTrimestre =
                    document.createElement(
                        "h4"
                    );


                titreTrimestre.textContent =
                    libellesDestination[
                        trimestre
                    ] ||
                    trimestre;


                trimestreSlot.appendChild(
                    titreTrimestre
                );


                slot.appendChild(
                    trimestreSlot
                );
            }


            return trimestreSlot;
        }
    }


    return null;
}


/* =========================================================
   VIDER UNIQUEMENT LES ZONES DYNAMIQUES
   ========================================================= */

function viderZonesDynamiques() {

    const slots =
        document.querySelectorAll(
            ".dynamic-document-slot"
        );


    slots.forEach(
        function (slot) {

            slot.innerHTML = "";
        }
    );


    /*
     * Nettoyer les anciens slots de secours
     */

    const fallbacks =
        document.querySelectorAll(
            ".dynamic-document-fallback"
        );


    fallbacks.forEach(
        function (fallback) {

            fallback.remove();
        }
    );
}


/* =========================================================
   DOCUMENT NOUVEAU : 3 JOURS
   ========================================================= */

function documentEstNouveau(
    documentData
) {

    if (
        !documentData.createdAt ||
        typeof documentData.createdAt.toMillis !==
            "function"
    ) {

        return false;
    }


    const dateCreation =
        documentData.createdAt.toMillis();


    const maintenant =
        Date.now();


    const troisJours =
        3 * 24 * 60 * 60 * 1000;


    const difference =
        maintenant -
        dateCreation;


    return (
        difference >= 0 &&
        difference <= troisJours
    );
}


/* =========================================================
   CRÉER UNE CARTE DOCUMENT
   ========================================================= */

function creerCarteDocument(
    documentData
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "public-document-item";


    /* -----------------------------------------
       TITRE
    ----------------------------------------- */

    const titre =
        document.createElement(
            "h4"
        );


    titre.textContent =
        documentData.titre ||
        "وثيقة";


    /* -----------------------------------------
       INDICATEUR NOUVEAU
       pendant 3 jours
    ----------------------------------------- */

    if (
        documentEstNouveau(
            documentData
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
       DESCRIPTION
    ----------------------------------------- */

    if (
        documentData.description
    ) {

        const description =
            document.createElement(
                "p"
            );


        description.textContent =
            documentData.description;


        article.appendChild(
            description
        );
    }


    /* -----------------------------------------
       NOM DU FICHIER
    ----------------------------------------- */

    const nomFichier =
        document.createElement(
            "small"
        );


    nomFichier.className =
        "document-file-name";


    nomFichier.textContent =
        "📄 " +
        (
            documentData.nomFichier ||
            "وثيقة"
        );


    /* -----------------------------------------
       DESTINATION
    ----------------------------------------- */

    if (
        documentData.cible &&
        documentData.cible !==
            "general"
    ) {

        const destination =
            document.createElement(
                "small"
            );


        destination.className =
            "document-destination";


        destination.textContent =
            "📌 " +
            (
                libellesDestination[
                    documentData.cible
                ] ||
                ""
            );


        article.appendChild(
            destination
        );
    }


    /* -----------------------------------------
       BOUTON OUVRIR
    ----------------------------------------- */

    const bouton =
        document.createElement(
            "button"
        );


    bouton.type =
        "button";


    bouton.className =
        "document-button";


    bouton.textContent =
        "📄 فتح الوثيقة";


    bouton.addEventListener(
        "click",
        function () {

            ouvrirDocument(
                documentData
            );
        }
    );


    /* -----------------------------------------
       ASSEMBLAGE
    ----------------------------------------- */

    article.insertBefore(
        titre,
        article.firstChild
    );


    article.appendChild(
        nomFichier
    );


    article.appendChild(
        bouton
    );


    return article;
}


/* =========================================================
   OUVRIR / TÉLÉCHARGER LE DOCUMENT
   ========================================================= */

function ouvrirDocument(
    documentData
) {

    try {


        /* =====================================
           NOUVEAU SYSTÈME :
           fichier = Bytes Firestore
        ====================================== */

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


            /* ---------------------------------
               PDF
            --------------------------------- */

            if (
                type ===
                    "application/pdf"
            ) {

                window.open(
                    url,
                    "_blank"
                );


                /*
                 * Garder l'objet Blob disponible
                 * pendant la lecture.
                 */

                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    60000
                );


            }

            /* ---------------------------------
               DOC / DOCX
            --------------------------------- */

            else {

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
            }


            return;
        }


        /* =====================================
           COMPATIBILITÉ ANCIEN SYSTÈME URL
        ====================================== */

        if (
            documentData.url
        ) {

            window.open(
                documentData.url,
                "_blank"
            );


            return;
        }


        /* =====================================
           FICHIER ABSENT
        ====================================== */

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
   REQUÊTE FIRESTORE
   UNIQUEMENT LES DOCUMENTS PUBLIÉS
   ========================================================= */

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


/* =========================================================
   ÉCOUTE EN TEMPS RÉEL
   ========================================================= */

onSnapshot(

    documentsQuery,


    function (snapshot) {

        /*
         * Très important :
         * on ne vide pas les sections
         * horaires/examens/etc.
         *
         * On vide seulement les slots
         * dynamiques à l'intérieur des cartes.
         */

        viderZonesDynamiques();


        /* =====================================
           AUCUN DOCUMENT
        ====================================== */

        if (
            snapshot.empty
        ) {

            console.log(
                "Aucun document publié."
            );

            return;
        }


        /* =====================================
           RÉCUPÉRATION
        ====================================== */

        const documents = [];


        snapshot.forEach(
            function (docSnap) {

                documents.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()
                });
            }
        );


        /* =====================================
           TRI PAR DATE
        ====================================== */

        documents.sort(
            function (a, b) {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toMillis ===
                        "function"

                        ? a.createdAt.toMillis()

                        : 0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toMillis ===
                        "function"

                        ? b.createdAt.toMillis()

                        : 0;


                return (
                    dateB -
                    dateA
                );
            }
        );


        /* =====================================
           ROUTAGE DE CHAQUE DOCUMENT
        ====================================== */

        documents.forEach(
            function (documentData) {

                /*
                 * Si categorie absente :
                 * documents
                 */

                const categorie =
                    documentData.categorie ||
                    "documents";


                /*
                 * Si cible absente :
                 * general
                 */

                const cible =
                    documentData.cible ||
                    "general";


                const slot =
                    obtenirSlot(
                        categorie,
                        cible
                    );


                if (!slot) {

                    console.warn(
                        "Destination introuvable :",
                        categorie,
                        cible,
                        documentData
                    );


                    return;
                }


                const carte =
                    creerCarteDocument(
                        documentData
                    );


                slot.appendChild(
                    carte
                );
            }
        );


    },


    /* =====================================================
       ERREUR FIRESTORE
    ====================================================== */

    function (error) {

        console.error(
            "Erreur chargement documents publics :",
            error
        );


        /*
         * Message d'erreur discret :
         * on ne détruit pas la structure
         * HTML existante.
         */

        const containers = [

            horairesContainer,

            examensContainer,

            concoursSixContainer,

            documentsContainer

        ];


        containers.forEach(
            function (container) {

                if (!container) {
                    return;
                }


                const message =
                    document.createElement(
                        "small"
                    );


                message.className =
                    "document-error";


                message.textContent =
                    "تعذر تحميل الوثائق حاليا.";


                /*
                 * Ajouter uniquement si
                 * aucun message d'erreur
                 * n'existe déjà.
                 */

                if (
                    !container.querySelector(
                        ".document-error"
                    )
                ) {

                    container.appendChild(
                        message
                    );
                }
            }
        );
    }
);
