/* Chez Soi – la borne (tablette d'Agnès)
   Pilotée uniquement par foyers/demo → borne.ecran { mode, titre, texte, voix, bouton, depuis }
     calme | rappel | urgence | fait
   Règles (spec équipe) :
   - titre et texte sont affichés tels quels (seuls « Bonjour » et « Bonne journée » s'adaptent à l'heure)
   - voix : lue une seule fois, quand « depuis » change ; null = rien
   - bouton : null = pas de bouton (et la borne ne l'affiche que si showButton est activé)
   Les commandes cachées marchent toujours, même sans réseau (écran local seulement). */

const C = window.CGM_CONFIG;
const ORDER = ["calm", "remind", "alert", "done"];
const FROM_DOC = { calme: "calm", rappel: "remind", urgence: "alert", fait: "done" };
const $ = (id) => document.getElementById(id);
const app = $("app");

let foyer = null;               // dernier document reçu
let names = { senior: C.names.senior, proche: C.names.proche };
let current = "calm";
let currentEcran = null;
let started = false;
let doneTimer = null, retourTimer = null;

/* ---------- Heure, moment de la journée ---------- */
let forced = C.forcerMoment || null;
const REF_HOUR = { matin: 9, jour: 14, soir: 19, nuit: 23 };
const hour = () => forced ? REF_HOUR[forced] : new Date().getHours();
const phase = () => { const h = hour(); return h >= 6 && h < 11 ? "matin" : h < 17 && h >= 11 ? "jour" : h < 21 && h >= 17 ? "soir" : "nuit"; };
const salut = () => { const h = hour(); return h >= 5 && h < 12 ? "Bonjour" : h >= 12 && h < 18 ? "Bon après-midi" : h >= 18 && h < 22 ? "Bonsoir" : "Bonne nuit"; };
const auRevoir = () => { const p = phase(); return p === "soir" ? "Bonne soirée." : p === "nuit" ? "Bonne nuit." : "Bonne journée."; };
const libelleMoment = () => { const h = hour(); return h < 11 ? "matin" : h < 16 ? "midi" : "soir"; };   // règle de l'équipe
const hhmm = (t = Date.now()) => { const d = new Date(t); return `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`; };
const today = () => { const s = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); return s[0].toUpperCase() + s.slice(1); };

function adapt(text) {   // seuls les mots qui dépendent de l'heure changent
  if (!text) return text;
  return text.replace(/^Bonjour(?=\s|$)/, salut()).replace(/^Bonne journée\.?$/, auRevoir());
}

function tick() {
  $("clock").textContent = hhmm();
  $("date").textContent = today();
  app.dataset.phase = phase();
  if (current === "calm" || current === "done") render(current, currentEcran);
}
setInterval(tick, 15000);

/* ---------- Affichage ---------- */
function defaults(state) {
  const S = names.senior, P = names.proche, m = libelleMoment();
  return {
    calm:   { titre: `Bonjour ${S}`, texte: "" },
    remind: { titre: `Vos cachets du ${m}`, texte: "Ils sont dans le pilulier." },
    alert:  { titre: `${P} va vous appeler`, texte: `Pour vos cachets du ${m}.` },
    done:   { titre: `Merci ${S}`, texte: "Bonne journée." },
  }[state];
}

function render(state, ecran) {
  const d = defaults(state);
  const titre = adapt(ecran?.titre || d.titre);
  const texte = adapt(ecran?.texte ?? d.texte);
  if (state === "calm")   { $("hello").textContent = titre; $("calmText").textContent = texte || ""; }
  if (state === "remind") { $("remindTitle").textContent = titre; $("remindBody").textContent = texte; }
  if (state === "alert")  { $("alertTitle").textContent = titre;  $("alertBody").textContent = texte; }
  if (state === "done")   { $("doneTitle").textContent = titre;   $("doneBody").textContent = texte; }
  $("initial").textContent = names.proche.charAt(0).toUpperCase();
  $("topTime").textContent = hhmm();
  const label = C.showButton && ecran?.bouton ? ecran.bouton : null;
  $("ctaWrap").hidden = !label;
  $("cta").textContent = label || "";
}

/* ---------- Audio ---------- */
let ctx = null;
const buffers = {};
const MOMENTS = ["matin", "midi", "soir"];
const FILES = ["chime", "urgence", ...MOMENTS.flatMap((m) => [`rappel-${m}`, `rappel2-${m}`])];
async function loadAudio() {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  await Promise.all(FILES.map(async (n) => {
    try {
      const arr = await (await fetch(`${C.voice.folder}/${n}.mp3`)).arrayBuffer();
      buffers[n] = await new Promise((ok, ko) => ctx.decodeAudioData(arr, ok, ko));
    } catch (e) { console.warn("audio", n, e); }
  }));
}
function playFile(name, when = 0) {
  if (!ctx || !buffers[name]) return 0;
  const src = ctx.createBufferSource(); src.buffer = buffers[name];
  const g = ctx.createGain(); g.gain.value = name === "chime" ? 0.7 : 1;
  src.connect(g).connect(ctx.destination); src.start(ctx.currentTime + when);
  return buffers[name].duration;
}

/* Les phrases exactes de la spec, enregistrées avec la voix douce. */
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
function recorded() {
  if (names.senior !== "Agnès" || names.proche !== "Pierre") return {};
  const t = { [norm("Pierre va vous appeler.")]: "urgence" };
  for (const m of MOMENTS) {
    t[norm(`Agnès, c'est l'heure de vos cachets du ${m}.`)] = `rappel-${m}`;
    t[norm(`Agnès, n'oubliez pas vos cachets du ${m}.`)] = `rappel2-${m}`;
  }
  return t;
}
function pickFrenchVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => (v.lang || "").toLowerCase().startsWith("fr"));
  return vs.find((v) => /amélie|amelie|audrey|marie|aurélie|aurelie/i.test(v.name)) || vs[0] || null;
}
function synth(text, delayS) {
  if (!("speechSynthesis" in window)) return 4;
  setTimeout(() => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = 0.88;
    const v = pickFrenchVoice(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }, delayS * 1000);
  return Math.max(3, text.length / 13);
}
let captionTimer = null;
function speak(state, text) {
  if (!started || !text) return;
  if (ctx && ctx.state === "suspended") ctx.resume();
  const chime = state === "remind" || state === "alert";
  const delay = chime ? 1.1 : 0.4;
  if (chime) playFile("chime");
  let dur = 0;
  const file = recorded()[norm(text)];
  if (C.voice.mode !== "synthese" && file) dur = playFile(file, delay);
  if (!dur) dur = synth(text, delay);
  clearTimeout(captionTimer);
  $("captionText").textContent = `« ${text.trim()} »`;
  setTimeout(() => $("caption").classList.add("on"), delay * 1000);
  captionTimer = setTimeout(() => $("caption").classList.remove("on"), (delay + dur + 0.8) * 1000);
}
function hush() { clearTimeout(captionTimer); $("caption").classList.remove("on"); if ("speechSynthesis" in window) speechSynthesis.cancel(); }

/* ---------- Changer d'écran ---------- */
function show(state, { ecran = null, voix = null } = {}) {
  if (!ORDER.includes(state)) return;
  current = state; currentEcran = ecran;
  app.dataset.state = state;
  app.dataset.phase = phase();
  render(state, ecran);
  hush();
  clearTimeout(doneTimer); clearTimeout(retourTimer);
  if (voix) speak(state, voix);
  if (state === "done") {
    doneTimer = setTimeout(() => show("calm", { ecran: calmEcran() }), C.doneReturnsToCalmAfterMs);
    if (ecran?.depuis) armRetourCalme(ecran.depuis);
  }
}

/* Cas 1 / 7 : écran calme avec le prochain rendez-vous (même règle que la console). */
function calmEcran() {
  const now = Date.now();
  const next = (foyer?.agenda || []).filter((r) => r.a > now).sort((a, b) => a.a - b.a)[0];
  return { mode: "calme", titre: `Bonjour ${names.senior}`,
           texte: next ? `${next.titre} à ${hhmm(next.a)}.` : "Rien de prévu pour le moment.",
           voix: null, bouton: null, depuis: now };
}

/* ---------- Synchro Firestore ---------- */
let fs = null, ref = null;
let lastDepuis = null, pending = null;
function setStatus(kind, text) { $("dot").className = "dot " + kind; $("startStatus").textContent = text; }

function onDoc(doc, fromCache) {
  setStatus(fromCache ? "offline" : "live", fromCache ? "Hors ligne : la borne continue en local" : "Synchro active");
  if (!doc) return;
  foyer = doc;
  if (doc.profil) names = { senior: doc.profil.prenom || names.senior, proche: doc.profil.proche || names.proche };
  const ecran = doc.borne && doc.borne.ecran;
  const state = ecran && FROM_DOC[ecran.mode];
  if (!state) return;
  const first = lastDepuis === null;
  const isNew = !first && ecran.depuis !== lastDepuis;
  lastDepuis = ecran.depuis;
  if (!started) { pending = { state, ecran }; return; }
  if (first) show(state, { ecran });                          // état de départ : sans voix
  else if (isNew) show(state, { ecran, voix: ecran.voix });   // changement : voix une seule fois (si non nulle)
  else { currentEcran = ecran; render(state, ecran); }         // même écran, textes mis à jour (agenda…)
}

async function initSync() {
  const cfg = C.firebase || {};
  if (!cfg.apiKey || /COLLER|A_REMPLACER|•/.test(cfg.apiKey)) { setStatus("local", "Mode local : clé API Firebase à coller dans config.js"); return; }
  setStatus("offline", "Connexion à Firestore…");
  try {
    const V = "10.12.2";
    const appMod = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
    const fbApp = appMod.initializeApp(cfg);
    let db;
    try { db = fs.initializeFirestore(fbApp, { localCache: fs.persistentLocalCache() }); } catch { db = fs.getFirestore(fbApp); }
    ref = fs.doc(db, ...C.sync.docPath.split("/"));
    fs.onSnapshot(ref, { includeMetadataChanges: true },
      (snap) => onDoc(snap.data(), snap.metadata.fromCache),
      (err) => { console.warn(err); setStatus("offline", "Synchro indisponible : commandes manuelles actives"); });
    if (C.sync.heartbeat) startHeartbeat();
  } catch (e) { console.warn(e); setStatus("offline", "Synchro indisponible : commandes manuelles actives"); }
}

function beat(online = true) { if (ref) fs.updateDoc(ref, { "borne.enLigne": online, "borne.dernierSignal": Date.now() }).catch(() => {}); }
function startHeartbeat() {
  beat(true);
  setInterval(() => { if (document.visibilityState === "visible") beat(true); }, 20000);
  document.addEventListener("visibilitychange", () => beat(document.visibilityState === "visible"));
}

/* Cas 7 : si la console n'a pas remis « calme » après 8 s, la borne le fait (retourCalme). */
function armRetourCalme(depuisFait) {
  if (!C.autoRetourCalme) return;
  retourTimer = setTimeout(() => {
    const e = foyer?.borne?.ecran;
    if (!ref || !e || e.mode !== "fait" || e.depuis !== depuisFait) return;   // la console l'a déjà fait
    fs.updateDoc(ref, { "borne.ecran": calmEcran() }).catch((err) => console.warn("retourCalme", err));
  }, C.retourCalmeApresMs);
}

/* Bouton « C'est fait » (seulement si showButton). Équivalent de priseConfirmee(d, t, "borne"). */
async function priseConfirmeeBorne() {
  manual("done");
  if (!ref) return;
  try {
    await fs.runTransaction(ref.firestore, async (tx) => {
      const snap = await tx.get(ref); const d = snap.data(); if (!d) return;
      const t = Date.now(), etaitUrgence = d.medicament?.statut === "urgence";
      const lib = d.medicament?.libelle || "Cachets";
      const up = {
        "medicament.statut": "pris", "medicament.priseA": t,
        "borne.ecran": { mode: "fait", titre: `Merci ${names.senior}`, texte: "Bonne journée.", voix: null, bouton: null, depuis: t },
        "etat": { niveau: "ok", titre: "Tout va bien", detail: `${lib} pris à ${hhmm(t)}.`, actions: false, depuis: t, verifieA: d.etat?.verifieA ?? null },
        "journal": [...(d.journal || []), { id: `borne-${t}`, a: t, niveau: "ok", titre: `${lib} pris`, detail: "Confirmé sur la borne", source: "borne" }],
        "majA": t,
      };
      if (etaitUrgence) up.derniereAlerte = { id: `regle-${t}`, a: t, titre: "C'est réglé", texte: `${names.senior} a pris ses ${lib.toLowerCase()}.`, type: "regle" };
      tx.update(ref, up);
    });
  } catch (e) { console.warn("priseConfirmee", e); }
}
$("cta").addEventListener("click", priseConfirmeeBorne);

/* ---------- Commandes cachées (écran local seulement) ---------- */
function manual(state) {
  if (!started) return;
  const S = names.senior, P = names.proche, m = libelleMoment();
  const e = {
    calm:   calmEcran(),
    remind: { titre: `Vos cachets du ${m}`, texte: "Ils sont dans le pilulier.", voix: `${S}, c'est l'heure de vos cachets du ${m}.` },
    alert:  { titre: `${P} va vous appeler`, texte: `Pour vos cachets du ${m}.`, voix: `${P} va vous appeler.` },
    done:   { titre: `Merci ${S}`, texte: "Bonne journée.", voix: null },
  }[state];
  show(state, { ecran: { ...e, bouton: null }, voix: e.voix || null });
}
const step = (n) => manual(ORDER[(ORDER.indexOf(current) + n + ORDER.length) % ORDER.length]);

document.querySelectorAll(".hz").forEach((z) => {
  let pressTimer = null;
  z.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (z.dataset.hz === "next") step(1);
    if (z.dataset.hz === "prev") step(-1);
    if (z.dataset.hz === "home") pressTimer = setTimeout(goHome, 1500);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => z.addEventListener(ev, () => clearTimeout(pressTimer)));
});
document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (["1", "2", "3", "4"].includes(k)) manual(ORDER[+k - 1]);
  else if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); step(1); }
  else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); step(-1); }
});
document.addEventListener("gesturestart", (e) => e.preventDefault());

/* ---------- Démarrage ---------- */
async function keepAwake() { try { if ("wakeLock" in navigator) await navigator.wakeLock.request("screen"); } catch {} }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && started) keepAwake(); });
async function start() {
  $("startBtn").textContent = "Un instant…";
  await loadAudio();
  if (ctx.state === "suspended") await ctx.resume();
  const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
  if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); }
  started = true; keepAwake();
  if (pending) show(pending.state, { ecran: pending.ecran }); else show(current, { ecran: currentEcran });
  pending = null;
  $("start").classList.add("hide");
  $("startBtn").textContent = "Toucher pour commencer";
}
function goHome() { started = false; hush(); $("start").classList.remove("hide"); }
$("startBtn").addEventListener("click", start);

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- Outils de test (console du navigateur) ----------
   ChezSoi.moment("soir")   → forcer matin | jour | soir | nuit (null = vraie heure)
   ChezSoi.simuler({ mode: "rappel", titre: "Vos cachets du soir", texte: "Ils sont dans le pilulier.",
                     voix: "Agnès, c'est l'heure de vos cachets du soir.", bouton: null, depuis: Date.now() }) */
window.ChezSoi = {
  moment: (m) => { forced = m || null; tick(); },
  simuler: (ecran) => onDoc({ ...(foyer || {}), profil: { prenom: names.senior, proche: names.proche }, borne: { ecran } }, false),
};

show("calm", { ecran: calmEcran() });
tick();
initSync();
