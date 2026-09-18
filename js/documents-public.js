```javascript
/* =========================================================
   ECOLE MILOUD GAFSA
   AFFICHAGE PUBLIC DES DOCUMENTS
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

const documentsContainer =
    document.getElementById(
        "documentsContainer"
    );


if (!documentsContainer) {

    console.error(
        "documentsContainer introuvable."
    );

} else {


    /* =====================================================
       REQUÊTE :
       UNIQUEMENT LES DOCUMENTS PUBLIÉS
    ====================================================== */

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


    /* =====================================================
       ÉCOUTE EN TEMPS RÉEL
    ====================================================== */

    onSnapshot(

        documentsQuery,

        (snapshot) => {

            documentsContainer.innerHTML = "";


            /* =============================================
               AUCUN DOCUMENT
            ============================================== */

            if (snapshot.empty) {

                documentsContainer.innerHTML = `

                    <article class="document-card">

                        <h3>
                            الوثائق
                        </h3>

                        <p>
                            لا توجد وثائق منشورة حاليا.
                        </p>

                    </article>

                `;

                return;
            }


            /* =============================================
               RÉCUPÉRER LES DOCUMENTS
            ============================================== */

            const documents = [];


            snapshot.forEach(
                docSnap => {

                    const data =
                        docSnap.data();


                    documents.push({

                        id:
                            docSnap.id,

                        ...data
                    });

                }
            );


            /* =============================================
               TRI PAR DATE
            ============================================== */

            documents.sort(
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


            /* =============================================
               AFFICHAGE
            ============================================== */

            documents.forEach(
                documentData => {

                    const article =
                        document.createElement(
                            "article"
                        );


                    article.className =
                        "document-card";


                    /* =====================================
                       TITRE
                    ====================================== */

                    const titre =
                        document.createElement(
                            "h3"
                        );


                    titre.textContent =
                        documentData.titre ||
                        "وثيقة";


                    /* =====================================
                       DESCRIPTION
                    ====================================== */

                    const description =
                        document.createElement(
                            "p"
                        );


                    description.textContent =
                        documentData.description ||
                        "";


                    /* =====================================
                       NOM FICHIER
                    ====================================== */

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


                    /* =====================================
                       BOUTON
                    ====================================== */

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

                            try {

                                /* =================================
                                   NOUVEAUX DOCUMENTS :
                                   fichier = Bytes Firestore
                                ================================== */

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
                                        documentData
                                            .typeFichier ||
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


                                    /*
                                     * PDF :
                                     * ouverture dans un nouvel onglet.
                                     */

                                    if (
                                        type ===
                                        "application/pdf"
                                    ) {

                                        window.open(
                                            url,
                                            "_blank"
                                        );


                                        /*
                                         * On garde l'URL
                                         * assez longtemps pour
                                         * permettre la lecture.
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

                                    /*
                                     * DOC / DOCX :
                                     * téléchargement du fichier.
                                     */

                                    else {

                                        const lien =
                                            document.createElement(
                                                "a"
                                            );


                                        lien.href =
                                            url;


                                        lien.download =
                                            documentData
                                                .nomFichier ||
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


                                /* =================================
                                   COMPATIBILITÉ AVEC ANCIENS
                                   DOCUMENTS QUI UTILISAIENT URL
                                ================================== */

                                if (
                                    documentData.url
                                ) {

                                    window.open(
                                        documentData.url,
                                        "_blank"
                                    );

                                    return;
                                }


                                /* =================================
                                   AUCUN FICHIER
                                ================================== */

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
                    );


                    /* =====================================
                       ASSEMBLAGE
                    ====================================== */

                    article.appendChild(
                        titre
                    );


                    if (
                        documentData.description
                    ) {

                        article.appendChild(
                            description
                        );
                    }


                    article.appendChild(
                        nomFichier
                    );


                    article.appendChild(
                        bouton
                    );


                    documentsContainer.appendChild(
                        article
                    );

                }
            );

        },


        (error) => {

            console.error(
                "Erreur chargement documents :",
                error
            );


            documentsContainer.innerHTML = `

                <article class="document-card">

                    <h3>
                        الوثائق
                    </h3>

                    <p>
                        تعذر تحميل الوثائق حاليا.
                    </p>

                </article>

            `;
        }
    );
}
```
