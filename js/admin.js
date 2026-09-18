
/* =========================================================
   ECOLE MILOUD GAFSA
   ADMIN.JS
   Firebase Authentication + Firestore
   Gestion :
   - Connexion Admin
   - Mot de passe oublié
   - Annonces
   - Documents PDF / Word depuis le PC
   ========================================================= */


/* =========================================================
   AUTHENTIFICATION
   ========================================================= */

import {
    connexionAdmin,
    deconnexion
} from "./auth.js";


/* =========================================================
   FIREBASE AUTH
   ========================================================= */

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================================
   FIRESTORE
   ========================================================= */

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Bytes
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

import {
    db,
    auth
} from "../firebase-config.js";


/* =========================================================
   ÉLÉMENTS HTML
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginMessage =
    document.getElementById("loginMessage");

const adminEmail =
    document.getElementById("adminEmail");

const logoutButton =
    document.getElementById("logoutButton");

const forgotPasswordButton =
    document.getElementById("forgotPassword");


const annonceForm =
    document.getElementById("annonceForm");

const annonceAnnuler =
    document.getElementById("annonceAnnuler");


const documentForm =
    document.getElementById("documentForm");

const documentAnnuler =
    document.getElementById("documentAnnuler");


/* =========================================================
   VÉRIFICATION DU CHARGEMENT
   ========================================================= */

console.log(
    "admin.js chargé correctement."
);


/* =========================================================
   MESSAGE DE CONNEXION
   ========================================================= */

function afficherMessage(
    message,
    erreur = false
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        message;


    loginMessage.style.color =
        erreur
            ? "#b42318"
            : "#174a6e";
}


/* =========================================================
   CONNEXION ADMIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                afficherMessage(
                    "Erreur : champs de connexion introuvables.",
                    true
                );

                return;
            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (
                !email ||
                !password
            ) {

                afficherMessage(
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
                    true
                );

                return;
            }


            afficherMessage(
                "جاري تسجيل الدخول..."
            );


            try {

                const user =
                    await connexionAdmin(
                        email,
                        password
                    );


                console.log(
                    "Admin connecté :",
                    user.email
                );


                /* Afficher dashboard */

                if (loginSection) {

                    loginSection.classList.add(
                        "hidden"
                    );
                }


                if (dashboardSection) {

                    dashboardSection.classList.remove(
                        "hidden"
                    );
                }


                if (adminEmail) {

                    adminEmail.textContent =
                        user.email || "";
                }


                afficherMessage("");


                /* Charger données */

                await chargerAnnonces();

                await chargerDocuments();


            } catch (error) {

                console.error(
                    "Erreur connexion Admin :",
                    error
                );


                afficherErreurConnexion(
                    error
                );
            }
        }
    );
}


/* =========================================================
   AFFICHER ERREUR CONNEXION
   ========================================================= */

function afficherErreurConnexion(
    error
) {

    let message =
        "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.";


    if (
        error &&
        error.code ===
        "auth/invalid-credential"
    ) {

        message =
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }

    else if (
        error &&
        error.code ===
        "auth/user-not-found"
    ) {

        message =
            "هذا الحساب غير موجود.";
    }

    else if (
        error &&
        error.code ===
        "auth/wrong-password"
    ) {

        message =
            "كلمة المرور غير صحيحة.";
    }

    else if (
        error &&
        error.code ===
        "auth/invalid-email"
    ) {

        message =
            "عنوان البريد الإلكتروني غير صحيح.";
    }

    else if (
        error &&
        error.code ===
        "auth/too-many-requests"
    ) {

        message =
            "تم تجاوز عدد محاولات الدخول. حاول لاحقًا.";
    }

    else if (
        error &&
        error.message ===
        "Compte non autorisé."
    ) {

        message =
            "هذا الحساب غير مصرح له بالدخول إلى الإدارة.";
    }


    afficherMessage(
        message,
        true
    );
}


/* =========================================================
   MOT DE PASSE OUBLIÉ
   ========================================================= */

if (forgotPasswordButton) {

    forgotPasswordButton.addEventListener(
        "click",
        async function () {

            const emailInput =
                document.getElementById(
                    "email"
                );


            if (!emailInput) {
                return;
            }


            const email =
                emailInput.value.trim();


            if (!email) {

                afficherMessage(
                    "أدخل بريدك الإلكتروني أولاً.",
                    true
                );

                emailInput.focus();

                return;
            }


            afficherMessage(
                "جاري إرسال رابط إعادة تعيين كلمة المرور..."
            );


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                afficherMessage(
                    "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."
                );


            } catch (error) {

                console.error(
                    "Erreur mot de passe oublié :",
                    error
                );


                afficherMessage(
                    "تعذر إرسال رابط إعادة تعيين كلمة المرور.",
                    true
                );
            }
        }
    );
}


/* =========================================================
   DÉCONNEXION
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await deconnexion();


                if (dashboardSection) {

                    dashboardSection.classList.add(
                        "hidden"
                    );
                }


                if (loginSection) {

                    loginSection.classList.remove(
                        "hidden"
                    );
                }


                if (loginForm) {

                    loginForm.reset();
                }


                if (adminEmail) {

                    adminEmail.textContent =
                        "";
                }


                resetAnnonceForm();

                resetDocumentForm();

                afficherMessage("");


            } catch (error) {

                console.error(
                    "Erreur déconnexion :",
                    error
                );
            }
        }
    );
}


/* =========================================================
   ====================== ANNONCES =========================
   ========================================================= */

if (annonceForm) {

    annonceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "annonceId"
                )?.value.trim();


            const titre =
                document.getElementById(
                    "annonceTitre"
                )?.value.trim();


            const contenu =
                document.getElementById(
                    "annonceContenu"
                )?.value.trim();


            const publie =
                document.getElementById(
                    "annoncePubliee"
                )?.checked === true;


            if (
                !titre ||
                !contenu
            ) {

                alert(
                    "يرجى إدخال عنوان ومحتوى الإعلان."
                );

                return;
            }


            try {

                const donnees = {

                    titre:
                        titre,

                    contenu:
                        contenu,

                    publie:
                        publie,

                    updatedAt:
                        serverTimestamp()
                };


                /* -----------------------------------------
                   MODIFICATION
                ----------------------------------------- */

                if (id) {

                    await updateDoc(
                        doc(
                            db,
                            "annonces",
                            id
                        ),
                        donnees
                    );


                    alert(
                        "تم تعديل الإعلان بنجاح."
                    );
                }


                /* -----------------------------------------
                   AJOUT
                ----------------------------------------- */

                else {

                    await addDoc(
                        collection(
                            db,
                            "annonces"
                        ),
                        {
                            ...donnees,

                            createdAt:
                                serverTimestamp()
                        }
                    );


                    alert(
                        "تمت إضافة الإعلان بنجاح."
                    );
                }


                resetAnnonceForm();

                await chargerAnnonces();


            } catch (error) {

                console.error(
                    "Erreur annonce :",
                    error
                );


                alert(
                    "حدث خطأ أثناء حفظ الإعلان."
                );
            }
        }
    );
}


/* =========================================================
   CHARGER ANNONCES
   ========================================================= */

async function chargerAnnonces() {

    const container =
        document.getElementById(
            "annoncesAdmin"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>جاري تحميل الإعلانات...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "annonces"
                )
            );


        container.innerHTML =
            "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد إعلانات.</p>";

            return;
        }


        const annonces = [];


        snapshot.forEach(
            function (docSnap) {

                annonces.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()
                });
            }
        );


        /* Plus récent en premier */

        annonces.sort(
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


                return dateB - dateA;
            }
        );


        annonces.forEach(
            function (annonce) {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                /* TITRE */

                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    annonce.titre ||
                    "إعلان";


                /* CONTENU */

                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    annonce.contenu ||
                    "";


                /* STATUT */

                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    annonce.publie === true
                        ? "✅ منشور"
                        : "⏸️ غير منشور";


                /* BOUTONS */

                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* MODIFIER */

                const modifier =
                    document.createElement(
                        "button"
                    );


                modifier.type =
                    "button";


                modifier.textContent =
                    "✏️ تعديل";


                modifier.addEventListener(
                    "click",
                    function () {

                        document.getElementById(
                            "annonceId"
                        ).value =
                            annonce.id;


                        document.getElementById(
                            "annonceTitre"
                        ).value =
                            annonce.titre ||
                            "";


                        document.getElementById(
                            "annonceContenu"
                        ).value =
                            annonce.contenu ||
                            "";


                        document.getElementById(
                            "annoncePubliee"
                        ).checked =
                            annonce.publie === true;


                        document.getElementById(
                            "annonceTitre"
                        ).focus();


                        window.scrollTo({

                            top: 0,

                            behavior:
                                "smooth"
                        });
                    }
                );


                /* SUPPRIMER */

                const supprimer =
                    document.createElement(
                        "button"
                    );


                supprimer.type =
                    "button";


                supprimer.textContent =
                    "🗑️ حذف";


                supprimer.addEventListener(
                    "click",
                    async function () {

                        if (
                            !confirm(
                                "هل تريد حذف هذا الإعلان؟"
                            )
                        ) {

                            return;
                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "annonces",
                                    annonce.id
                                )
                            );


                            await chargerAnnonces();


                        } catch (error) {

                            console.error(
                                "Erreur suppression annonce :",
                                error
                            );


                            alert(
                                "تعذر حذف الإعلان."
                            );
                        }
                    }
                );


                /* Ajouter boutons */

                boutons.appendChild(
                    modifier
                );


                boutons.appendChild(
                    supprimer
                );


                /* Assemblage */

                article.appendChild(
                    titre
                );


                article.appendChild(
                    contenu
                );


                article.appendChild(
                    statut
                );


                article.appendChild(
                    boutons
                );


                container.appendChild(
                    article
                );
            }
        );


    } catch (error) {

        console.error(
            "Erreur chargement annonces :",
            error
        );


        container.innerHTML =
            "<p>تعذر تحميل الإعلانات.</p>";
    }
}


/* =========================================================
   ANNULER ANNONCE
   ========================================================= */

if (annonceAnnuler) {

    annonceAnnuler.addEventListener(
        "click",
        resetAnnonceForm
    );
}


/* =========================================================
   RESET ANNONCE
   ========================================================= */

function resetAnnonceForm() {

    if (!annonceForm) {
        return;
    }


    annonceForm.reset();


    const id =
        document.getElementById(
            "annonceId"
        );


    const publie =
        document.getElementById(
            "annoncePubliee"
        );


    if (id) {

        id.value =
            "";
    }


    if (publie) {

        publie.checked =
            true;
    }
}


/* =========================================================
   ====================== DOCUMENTS ========================
   ========================================================= */


/* =========================================================
   CONVERSION FICHIER → BYTES FIRESTORE
   ========================================================= */

function lireFichierEnBytes(
    file
) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const buffer =
                            reader.result;


                        const tableau =
                            new Uint8Array(
                                buffer
                            );


                        const bytes =
                            Bytes.fromUint8Array(
                                tableau
                            );


                        resolve(
                            bytes
                        );


                    } catch (error) {

                        reject(
                            error
                        );
                    }
                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Impossible de lire le fichier."
                        )
                    );
                };


            reader.readAsArrayBuffer(
                file
            );
        }
    );
}


/* =========================================================
   FORMULAIRE DOCUMENT
   ========================================================= */

if (documentForm) {

    documentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "documentId"
                )?.value.trim();


            const titre =
                document.getElementById(
                    "documentTitre"
                )?.value.trim();


            const description =
                document.getElementById(
                    "documentDescription"
                )?.value.trim();


            const fichierInput =
                document.getElementById(
                    "documentFile"
                );


            const categorie =
                document.getElementById(
                    "documentCategorie"
                )?.value;


            const publie =
                document.getElementById(
                    "documentPublie"
                )?.checked === true;


            const fichier =
                fichierInput?.files?.[0] ||
                null;


            /* -----------------------------------------
               TITRE OBLIGATOIRE
            ----------------------------------------- */

            if (!titre) {

                alert(
                    "يرجى إدخال عنوان الوثيقة."
                );

                return;
            }


            /* -----------------------------------------
               NOUVEL AJOUT
               Fichier obligatoire
            ----------------------------------------- */

            if (
                !id &&
                !fichier
            ) {

                alert(
                    "يرجى اختيار الوثيقة من جهاز الكمبيوتر."
                );

                return;
            }


            /* -----------------------------------------
               LIMITE PRATIQUE
               900 Ko
            ----------------------------------------- */

            const tailleMax =
                900 * 1024;


            if (
                fichier &&
                fichier.size > tailleMax
            ) {

                alert(
                    "حجم الوثيقة كبير جدًا. الحد الأقصى العملي هو 900 كيلوبايت."
                );

                return;
            }


            try {

                const donnees = {

                    titre:
                        titre,

                    description:
                        description || "",

                    categorie:
                        categorie ||
                        "documents",

                    publie:
                        publie,

                    updatedAt:
                        serverTimestamp()
                };


                /* -----------------------------------------
                   NOUVEAU FICHIER
                ----------------------------------------- */

                if (fichier) {

                    const extensionsAcceptees = [

                        "pdf",

                        "doc",

                        "docx"
                    ];


                    const extension =
                        fichier.name
                            .toLowerCase()
                            .split(".")
                            .pop();


                    const typesAcceptes = [

                        "application/pdf",

                        "application/msword",

                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ];


                    if (
                        !extensionsAcceptees.includes(
                            extension
                        ) &&
                        !typesAcceptes.includes(
                            fichier.type
                        )
                    ) {

                        alert(
                            "يرجى اختيار ملف PDF أو Word فقط."
                        );

                        return;
                    }


                    /* Lire fichier */

                    const fichierBytes =
                        await lireFichierEnBytes(
                            fichier
                        );


                    donnees.fichier =
                        fichierBytes;


                    donnees.nomFichier =
                        fichier.name;


                    donnees.typeFichier =
                        fichier.type ||
                        "application/octet-stream";


                    donnees.tailleFichier =
                        fichier.size;
                }


                /* -----------------------------------------
                   MODIFICATION
                ----------------------------------------- */

                if (id) {

                    await updateDoc(
                        doc(
                            db,
                            "documents",
                            id
                        ),
                        donnees
                    );


                    alert(
                        "تم تعديل الوثيقة بنجاح."
                    );
                }


                /* -----------------------------------------
                   AJOUT
                ----------------------------------------- */

                else {

                    await addDoc(
                        collection(
                            db,
                            "documents"
                        ),
                        {
                            ...donnees,

                            createdAt:
                                serverTimestamp()
                        }
                    );


                    alert(
                        "تمت إضافة الوثيقة بنجاح."
                    );
                }


                resetDocumentForm();

                await chargerDocuments();


            } catch (error) {

                console.error(
                    "Erreur document :",
                    error
                );


                if (
                    error &&
                    error.code ===
                    "resource-exhausted"
                ) {

                    alert(
                        "حجم الوثيقة يتجاوز الحد المسموح به في Firestore."
                    );

                } else {

                    alert(
                        "حدث خطأ أثناء حفظ الوثيقة."
                    );
                }
            }
        }
    );
}


/* =========================================================
   CHARGER DOCUMENTS
   ========================================================= */

async function chargerDocuments() {

    const container =
        document.getElementById(
            "documentsAdmin"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>جاري تحميل الوثائق...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "documents"
                )
            );


        container.innerHTML =
            "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد وثائق.</p>";

            return;
        }


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


        /* Plus récent en premier */

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


                return dateB - dateA;
            }
        );


        documents.forEach(
            function (documentData) {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                /* TITRE */

                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    documentData.titre ||
                    "وثيقة";


                /* DESCRIPTION */

                const description =
                    document.createElement(
                        "p"
                    );


                description.textContent =
                    documentData.description ||
                    "";


                /* NOM FICHIER */

                const nomFichier =
                    document.createElement(
                        "small"
                    );


                nomFichier.textContent =
                    "📄 " +
                    (
                        documentData.nomFichier ||
                        "وثيقة"
                    );


                /* TAILLE */

                const taille =
                    document.createElement(
                        "small"
                    );


                if (
                    documentData.tailleFichier
                ) {

                    const ko =
                        (
                            documentData.tailleFichier /
                            1024
                        ).toFixed(1);


                    taille.textContent =
                        " • " +
                        ko +
                        " Ko";
                }


                /* CATÉGORIE */

                const categorie =
                    document.createElement(
                        "small"
                    );


                categorie.textContent =
                    "القسم: " +
                    (
                        documentData.categorie ||
                        "documents"
                    );


                /* STATUT */

                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    documentData.publie === true
                        ? " ✅ منشور"
                        : " ⏸️ غير منشور";


                /* CONTENEUR BOUTONS */

                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* =========================================
                   OUVRIR
                ========================================== */

                const ouvrir =
                    document.createElement(
                        "button"
                    );


                ouvrir.type =
                    "button";


                ouvrir.textContent =
                    "📄 فتح";


                ouvrir.addEventListener(
                    "click",
                    async function () {

                        try {

                            /* Nouveau fichier Bytes */

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


                                const blob =
                                    new Blob(
                                        [bytes],
                                        {
                                            type:
                                                documentData
                                                    .typeFichier ||
                                                "application/pdf"
                                        }
                                    );


                                const url =
                                    URL.createObjectURL(
                                        blob
                                    );


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


                            }

                            /* Ancienne compatibilité URL */

                            else if (
                                documentData.url
                            ) {

                                window.open(
                                    documentData.url,
                                    "_blank"
                                );

                            }

                            else {

                                alert(
                                    "الوثيقة غير متوفرة."
                                );
                            }


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


                /* =========================================
                   MODIFIER
                ========================================== */

                const modifier =
                    document.createElement(
                        "button"
                    );


                modifier.type =
                    "button";


                modifier.textContent =
                    "✏️ تعديل";


                modifier.addEventListener(
                    "click",
                    function () {

                        document.getElementById(
                            "documentId"
                        ).value =
                            documentData.id;


                        document.getElementById(
                            "documentTitre"
                        ).value =
                            documentData.titre ||
                            "";


                        document.getElementById(
                            "documentDescription"
                        ).value =
                            documentData.description ||
                            "";


                        document.getElementById(
                            "documentCategorie"
                        ).value =
                            documentData.categorie ||
                            "documents";


                        document.getElementById(
                            "documentPublie"
                        ).checked =
                            documentData.publie === true;


                        /* Vider champ fichier */

                        const fichierInput =
                            document.getElementById(
                                "documentFile"
                            );


                        if (fichierInput) {

                            fichierInput.value =
                                "";
                        }


                        document.getElementById(
                            "documentTitre"
                        ).focus();


                        window.scrollTo({

                            top: 0,

                            behavior:
                                "smooth"
                        });
                    }
                );


                /* =========================================
                   SUPPRIMER
                ========================================== */

                const supprimer =
                    document.createElement(
                        "button"
                    );


                supprimer.type =
                    "button";


                supprimer.textContent =
                    "🗑️ حذف";


                supprimer.addEventListener(
                    "click",
                    async function () {

                        if (
                            !confirm(
                                "هل تريد حذف هذه الوثيقة؟"
                            )
                        ) {

                            return;
                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "documents",
                                    documentData.id
                                )
                            );


                            await chargerDocuments();


                        } catch (error) {

                            console.error(
                                "Erreur suppression document :",
                                error
                            );


                            alert(
                                "تعذر حذف الوثيقة."
                            );
                        }
                    }
                );


                /* =========================================
                   AJOUT BOUTONS
                ========================================== */

                boutons.appendChild(
                    ouvrir
                );


                boutons.appendChild(
                    modifier
                );


                boutons.appendChild(
                    supprimer
                );


                /* =========================================
                   ASSEMBLAGE
                ========================================== */

                article.appendChild(
                    titre
                );


                article.appendChild(
                    description
                );


                article.appendChild(
                    nomFichier
                );


                article.appendChild(
                    taille
                );


                article.appendChild(
                    categorie
                );


                article.appendChild(
                    statut
                );


                article.appendChild(
                    boutons
                );


                container.appendChild(
                    article
                );
            }
        );


    } catch (error) {

        console.error(
            "Erreur chargement documents :",
            error
        );


        container.innerHTML =
            "<p>تعذر تحميل الوثائق.</p>";
    }
}


/* =========================================================
   ANNULER DOCUMENT
   ========================================================= */

if (documentAnnuler) {

    documentAnnuler.addEventListener(
        "click",
        resetDocumentForm
    );
}


/* =========================================================
   RESET DOCUMENT
   ========================================================= */

function resetDocumentForm() {

    if (!documentForm) {
        return;
    }


    documentForm.reset();


    const id =
        document.getElementById(
            "documentId"
        );


    const publie =
        document.getElementById(
            "documentPublie"
        );


    if (id) {

        id.value =
            "";
    }


    if (publie) {

        publie.checked =
            true;
    }
}

