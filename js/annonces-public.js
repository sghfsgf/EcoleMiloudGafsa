/* =========================================================
ECOLE MILOUD GAFSA
AFFICHAGE PUBLIC DES ANNONCES

Logique conservée :

* uniquement les annonces publiées
* lecture en temps réel Firestore
* tri par date de création
* affichage du titre et du contenu
* affichage facultatif de la date
* message en cas d'erreur

Ajout :

* 🍊 sur l'annonce pendant 3 jours
* 🍊 sur le volet "الإعلانات" pendant 3 jours
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

const annoncesContainer =
document.getElementById(
"annoncesContainer"
);

/* =========================================================
PARAMÈTRES NOUVEAUTÉ
========================================================= */

const DUREE_NOUVEAUTE =
3 * 24 * 60 * 60 * 1000;

/* =========================================================
OBTENIR LA DATE EN MILLISECONDES
========================================================= */

function obtenirDateMillis(
valeur
) {

```
if (!valeur) {
    return 0;
}


if (
    typeof valeur.toMillis ===
    "function"
) {

    return valeur.toMillis();
}


if (
    typeof valeur.toDate ===
    "function"
) {

    return valeur.toDate().getTime();
}


if (
    valeur instanceof Date
) {

    return valeur.getTime();
}


if (
    typeof valeur ===
    "number"
) {

    return valeur;
}


return 0;
```

}

/* =========================================================
VÉRIFIER SI UNE ANNONCE EST NOUVELLE
========================================================= */

function estNouvelleAnnonce(
annonce
) {

```
/*
 * updatedAt est prioritaire.
 * createdAt sert de secours.
 */

const dateReference =
    obtenirDateMillis(
        annonce.updatedAt
    ) ||
    obtenirDateMillis(
        annonce.createdAt
    );


if (!dateReference) {
    return false;
}


const age =
    Date.now() -
    dateReference;


if (age < 0) {
    return false;
}


return (
    age <=
    DUREE_NOUVEAUTE
);
```

}

/* =========================================================
RESTER UNIQUEMENT SUR LE VOLET "الإعلانات"
========================================================= */

function obtenirLienAnnonces() {

```
const liens =
    document.querySelectorAll(
        '.navigation-links a[href="#annonces"]'
    );


if (
    liens.length > 0
) {

    return liens[0];
}


/*
 * Compatibilité avec une ancienne structure.
 */

const anciensLiens =
    document.querySelectorAll(
        '.nav-container a[href="#annonces"]'
    );


return anciensLiens[0] || null;
```

}

/* =========================================================
SUPPRIMER LES INDICATEURS 🍊 DU MENU DES ANNONCES
========================================================= */

function supprimerIndicateursMenuAnnonces() {

```
const indicateurs =
    document.querySelectorAll(
        ".annonce-nouveau-indicateur"
    );


indicateurs.forEach(
    function (indicateur) {

        indicateur.remove();
    }
);
```

}

/* =========================================================
AJOUTER 🍊 AU VOLET "الإعلانات"
========================================================= */

function ajouterIndicateurMenuAnnonces() {

```
const lien =
    obtenirLienAnnonces();


if (!lien) {
    return null;
}


/*
 * Éviter les doublons.
 */

const ancien =
    lien.querySelector(
        ".annonce-nouveau-indicateur"
    );


if (ancien) {
    return ancien;
}


const indicateur =
    document.createElement(
        "span"
    );


indicateur.className =
    "annonce-nouveau-indicateur";


indicateur.textContent =
    " 🍊";


indicateur.setAttribute(
    "aria-label",
    "nouveau"
);


indicateur.style.fontSize =
    "0.85em";


lien.appendChild(
    indicateur
);


return indicateur;
```

}

/* =========================================================
PROGRAMMER LA DISPARITION AUTOMATIQUE
========================================================= */

function programmerDisparition(
element,
dateReference
) {

```
if (
    !element ||
    !dateReference
) {

    return;
}


const tempsRestant =
    DUREE_NOUVEAUTE -
    (
        Date.now() -
        dateReference
    );


if (
    tempsRestant <= 0
) {

    element.remove();

    return;
}


setTimeout(
    function () {

        if (
            element &&
            typeof element.remove ===
                "function"
        ) {

            element.remove();
        }

    },
    tempsRestant
);
```

}

/* =========================================================
VÉRIFICATION CONTENEUR
========================================================= */

if (!annoncesContainer) {

```
console.error(
    "annoncesContainer introuvable."
);
```

} else {

```
/* =====================================================
   REQUÊTE : UNIQUEMENT LES ANNONCES PUBLIÉES
====================================================== */

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


/* =====================================================
   ÉCOUTE EN TEMPS RÉEL
====================================================== */

onSnapshot(
    annoncesQuery,

    (snapshot) => {

        annoncesContainer.innerHTML = "";


        /*
         * Nettoyer uniquement l'indicateur
         * du menu des annonces.
         *
         * On ne touche pas aux indicateurs
         * du menu des documents.
         */

        supprimerIndicateursMenuAnnonces();


        /* =================================================
           AUCUNE ANNONCE
        ================================================== */

        if (
            snapshot.empty
        ) {

            annoncesContainer.innerHTML = `

                <article class="announcement-card">

                    <h3>
                        الإعلانات
                    </h3>

                    <p>
                        لا توجد إعلانات حاليا.
                    </p>

                </article>

            `;

            return;
        }


        /* =================================================
           RÉCUPÉRER LES ANNONCES
        ================================================== */

        const annonces = [];


        snapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                annonces.push({

                    id:
                        docSnap.id,

                    ...data

                });

            }
        );


        /* =================================================
           TRI PAR DATE
           LOGIQUE CONSERVÉE
        ================================================== */

        annonces.sort(
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


        /* =================================================
           AFFICHAGE
        ================================================== */

        let menuAnnonceNouveau =
            null;


        let menuDateReference =
            0;


        annonces.forEach(
            annonce => {


                /* -----------------------------------------
                   DATE DE RÉFÉRENCE NOUVEAUTÉ
                ----------------------------------------- */

                const dateReference =
                    obtenirDateMillis(
                        annonce.updatedAt
                    ) ||
                    obtenirDateMillis(
                        annonce.createdAt
                    );


                const nouvelle =
                    estNouvelleAnnonce(
                        annonce
                    );


                /* -----------------------------------------
                   CARTE
                ----------------------------------------- */

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "announcement-card";


                /* -----------------------------------------
                   TITRE
                ----------------------------------------- */

                const titre =
                    document.createElement(
                        "h3"
                    );


                /*
                 * Ajouter 🍊 si l'annonce est
                 * nouvelle depuis moins de 3 jours.
                 */

                let indicateurCarte =
                    null;


                if (nouvelle) {

                    indicateurCarte =
                        document.createElement(
                            "span"
                        );


                    indicateurCarte.className =
                        "annonce-nouveau-indicateur";


                    indicateurCarte.textContent =
                        "🍊";


                    indicateurCarte.setAttribute(
                        "aria-label",
                        "nouveau"
                    );


                    indicateurCarte.style.fontSize =
                        "0.85em";


                    indicateurCarte.style.marginLeft =
                        "5px";


                    titre.appendChild(
                        indicateurCarte
                    );


                    /*
                     * Garder la date la plus
                     * récente pour le menu.
                     */

                    if (
                        dateReference >
                        menuDateReference
                    ) {

                        menuDateReference =
                            dateReference;
                    }
                }


                titre.appendChild(
                    document.createTextNode(
                        annonce.titre ||
                        "إعلان"
                    )
                );


                /* -----------------------------------------
                   CONTENU
                ----------------------------------------- */

                const contenu =
                    document.createElement(
                        "p"
                    );


                contenu.textContent =
                    annonce.contenu ||
                    "";


                article.appendChild(
                    titre
                );


                article.appendChild(
                    contenu
                );


                /* -----------------------------------------
                   DATE FACULTATIVE
                ----------------------------------------- */

                if (
                    annonce.createdAt &&
                    typeof annonce.createdAt.toDate ===
                        "function"
                ) {

                    const date =
                        document.createElement(
                            "small"
                        );


                    const dateObj =
                        annonce.createdAt.toDate();


                    date.textContent =
                        dateObj.toLocaleDateString(
                            "ar-TN"
                        );


                    date.className =
                        "announcement-date";


                    article.appendChild(
                        date
                    );
                }


                /* -----------------------------------------
                   AJOUT DE LA CARTE
                ----------------------------------------- */

                annoncesContainer.appendChild(
                    article
                );


                /* -----------------------------------------
                   PROGRAMMER DISPARITION 🍊
                   DE LA CARTE
                ----------------------------------------- */

                if (
                    nouvelle &&
                    indicateurCarte
                ) {

                    programmerDisparition(
                        indicateurCarte,
                        dateReference
                    );
                }


                /* -----------------------------------------
                   MENU
                ----------------------------------------- */

                if (
                    nouvelle &&
                    !menuAnnonceNouveau
                ) {

                    menuAnnonceNouveau =
                        ajouterIndicateurMenuAnnonces();
                }

            }
        );


        /* =================================================
           PROGRAMMER DISPARITION 🍊 DU MENU
        ================================================== */

        if (
            menuAnnonceNouveau &&
            menuDateReference
        ) {

            programmerDisparition(
                menuAnnonceNouveau,
                menuDateReference
            );
        }

    },


    /* =====================================================
       ERREUR
    ====================================================== */

    (error) => {

        console.error(
            "Erreur chargement annonces :",
            error
        );


        annoncesContainer.innerHTML = `

            <article class="announcement-card">

                <h3>
                    الإعلانات
                </h3>

                <p>
                    تعذر تحميل الإعلانات حاليا.
                </p>

            </article>

        `;
    }
);


}
