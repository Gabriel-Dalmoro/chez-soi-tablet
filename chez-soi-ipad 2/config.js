/* =========================================================
   Chez Soi – configuration de la tablette (la « borne »)
   Version démo : 100 % locale, aucune connexion nécessaire.
   C'est le SEUL fichier à modifier.
   ========================================================= */
window.CGM_CONFIG = {

  /* 1. Voix
        "auto"      : fichier enregistré si la phrase correspond, sinon voix de synthèse de l'iPad
        "synthese"  : toujours la voix de synthèse de l'iPad */
  voice: { mode: "auto", folder: "audio" },   // folder : "audio" (Vivienne) ou "audio-alt" (Denise)

  /* 2. Les prénoms */
  names: { senior: "Agnès", proche: "Pierre" },

  /* 3. Les rendez-vous du jour. L'accueil montre seulement le prochain.
        icone : cachets | infirmiere | repas | appel | coiffeur | medecin | marche | visite | courses */
  agenda: [
    { heure: "8h00",  titre: "Vos cachets du matin", icone: "cachets" },
    { heure: "10h30", titre: "L’infirmière passe",   icone: "infirmiere" },
    { heure: "12h00", titre: "Le déjeuner arrive",   icone: "repas" },
    { heure: "15h00", titre: "Pierre vous appelle",  icone: "appel" },
    { heure: "19h00", titre: "Vos cachets du soir",  icone: "cachets" }
  ],

  /* 4. La météo (en haut à droite). ciel : soleil | eclaircies | nuages | pluie | neige */
  meteo: { temp: 18, ciel: "soleil" },

  /* 5. Comportement */
  doneReturnsToCalmAfterMs: 9000,   // après « C'est fait », retour doux à l'accueil

  /* 6. Pour les captures d'écran
        heureDemo : null = vraie heure · ou "9h30" (l'horloge démarre à cette heure et avance)
        forcerMoment : null = selon l'heure · ou "matin" | "jour" | "soir" | "nuit" (le fond seulement)
        ecranDemarrage : false = on arrive directement sur l'accueil (pas de bouton « Toucher pour commencer »)
        Tout peut aussi se régler dans l'adresse, voir le README. */
  heureDemo: "9h30",
  forcerMoment: null,
  ecranDemarrage: true
};
