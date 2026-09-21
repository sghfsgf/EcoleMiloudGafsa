// =====================================================
// SERVICE-WORKER.JS
// EcoleMiloudGafsa
//
// Objectif :
// Toujours privilégier la version disponible sur Internet
// pour que l'utilisateur obtienne la version actuelle du site.
//
// Stratégie : NETWORK FIRST
// =====================================================

const CACHE_NAME = "ecole-miloud-gafsa-v1";

// =====================================================
// INSTALLATION
// =====================================================

self.addEventListener("install", (event) => {

    console.log(
        "🟢 Service Worker : installation"
    );

    // Active immédiatement la nouvelle version
    self.skipWaiting();
});


// =====================================================
// ACTIVATION
// =====================================================

self.addEventListener("activate", (event) => {

    console.log(
        "🟢 Service Worker : activation"
    );

    event.waitUntil(
        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames
                    .filter(
                        (cacheName) =>
                            cacheName !== CACHE_NAME
                    )
                    .map(
                        (cacheName) =>
                            caches.delete(cacheName)
                    )

            );

        })
    );

    // Prend immédiatement le contrôle des pages
    self.clients.claim();
});


// =====================================================
// INTERCEPTION DES REQUÊTES
// STRATÉGIE : NETWORK FIRST
// =====================================================

self.addEventListener("fetch", (event) => {

    // Nous ne traitons que les requêtes GET
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)

            .then((response) => {

                // Si Internet fonctionne,
                // on utilise TOUJOURS la réponse actuelle.

                return response;
            })

            .catch(() => {

                // Si Internet est indisponible,
                // on utilise éventuellement le cache.

                return caches.match(event.request);
            })

    );

});
