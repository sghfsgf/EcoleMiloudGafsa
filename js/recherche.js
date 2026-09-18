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
   SECTIONS STATIQUES
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
   RECHERCHE ARABE
   ========================================================= */

function normaliser(texte) {

    return String(texte || "")

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u064B-\u065F\u0670]/g,
            ""
        )

        .replace(
            /[إأآ]/g,
            "ا"
        )

        .replace(
            /ى/g,
            "ي"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


/* =========================================================
   CRÉER ZONE RESULTATS
   ========================================================= */

const searchBox =
    document.querySelector(".search-box");


const searchResults =
    document.createElement("div");


searchResults.id =
    "searchResults";


searchBox.appendChild(
    searchResults
);


/* =========================================================
   RECHERCHE
   ========================================================= */

async function effectuerRecherche() {

    const input =
        document.getElementById(
            "search"
        );


    const terme =
        normaliser(
            input.value
        );


    searchResults.innerHTML = "";


    if (!terme) {

        return;
    }


    /* ---------------------------------------------
       Résultats sections statiques
    --------------------------------------------- */

    let resultats = [];


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


    /* ---------------------------------------------
       Annonces Firebase
    --------------------------------------------- */

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
                            data.titre,

                        texte:
                            data.contenu,

                        id:
                            "annonces"
                    });
                }

            }
        );


    } catch (error) {

        console.error(
            "Recherche annonces :",
            error
        );
    }


    /* ---------------------------------------------
       Documents Firebase
    --------------------------------------------- */

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

                        type: "document",

                        titre:
                            data.titre,

                        texte:
                            data.description,

                        url:
                            data.url
                    });
                }

            }
        );


    } catch (error) {

        console.error(
            "Recherche documents :",
            error
        );
    }


    afficherResultats(
        resultats
    );
}


/* =========================================================
   AFFICHER RESULTATS
   ========================================================= */

function afficherResultats(
    resultats
) {

    if (
        resultats.length === 0
    ) {

        searchResults.innerHTML = `

            <div class="search-no-result">

                لا توجد نتائج لهذا البحث.

            </div>
        `;

        return;
    }


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


    resultats.forEach(
        resultat => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-result-item";


            const h3 =
                document.createElement(
                    "h3"
                );


            h3.textContent =
                resultat.titre;


            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                resultat.texte || "";


            item.appendChild(
                h3
            );

            item.appendChild(
                p
            );


            item.addEventListener(
                "click",
                () => {

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
                                behavior: "smooth"
                            });
                        }
                    }


                    else if (
                        resultat.type ===
                        "annonce"
                    ) {

                        const section =
                            document.getElementById(
                                "annonces"
                            );


                        if (section) {

                            section.scrollIntoView({
                                behavior: "smooth"
                            });
                        }
                    }


                    else if (
                        resultat.type ===
                        "document"
                        &&
                        resultat.url
                    ) {

                        window.open(
                            resultat.url,
                            "_blank",
                            "noopener"
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
   BOUTON
   ========================================================= */

document
    .getElementById(
        "searchButton"
    )
    .addEventListener(
        "click",
        effectuerRecherche
    );


/* =========================================================
   TOUCHE ENTRÉE
   ========================================================= */

document
    .getElementById(
        "search"
    )
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                effectuerRecherche();
            }
        }
    );
