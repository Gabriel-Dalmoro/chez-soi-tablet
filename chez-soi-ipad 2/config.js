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

  /* 3. Les rendez-vous du jour (écran d'accueil)
        icone : cachets | infirmiere | repas | appel | coiffeur | medecin | marche | visite | courses */
  agenda: [
    { heure: "8h00",  titre: "Cachets du matin",   detail: "Dans le pilulier",        icone: "cachets" },
    { heure: "10h30", titre: "Infirmière Sophie",  detail: "Elle vient à la maison",  icone: "infirmiere" },
    { heure: "12h00", titre: "Déjeuner livré",      detail: "Les repas de la mairie",  icone: "repas" },
    { heure: "15h00", titre: "Appel avec Pierre",  detail: "Sur la tablette",         icone: "appel" },
    { heure: "19h00", titre: "Cachets du soir",    detail: "Dans le pilulier",        icone: "cachets" }
  ],

  /* 4. La météo (valeurs fixes pour la démo)
        ciel : soleil | eclaircies | nuages | pluie | neige
        conseil : la petite phrase en dessous (null = choisie selon le temps) */
  meteo: { ville: "Annecy", temp: 18, ciel: "soleil", max: 21, min: 9, conseil: null },

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
