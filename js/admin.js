
/* =========================================================
   ECOLE MILOUD GAFSA
   ADMIN.JS
   Firebase Authentication + Firestore
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
   Pour "Mot de passe oublié"
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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


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
   VÉRIFICATION
   ========================================================= */

console.log("admin.js chargé correctement.");


/* =========================================================
   MESSAGE
   ========================================================= */

function afficherMessage(message, erreur = false) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

    loginMessage.style.color =
        erreur ? "#b42318" : "#174a6e";
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
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            if (!emailInput || !passwordInput) {

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


            if (!email || !password) {

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


                /* -----------------------------------------
                   CONNEXION RÉUSSIE
                ----------------------------------------- */

                console.log(
                    "Admin connecté :",
                    user.email
                );


                loginSection.classList.add(
                    "hidden"
                );


                dashboardSection.classList.remove(
                    "hidden"
                );


                if (adminEmail) {

                    adminEmail.textContent =
                        user.email || "";
                }


                afficherMessage("");


                /* -----------------------------------------
                   CHARGEMENT DES DONNÉES
                ----------------------------------------- */

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
   ERREURS CONNEXION
   ========================================================= */

function afficherErreurConnexion(error) {

    let message =
        "تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.";


    if (
        error &&
        error.code === "auth/invalid-credential"
    ) {

        message =
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }

    else if (
        error &&
        error.code === "auth/user-not-found"
    ) {

        message =
            "هذا الحساب غير موجود.";
    }

    else if (
        error &&
        error.code === "auth/wrong-password"
    ) {

        message =
            "كلمة المرور غير صحيحة.";
    }

    else if (
        error &&
        error.code === "auth/invalid-email"
    ) {

        message =
            "عنوان البريد الإلكتروني غير صحيح.";
    }

    else if (
        error &&
        error.code === "auth/too-many-requests"
    ) {

        message =
            "تم تجاوز عدد محاولات الدخول. حاول لاحقًا.";
    }

    else if (
        error &&
        error.message === "Compte non autorisé."
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
                document.getElementById("email");


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

                    adminEmail.textContent = "";
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
   ===================== ANNONCES =========================
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


            if (!titre || !contenu) {

                alert(
                    "يرجى إدخال عنوان ومحتوى الإعلان."
                );

                return;
            }


            try {

                const donnees = {

                    titre: titre,

                    contenu: contenu,

                    publie: publie,

                    updatedAt:
                        serverTimestamp()
                };


                /* MODIFICATION */

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


                /* AJOUT */

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


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد إعلانات.</p>";

            return;
        }


        const annonces = [];


        snapshot.forEach(
            function (docSnap) {

                annonces.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            }
        );


        /* Plus récent en premier */

        annonces.sort(
            function (a, b) {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toMillis === "function"
                        ? a.createdAt.toMillis()
                        : 0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toMillis === "function"
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
                    annonce.titre || "إعلان";


                /* CONTENU */

                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    annonce.contenu || "";


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
                            annonce.titre || "";


                        document.getElementById(
                            "annonceContenu"
                        ).value =
                            annonce.contenu || "";


                        document.getElementById(
                            "annoncePubliee"
                        ).checked =
                            annonce.publie === true;


                        document.getElementById(
                            "annonceTitre"
                        ).focus();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
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


                boutons.appendChild(
                    modifier
                );


                boutons.appendChild(
                    supprimer
                );


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
        id.value = "";
    }


    if (publie) {
        publie.checked = true;
    }
}


/* =========================================================
   ===================== DOCUMENTS =========================
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


            const url =
                document.getElementById(
                    "documentUrl"
                )?.value.trim();


            const categorie =
                document.getElementById(
                    "documentCategorie"
                )?.value;


            const publie =
                document.getElementById(
                    "documentPublie"
                )?.checked === true;


            if (!titre || !url) {

                alert(
                    "يرجى إدخال عنوان الوثيقة ورابطها."
                );

                return;
            }


            /* Vérifier URL */

            try {

                new URL(url);

            } catch {

                alert(
                    "يرجى إدخال رابط صحيح للوثيقة."
                );

                return;
            }


            try {

                const donnees = {

                    titre: titre,

                    description:
                        description || "",

                    url: url,

                    categorie:
                        categorie || "documents",

                    publie: publie,

                    updatedAt:
                        serverTimestamp()
                };


                /* MODIFICATION */

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


                /* AJOUT */

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


                alert(
                    "حدث خطأ أثناء حفظ الوثيقة."
                );
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


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد وثائق.</p>";

            return;
        }


        const documents = [];


        snapshot.forEach(
            function (docSnap) {

                documents.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            }
        );


        documents.sort(
            function (a, b) {

                const dateA =
                    a.createdAt &&
                    typeof a.createdAt.toMillis === "function"
                        ? a.createdAt.toMillis()
                        : 0;


                const dateB =
                    b.createdAt &&
                    typeof b.createdAt.toMillis === "function"
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


                /* BOUTONS */

                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* OUVRIR */

                const ouvrir =
                    document.createElement(
                        "a"
                    );


                ouvrir.href =
                    documentData.url || "#";


                ouvrir.target =
                    "_blank";


                ouvrir.rel =
                    "noopener noreferrer";


                ouvrir.textContent =
                    "🔗 فتح";


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
                            "documentId"
                        ).value =
                            documentData.id;


                        document.getElementById(
                            "documentTitre"
                        ).value =
                            documentData.titre || "";


                        document.getElementById(
                            "documentDescription"
                        ).value =
                            documentData.description || "";


                        document.getElementById(
                            "documentUrl"
                        ).value =
                            documentData.url || "";


                        document.getElementById(
                            "documentCategorie"
                        ).value =
                            documentData.categorie ||
                            "documents";


                        document.getElementById(
                            "documentPublie"
                        ).checked =
                            documentData.publie === true;


                        document.getElementById(
                            "documentTitre"
                        ).focus();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
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


                /* AJOUT BOUTONS */

                boutons.appendChild(
                    ouvrir
                );


                boutons.appendChild(
                    modifier
                );


                boutons.appendChild(
                    supprimer
                );


                /* ASSEMBLAGE */

                article.appendChild(
                    titre
                );


                article.appendChild(
                    description
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
        id.value = "";
    }


    if (publie) {
        publie.checked = true;
    }
}

