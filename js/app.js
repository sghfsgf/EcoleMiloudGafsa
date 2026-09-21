/* =========================================================
   ECOLE MILOUD GAFSA
   APP.JS
   Fonctionnalités générales de l'interface
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. ANNÉE AUTOMATIQUE DU PIED DE PAGE
    ===================================================== */

    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       2. MENU MOBILE
       Fermer le menu après sélection d'une rubrique
    ===================================================== */

    const mobileMenuToggle =
        document.getElementById("mobile-menu-toggle");

    const navigationLinks =
        document.querySelectorAll(
            ".navigation-links a"
        );


    if (
        mobileMenuToggle &&
        navigationLinks.length > 0
    ) {

        navigationLinks.forEach(link => {

            link.addEventListener("click", () => {

                mobileMenuToggle.checked = false;

            });

        });

    }

});
