/* =========================================================
   ECOLE MILOUD GAFSA
   ADMIN.JS
   Firebase Authentication + Firestore

   Gestion :
   - Connexion Admin
   - Mot de passe oublié
   - Annonces
   - Documents PDF / Word depuis le PC
   - Catégorie + Destination
   - Création automatique des actualités
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
   FIREBASE STORAGE
   ========================================================= */

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

import {
    db,
    auth,
    storage
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
   VARIABLES DOCUMENT
   ========================================================= */

let documentCibleSelect = null;
let documentTrimestreSelect = null;


/* =========================================================
   VÉRIFICATION
   ========================================================= */

console.log(
    "admin.js chargé correctement."
);


/* =========================================================
   MESSAGE
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
   CRÉER AUTOMATIQUEMENT LE CHAMP DESTINATION
   ========================================================= */

function creerChampDestination() {

    const categorieSelect =
        document.getElementById(
            "documentCategorie"
        );


    if (
        !categorieSelect ||
        !documentForm
    ) {
        return;
    }


    /* Éviter une double création */

    if (
        document.getElementById(
            "documentCible"
        )
    ) {

        documentCibleSelect =
            document.getElementById(
                "documentCible"
            );

        return;
    }


    const groupeCategorie =
        categorieSelect.closest(
            ".form-group"
        );


    if (!groupeCategorie) {
        return;
    }


    const groupeCible =
        document.createElement(
            "div"
        );


    groupeCible.className =
        "form-group";


    const label =
        document.createElement(
            "label"
        );


    label.setAttribute(
        "for",
        "documentCible"
    );


    label.textContent =
        "🎯 الوجهة";


    const select =
        document.createElement(
            "select"
        );


    select.id =
        "documentCible";

    select.name =
        "documentCible";


    groupeCible.appendChild(
        label
    );


    groupeCible.appendChild(
        select
    );


    groupeCategorie.insertAdjacentElement(
        "afterend",
        groupeCible
    );


    documentCibleSelect =
        select;


    categorieSelect.addEventListener(
        "change",
        mettreAJourDestinations
    );


    mettreAJourDestinations();
}


/* =========================================================
   DESTINATIONS
   ========================================================= */

function mettreAJourDestinations() {

    const categorieSelect =
        document.getElementById(
            "documentCategorie"
        );


    if (
        !categorieSelect ||
        !documentCibleSelect
    ) {
        return;
    }


    const categorie =
        categorieSelect.value;


    documentCibleSelect.innerHTML =
        "";


    let destinations = [];


    /* -----------------------------------------
       DOCUMENTS GÉNÉRAUX
    ----------------------------------------- */

    if (
        categorie ===
        "documents"
    ) {

        destinations = [

            {
                value: "general",
                label: "📚 الوثائق العامة"
            }

        ];
    }


    /* -----------------------------------------
       HORAIRES
    ----------------------------------------- */

    else if (
        categorie ===
        "horaires"
    ) {

        destinations = [

            {
                value: "sana1",
                label: "السنة الأولى"
            },

            {
                value: "sana2",
                label: "السنة الثانية"
            },

            {
                value: "sana3",
                label: "السنة الثالثة"
            },

            {
                value: "sana4",
                label: "السنة الرابعة"
            },

            {
                value: "sana5",
                label: "السنة الخامسة"
            },

            {
                value: "sana6",
                label: "السنة السادسة"
            }

        ];
    }


    /* -----------------------------------------
       EXAMENS
    ----------------------------------------- */

    else if (
        categorie ===
        "examens"
    ) {

        destinations = [

            {
                value: "trimestre1",
                label: "الثلاثي الأول"
            },

            {
                value: "trimestre2",
                label: "الثلاثي الثاني"
            },

            {
                value: "trimestre3",
                label: "الثلاثي الثالث"
            }

        ];
    }


    /* -----------------------------------------
       CONCOURS SIX
    ----------------------------------------- */

    else if (
        categorie ===
        "concours-six"
    ) {

        destinations = [

            {
                value: "calendrier",
                label: "📅 الرزنامة والمواعيد"
            },

            {
                value: "anciens-sujets",
                label: "📚 مواضيع السنوات السابقة"
            },

            {
                value: "preparation",
                label: "✏️ تمارين للتحضير"
            },

            {
                value: "annonces",
                label: "📢 الإعلانات"
            }

        ];
    }


    destinations.forEach(
        function (destination) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                destination.value;


            option.textContent =
                destination.label;


            documentCibleSelect.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   INITIALISATION DESTINATION
   ========================================================= */

creerChampDestination();


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
   ERREUR CONNEXION
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
   =========================================================
   OUTIL : CRÉER UNE ACTUALITÉ
   =========================================================
   
   Structure Firestore :

   actualites
      titre
      description
      type
      referenceId
      actif
      createdAt

   La durée de validité de 10 jours et le badge
   "جديد" sont gérés dans actualites-public.js.
   ========================================================= */

async function creerActualite(
    titreActualite,
    descriptionActualite,
    typeActualite,
    referenceId
) {

    try {

        const actualiteRef =
            await addDoc(
                collection(
                    db,
                    "actualites"
                ),
                {

                    titre:
                        titreActualite,

                    description:
                        descriptionActualite,

                    type:
                        typeActualite,

                    referenceId:
                        referenceId,

                    actif:
                        true,

                    createdAt:
                        serverTimestamp()
                }
            );


        console.log(
            "📰 Actualité créée automatiquement :",
            actualiteRef.id
        );


        return actualiteRef.id;


    } catch (error) {

        console.error(
            "❌ Erreur création actualité :",
            error
        );


        throw error;
    }
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


                /* =========================================
                   MODIFICATION ANNONCE
                ========================================= */

                if (id) {

                    await updateDoc(
                        doc(
                            db,
                            "annonces",
                            id
                        ),
                        donnees
                    );


                    /*
                       Si l'annonce est publiée,
                       créer une nouvelle actualité
                       signalant sa modification.
                    */

                    if (publie === true) {

                        try {

                            await creerActualite(

                                "تعديل إعلان",

                                titre,

                                "annonce-modification",

                                id

                            );

                        } catch (
                            actualiteError
                        ) {

                            console.error(
                                "⚠️ Annonce modifiée mais actualité non créée :",
                                actualiteError
                            );

                            alert(
                                "تم تعديل الإعلان، لكن تعذر إنشاء المستجد."
                            );

                            resetAnnonceForm();

                            await chargerAnnonces();

                            return;
                        }
                    }


                    alert(
                        "تم تعديل الإعلان بنجاح."
                    );


                }

                /* =========================================
                   AJOUT ANNONCE
                ========================================= */

                else {

                    const annonceRef =
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


                    /*
                       Créer une actualité uniquement
                       si l'annonce est publiée.
                    */

                    if (publie === true) {

                        try {

                            await creerActualite(

                                "إضافة إعلان جديد",

                                titre,

                                "annonce",

                                annonceRef.id

                            );

                        } catch (
                            actualiteError
                        ) {

                            console.error(
                                "⚠️ Annonce ajoutée mais actualité non créée :",
                                actualiteError
                            );

                            alert(
                                "تمت إضافة الإعلان، لكن تعذر إنشاء المستجد."
                            );

                            resetAnnonceForm();

                            await chargerAnnonces();

                            return;
                        }
                    }


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


                const titre =
                    document.createElement(
                        "h3"
                    );


                titre.textContent =
                    annonce.titre ||
                    "إعلان";


                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    annonce.contenu ||
                    "";


                const statut =
                    document.createElement(
                        "small"
                    );


                statut.textContent =
                    annonce.publie === true
                        ? "✅ منشور"
                        : "⏸️ غير منشور";


                const boutons =
                    document.createElement(
                        "div"
                    );


                boutons.className =
                    "item-buttons";


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

        id.value =
            "";
    }


    if (publie) {

        publie.checked =
            true;
    }
}


/* =========================================================
   ======================== PHOTOS =========================
   ========================================================= */


/* =========================================================
   ENVOYER UNE PHOTO VERS FIREBASE STORAGE
   ========================================================= */

async function envoyerPhotoVersStorage(
    fichier
) {

    try {

        /* Nom unique du fichier */

        const nomUnique =
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 10) +
            "_" +
            fichier.name;


        /* Chemin dans Firebase Storage */

        const chemin =
            "galerie/" +
            nomUnique;


        /* Référence Storage */

        const fichierRef =
            ref(
                storage,
                chemin
            );


        /* Envoi du fichier */

        await uploadBytes(
            fichierRef,
            fichier
        );


        /* Récupération de l'URL */

        const url =
            await getDownloadURL(
                fichierRef
            );


        console.log(
            "📸 Photo envoyée vers Storage :",
            url
        );


        return {
            url: url,
            chemin: chemin,
            nomFichier: fichier.name,
            typeFichier:
                fichier.type ||
                "application/octet-stream",
            tailleFichier:
                fichier.size
        };


    } catch (error) {

        console.error(
            "❌ Erreur envoi photo vers Storage :",
            error
        );

        throw error;
    }
}

/* =========================================================
   FORMULAIRE GALERIE
========================================================= */

const galerieForm =
    document.getElementById(
        "galerieForm"
    );

const galerieFiles =
    document.getElementById(
        "galerieFiles"
    );

const galerieMessage =
    document.getElementById(
        "galerieMessage"
    );


if (galerieForm) {

    galerieForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================================
               RÉCUPÉRER LE TITRE ET LA DESCRIPTION
            ========================================= */

            const titre =
                document.getElementById(
                    "galerieTitre"
                )?.value.trim() ||
                "معرض الصور";


            const description =
                document.getElementById(
                    "galerieDescription"
                )?.value.trim() ||
                "";


            /* =========================================
               VÉRIFIER LES FICHIERS
            ========================================= */

            if (
                !galerieFiles ||
                !galerieFiles.files ||
                galerieFiles.files.length === 0
            ) {

                alert(
                    "يرجى اختيار صورة واحدة على الأقل."
                );

                return;
            }


            const fichiers =
                Array.from(
                    galerieFiles.files
                );


            /* =========================================
               MESSAGE
            ========================================= */

            if (galerieMessage) {

                galerieMessage.textContent =
                    "جاري رفع الصور...";
            }


            try {

                /* =====================================
                   TRAITER CHAQUE PHOTO
                ===================================== */

                for (
                    const fichier of fichiers
                ) {

                    console.log(
                        "📸 رفع الصورة :",
                        fichier.name
                    );


                    /* ================================
                       1. ENVOYER VERS STORAGE
                    ================================= */

                    const resultat =
                        await envoyerPhotoVersStorage(
                            fichier
                        );


                    console.log(
                        "✅ تم رفع الصورة إلى Storage :",
                        resultat
                    );


                    /* ================================
                       2. ENREGISTRER DANS FIRESTORE
                    ================================= */

                    const galerieRef =
                        await addDoc(
                            collection(
                                db,
                                "galerie"
                            ),
                            {

                                titre:
                                    titre,

                                description:
                                    description,

                                url:
                                    resultat.url,

                                chemin:
                                    resultat.chemin,

                                nomFichier:
                                    resultat.nomFichier,

                                typeFichier:
                                    resultat.typeFichier,

                                tailleFichier:
                                    resultat.tailleFichier,

                                createdAt:
                                    serverTimestamp(),

                                actif:
                                    true
                            }
                        );


                    console.log(
                        "🖼️ Photo enregistrée dans Firestore :",
                        galerieRef.id
                    );
                }


                /* =====================================
                   SUCCÈS
                ===================================== */

                if (galerieMessage) {

                    galerieMessage.textContent =
                        "✅ تم رفع الصور وحفظها بنجاح.";
                }


                galerieForm.reset();


            } catch (error) {

                console.error(
                    "❌ خطأ أثناء إضافة الصور :",
                    error
                );


                if (galerieMessage) {

                    galerieMessage.textContent =
                        "❌ تعذر رفع الصور أو حفظها.";
                }

            }

        }
    );
}

/* =========================================================
   ====================== DOCUMENTS ========================
   ========================================================= */


/* =========================================================
   CONVERSION FICHIER → BYTES
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

                        const tableau =
                            new Uint8Array(
                                reader.result
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
                )?.value ||
                "documents";


            const publie =
                document.getElementById(
                    "documentPublie"
                )?.checked === true;


            const fichier =
                fichierInput?.files?.[0] ||
                null;


            const cible =
                documentCibleSelect?.value ||
                "general";


            /* TITRE */

            if (!titre) {

                alert(
                    "يرجى إدخال عنوان الوثيقة."
                );

                return;
            }


            /* NOUVEL AJOUT */

            if (
                !id &&
                !fichier
            ) {

                alert(
                    "يرجى اختيار الوثيقة من جهاز الكمبيوتر."
                );

                return;
            }


            /* LIMITE */

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
                        categorie,

                    cible:
                        cible,

                    publie:
                        publie,

                    updatedAt:
                        serverTimestamp()
                };


                /* =========================================
                   NOUVEAU FICHIER
                ========================================= */

                if (fichier) {

                    const extensionsAcceptees = [

                        "pdf",

                        "doc",

                        "docx"
                    ];


                    const typesAcceptes = [

                        "application/pdf",

                        "application/msword",

                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ];


                    const extension =
                        fichier.name
                            .toLowerCase()
                            .split(".")
                            .pop();


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


                /* =========================================
                   MODIFICATION DOCUMENT
                ========================================= */

                if (id) {

                    await updateDoc(
                        doc(
                            db,
                            "documents",
                            id
                        ),
                        donnees
                    );


                    /*
                       Si le document est publié,
                       créer une actualité signalant
                       sa modification.
                    */

                    if (publie === true) {

                        try {

                            await creerActualite(

                                "تعديل وثيقة",

                                titre,

                                "document-modification",

                                id

                            );

                        } catch (
                            actualiteError
                        ) {

                            console.error(
                                "⚠️ Document modifié mais actualité non créée :",
                                actualiteError
                            );

                            alert(
                                "تم تعديل الوثيقة، لكن تعذر إنشاء المستجد."
                            );

                            resetDocumentForm();

                            await chargerDocuments();

                            return;
                        }
                    }


                    alert(
                        "تم تعديل الوثيقة بنجاح."
                    );


                }

                /* =========================================
                   AJOUT DOCUMENT
                ========================================= */

                else {

                    const documentRef =
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


                    /*
                       Créer une actualité uniquement
                       si le document est publié.
                    */

                    if (publie === true) {

                        try {

                            await creerActualite(

                                "إضافة وثيقة جديدة",

                                titre,

                                "document",

                                documentRef.id

                            );

                        } catch (
                            actualiteError
                        ) {

                            console.error(
                                "⚠️ Document ajouté mais actualité non créée :",
                                actualiteError
                            );

                            alert(
                                "تمت إضافة الوثيقة، لكن تعذر إنشاء المستجد."
                            );

                            resetDocumentForm();

                            await chargerDocuments();

                            return;
                        }
                    }


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
   CHARGER DOCUMENTS ADMIN
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


                /* FICHIER */

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


                /* DESTINATION */

                const destination =
                    document.createElement(
                        "small"
                    );


                destination.textContent =
                    "🎯 " +
                    obtenirLibelleDestination(
                        documentData.categorie,
                        documentData.cible
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
                        "button"
                    );


                ouvrir.type =
                    "button";


                ouvrir.textContent =
                    "📄 فتح";


                ouvrir.addEventListener(
                    "click",
                    function () {

                        ouvrirDocument(
                            documentData
                        );
                    }
                );


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


                        mettreAJourDestinations();


                        if (documentCibleSelect) {

                            documentCibleSelect.value =
                                documentData.cible ||
                                "general";
                        }


                        document.getElementById(
                            "documentPublie"
                        ).checked =
                            documentData.publie === true;


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
                    nomFichier
                );


                article.appendChild(
                    destination
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
   LIBELLÉ DESTINATION
   ========================================================= */

function obtenirLibelleDestination(
    categorie,
    cible
) {

    const destinations = {

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


    return (
        destinations[cible] ||
        "الوثائق العامة"
    );
}


/* =========================================================
   OUVRIR DOCUMENT
   ========================================================= */

function ouvrirDocument(
    documentData
) {

    try {

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
                            documentData.typeFichier ||
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


            return;
        }


        if (
            documentData.url
        ) {

            window.open(
                documentData.url,
                "_blank"
            );

            return;
        }


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


    if (documentCibleSelect) {

        mettreAJourDestinations();
    }
}
