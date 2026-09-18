import {
    connexionAdmin,
    deconnexion
} from "./auth.js";


/* =========================================================
   ÉLÉMENTS
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
   CONNEXION
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


            /* Connexion réussie */

            loginSection.classList.add(
                "hidden"
            );

            dashboardSection.classList.remove(
                "hidden"
            );


            adminEmail.textContent =
                user.email;


            loginMessage.textContent = "";


        } catch (error) {

            console.error(
                "Firebase Auth :",
                error
            );


            /* Messages plus explicites */

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

        await deconnexion();

        dashboardSection.classList.add(
            "hidden"
        );

        loginSection.classList.remove(
            "hidden"
        );

        loginForm.reset();

    }
);
