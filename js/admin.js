```javascript
/* =========================================================
   ECOLE MILOUD GAFSA
   ADMIN.JS
   Firebase Authentication + Firestore
   ========================================================= */


/* =========================================================
   FIREBASE AUTHENTIFICATION
   ========================================================= */

import {
    connexionAdmin,
    deconnexion,
    motDePasseOublie
} from "./auth.js";


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
    db
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

const documentForm =
    document.getElementById("documentForm");


/* =========================================================
   VÉRIFICATION DES ÉLÉMENTS
   ========================================================= */

if (!loginForm) {

    console.error(
        "Erreur : #loginForm introuvable."
    );
}


if (!annonceForm) {

    console.error(
        "Erreur : #annonceForm introuvable."
    );
}


if (!documentForm) {

    console.error(
        "Erreur : #documentForm introuvable."
    );
}


/* =========================================================
   CONNEXION ADMIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            if (!email || !password) {

                loginMessage.textContent =
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور.";

                return;
            }


            loginMessage.textContent =
                "جاري تسجيل الدخول...";


            try {

                const user =
                    await connexionAdmin(
                        email,
                        password
                    );


                /* -----------------------------------------
                   Afficher tableau de bord
                ----------------------------------------- */

                loginSection.classList.add(
                    "hidden"
                );


                dashboardSection.classList.remove(
                    "hidden"
                );


                adminEmail.textContent =
                    user.email;


                loginMessage.textContent =
                    "";


                /* -----------------------------------------
                   Charger les données Firestore
                ----------------------------------------- */

                await chargerAnnonces();

                await chargerDocuments();

            } catch (error) {

                console.error(
                    "Firebase Auth :",
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
   MESSAGE ERREUR CONNEXION
   ========================================================= */

function afficherErreurConnexion(error) {

    if (!loginMessage) {
        return;
    }


    if (
        error.code ===
        "auth/invalid-credential"
    ) {

        loginMessage.textContent =
            "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

        return;
    }


    if (
        error.code ===
        "auth/user-not-found"
    ) {

        loginMessage.textContent =
            "هذا الحساب غير موجود.";

        return;
    }


    if (
        error.code ===
        "auth/wrong-password"
    ) {

        loginMessage.textContent =
            "كلمة المرور غير صحيحة.";

        return;
    }


    if (
        error.message ===
        "Compte non autorisé."
    ) {

        loginMessage.textContent =
            "هذا الحساب غير مصرح له بالدخول إلى الإدارة.";

        return;
    }


    loginMessage.textContent =
        "تعذر تسجيل الدخول. افتح F12 لمعرفة الخطأ.";
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


            const email =
                emailInput.value.trim();


            if (!email) {

                loginMessage.textContent =
                    "أدخل بريدك الإلكتروني أولاً.";

                emailInput.focus();

                return;
            }


            loginMessage.textContent =
                "جاري إرسال رسالة إعادة تعيين كلمة المرور...";


            try {

                await motDePasseOublie(
                    email
                );


                loginMessage.textContent =
                    "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.";

            } catch (error) {

                console.error(
                    "Erreur mot de passe oublié :",
                    error
                );


                loginMessage.textContent =
                    "تعذر إرسال رابط إعادة تعيين كلمة المرور.";
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


                dashboardSection.classList.add(
                    "hidden"
                );


                loginSection.classList.remove(
                    "hidden"
                );


                loginForm.reset();


                adminEmail.textContent =
                    "";


                resetAnnonceForm();

                resetDocumentForm();


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
   ANNONCES
   ========================================================= */

if (annonceForm) {

    annonceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "annonceId"
                ).value;


            const titre =
                document.getElementById(
                    "annonceTitre"
                ).value.trim();


            const contenu =
                document.getElementById(
                    "annonceContenu"
                ).value.trim();


            const publie =
                document.getElementById(
                    "annoncePubliee"
                ).checked;


            if (!titre || !contenu) {

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
                }


                resetAnnonceForm();


                await chargerAnnonces();


                alert(
                    "تم حفظ الإعلان بنجاح."
                );


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
        "<p class='loading-message'>جاري تحميل الإعلانات...</p>";


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


        snapshot.forEach(
            function (docSnap) {

                const data =
                    docSnap.data();


                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                /* -----------------------------------------
                   TITRE
                ----------------------------------------- */

                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    data.titre || "";


                /* -----------------------------------------
                   CONTENU
                ----------------------------------------- */

                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    data.contenu || "";


                /* -----------------------------------------
                   STATUT
                ----------------------------------------- */

                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    data.publie
                        ? "✅ منشور"
                        : "⏸️ غير منشور";


                /* -----------------------------------------
                   BOUTONS
                ----------------------------------------- */

                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* Modifier */

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
                            docSnap.id;


                        document.getElementById(
                            "annonceTitre"
                        ).value =
                            data.titre || "";


                        document.getElementById(
                            "annonceContenu"
                        ).value =
                            data.contenu || "";


                        document.getElementById(
                            "annoncePubliee"
                        ).checked =
                            data.publie === true;


                        document.getElementById(
                            "annonceTitre"
                        ).focus();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }
                );


                /* Supprimer */

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

                        const confirmation =
                            confirm(
                                "هل تريد حذف هذا الإعلان؟"
                            );


                        if (!confirmation) {
                            return;
                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "annonces",
                                    docSnap.id
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
   ANNULATION ANNONCE
   ========================================================= */

const annonceAnnuler =
    document.getElementById(
        "annonceAnnuler"
    );


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
   DOCUMENTS
   ========================================================= */

if (documentForm) {

    documentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "documentId"
                ).value;


            const titre =
                document.getElementById(
                    "documentTitre"
                ).value.trim();


            const description =
                document.getElementById(
                    "documentDescription"
                ).value.trim();


            const url =
                document.getElementById(
                    "documentUrl"
                ).value.trim();


            const categorie =
                document.getElementById(
                    "documentCategorie"
                ).value;


            const publie =
                document.getElementById(
                    "documentPublie"
                ).checked;


            if (!titre || !url) {

                alert(
                    "يرجى إدخال عنوان الوثيقة ورابطها."
                );

                return;
            }


            /* Vérification URL */

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

                    titre:
                        titre,

                    description:
                        description,

                    url:
                        url,

                    categorie:
                        categorie,

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
                            "documents",
                            id
                        ),
                        donnees
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
                }


                resetDocumentForm();


                await chargerDocuments();


                alert(
                    "تم حفظ الوثيقة بنجاح."
                );


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
        "<p class='loading-message'>جاري تحميل الوثائق...</p>";


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


        snapshot.forEach(
            function (docSnap) {

                const data =
                    docSnap.data();


                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                /* -----------------------------------------
                   TITRE
                ----------------------------------------- */

                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    data.titre || "";


                /* -----------------------------------------
                   DESCRIPTION
                ----------------------------------------- */

                const description =
                    document.createElement(
                        "p"
                    );


                description.textContent =
                    data.description || "";


                /* -----------------------------------------
                   CATÉGORIE
                ----------------------------------------- */

                const categorie =
                    document.createElement(
                        "small"
                    );


                categorie.textContent =
                    "القسم: " +
                    (
                        data.categorie || ""
                    );


                /* -----------------------------------------
                   STATUT
                ----------------------------------------- */

                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    data.publie
                        ? " ✅ منشور"
                        : " ⏸️ غير منشور";


                /* -----------------------------------------
                   BOUTONS
                ----------------------------------------- */

                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* Ouvrir */

                const ouvrir =
                    document.createElement(
                        "a"
                    );


                ouvrir.href =
                    data.url || "#";


                ouvrir.target =
                    "_blank";


                ouvrir.rel =
                    "noopener noreferrer";


                ouvrir.textContent =
                    "🔗 فتح";


                /* Modifier */

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
                            docSnap.id;


                        document.getElementById(
                            "documentTitre"
                        ).value =
                            data.titre || "";


                        document.getElementById(
                            "documentDescription"
                        ).value =
                            data.description || "";


                        document.getElementById(
                            "documentUrl"
                        ).value =
                            data.url || "";


                        document.getElementById(
                            "documentCategorie"
                        ).value =
                            data.categorie ||
                            "documents";


                        document.getElementById(
                            "documentPublie"
                        ).checked =
                            data.publie === true;


                        document.getElementById(
                            "documentTitre"
                        ).focus();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    }
                );


                /* Supprimer */

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

                        const confirmation =
                            confirm(
                                "هل تريد حذف هذه الوثيقة؟"
                            );


                        if (!confirmation) {
                            return;
                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "documents",
                                    docSnap.id
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


                /* -----------------------------------------
                   AJOUT DES BOUTONS
                ----------------------------------------- */

                boutons.appendChild(
                    ouvrir
                );


                boutons.appendChild(
                    modifier
                );


                boutons.appendChild(
                    supprimer
                );


                /* -----------------------------------------
                   ASSEMBLAGE
                ----------------------------------------- */

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
   ANNULATION DOCUMENT
   ========================================================= */

const documentAnnuler =
    document.getElementById(
        "documentAnnuler"
    );


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
```
