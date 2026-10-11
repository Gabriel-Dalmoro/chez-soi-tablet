/* =========================================================
   Chez Soi – configuration de la tablette (la « borne »)
   C'est le SEUL fichier à modifier.
   ========================================================= */
window.CGM_CONFIG = {

  /* 1. Firebase (projet partagé avec l'appli du proche) */
  firebase: {
    apiKey: "AIzaSyAo5hcSJLkoA9g4X3wtUYgtFrnz9L1dxCw",
    authDomain: "cafegrandmere-cc9e7.firebaseapp.com",
    projectId: "cafegrandmere-cc9e7",
    storageBucket: "cafegrandmere-cc9e7.firebasestorage.app",
    messagingSenderId: "1058479487487",
    appId: "1:1058479487487:web:1c94a2df51f1a2df0bcfca",
    measurementId: "G-VFGX6S991H"
  },

  /* 2. Le document partagé avec l'appli du proche. */
  sync: {
    docPath: "foyers/demo",
    heartbeat: true          // la borne écrit borne.enLigne et borne.dernierSignal toutes les 20 s
  },

  /* 3. Voix
        "auto"      : fichier enregistré si la phrase « voix » correspond, sinon voix de synthèse de l'iPad
        "fichiers"  : toujours les fichiers enregistrés (matin ou soir selon la phrase)
        "synthese"  : toujours la voix de synthèse de l'iPad (lit exactement le texte reçu) */
  voice: { mode: "auto", folder: "audio" },   // folder : "audio" (Vivienne) ou "audio-alt" (Denise)

  /* 4. Valeurs par défaut (remplacées par profil.prenom / profil.proche du document) */
  names: { senior: "Agnès", proche: "Pierre" },

  /* 5. Comportement */
  showButton: false,                // true = afficher borne.ecran.bouton (ex. « C'est fait »)
  doneReturnsToCalmAfterMs: 9000,   // après « fait », retour doux à l'horloge (écran seulement)
  autoRetourCalme: true,            // si la console ne remet pas « calme », la borne le fait (dans Firestore)
  retourCalmeApresMs: 11000,        // … après ce délai (la console a la main à 8 s)

  /* 6. Moment de la journée (fond, soleil, « Bonjour / Bonsoir »)
        null = vraie heure · ou forcer pour la démo : "matin" | "jour" | "soir" | "nuit" */
  forcerMoment: null
};
