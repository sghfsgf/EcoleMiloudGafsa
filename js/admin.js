
/* =========================================================
   ECOLE MILOUD GAFSA
   ADMIN.JS
   Connexion + gestion Firestore
   ========================================================= */


/* =========================================================
   FIREBASE AUTH
   ========================================================= */

import {
    connexionAdmin,
    deconnexion
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


/* =========================================================
   CONNEXION ADMIN
   ========================================================= */

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


        loginMessage.textContent =
            "جاري تسجيل الدخول...";


        try {

            const user =
                await connexionAdmin(
                    email,
                    password
                );


            loginSection.classList.add(
                "hidden"
            );


            dashboardSection.classList.remove(
                "hidden"
            );


            adminEmail.textContent =
                user.email;


            loginMessage.textContent = "";


            /* Charger les données */

            await chargerAnnonces();

            await chargerDocuments();


        } catch (error) {

            console.error(
                "Firebase Auth :",
                error
            );


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                loginMessage.textContent =
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

            }
            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                loginMessage.textContent =
                    "هذا الحساب غير موجود.";

            }
            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                loginMessage.textContent =
                    "كلمة المرور غير صحيحة.";

            }
            else if (
                error.message ===
                "Compte non autorisé."
            ) {

                loginMessage.textContent =
                    "هذا الحساب غير مصرح له بالدخول إلى الإدارة.";

            }
            else {

                loginMessage.textContent =
                    "تعذر تسجيل الدخول. افتح F12 لمعرفة الخطأ.";
            }
        }
    }
);


/* =========================================================
   DÉCONNEXION
   ========================================================= */

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


        } catch (error) {

            console.error(
                "Erreur déconnexion :",
                error
            );
        }
    }
);


/* =========================================================
   ANNONCES
   ========================================================= */

const annonceForm =
    document.getElementById("annonceForm");


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

                titre: titre,

                contenu: contenu,

                publie: publie,

                updatedAt:
                    serverTimestamp()
            };


            /* Modification */

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

            /* Ajout */

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


            annonceForm.reset();


            document.getElementById(
                "annonceId"
            ).value = "";


            document.getElementById(
                "annoncePubliee"
            ).checked = true;


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


/* =========================================================
   CHARGER ANNONCES
   ========================================================= */

async function chargerAnnonces() {

    const container =
        document.getElementById(
            "annoncesAdmin"
        );


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


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    data.titre || "";


                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    data.contenu || "";


                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    data.publie
                    ? "✅ منشور"
                    : "⏸️ غير منشور";


                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


                /* Bouton modifier */

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
                    }
                );


                /* Bouton supprimer */

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

document
    .getElementById(
        "annonceAnnuler"
    )
    .addEventListener(
        "click",
        function () {

            annonceForm.reset();


            document.getElementById(
                "annonceId"
            ).value = "";


            document.getElementById(
                "annoncePubliee"
            ).checked = true;
        }
    );


/* =========================================================
   DOCUMENTS
   ========================================================= */

const documentForm =
    document.getElementById(
        "documentForm"
    );


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


        try {

            const donnees = {

                titre: titre,

                description:
                    description,

                url: url,

                categorie:
                    categorie,

                publie:
                    publie,

                updatedAt:
                    serverTimestamp()
            };


            /* Modification */

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

            /* Ajout */

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


            documentForm.reset();


            document.getElementById(
                "documentId"
            ).value = "";


            document.getElementById(
                "documentPublie"
            ).checked = true;


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


/* =========================================================
   CHARGER DOCUMENTS
   ========================================================= */

async function chargerDocuments() {

    const container =
        document.getElementById(
            "documentsAdmin"
        );


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


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "admin-item";


                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    data.titre || "";


                const description =
                    document.createElement(
                        "p"
                    );


                description.textContent =
                    data.description || "";


                const categorie =
                    document.createElement(
                        "small"
                    );


                categorie.textContent =
                    "القسم: " +
                    (
                        data.categorie ||
                        ""
                    );


                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    data.publie
                    ? " ✅ منشور"
                    : " ⏸️ غير منشور";


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
                                error
                            );


                            alert(
                                "تعذر حذف الوثيقة."
                            );
                        }
                    }
                );


                boutons.appendChild(
                    ouvrir
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

document
    .getElementById(
        "documentAnnuler"
    )
    .addEventListener(
        "click",
        function () {

            documentForm.reset();


            document.getElementById(
                "documentId"
            ).value = "";


            document.getElementById(
                "documentPublie"
            ).checked = true;
        }
    );

