/* Chez Soi – la borne (tablette d'Agnès)
   Version démo, 100 % locale : pas de serveur, tout vient de config.js (ou de l'adresse, pour les captures).
   4 écrans : calm (accueil) · remind (rappel) · alert (proche prévenu) · done (c'est fait)
   Commandes cachées : coins de l'écran, clavier 1–4 / flèches / espace. */

const C = window.CGM_CONFIG;
const Q = new URLSearchParams(location.search);
const ORDER = ["calm", "remind", "alert", "done"];
const FROM_PARAM = { calme: "calm", accueil: "calm", rappel: "remind", urgence: "alert", proche: "alert", fait: "done" };
const $ = (id) => document.getElementById(id);
const app = $("app");

let names = { senior: Q.get("prenom") || C.names.senior, proche: Q.get("proche") || C.names.proche };
let current = "calm";
let started = false;
let doneTimer = null;
const hold = Q.has("etat");          // capture d'écran : on reste sur l'écran demandé

/* ---------- Heure (vraie ou de démo) ---------- */
const parseHeure = (s) => { const m = /^(\d{1,2})\s*[h:]\s*(\d{0,2})$/i.exec((s || "").trim()); return m ? [+m[1], +(m[2] || 0)] : null; };
const atToday = ([h, m]) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime(); };
let offset = 0;
function setHeure(s) { const hm = parseHeure(s); offset = hm ? atToday(hm) - Date.now() : 0; }
setHeure(Q.get("heure") || C.heureDemo);
const now = () => Date.now() + offset;

let forced = Q.get("moment") || C.forcerMoment || null;
const REF_HOUR = { matin: 9, jour: 14, soir: 19, nuit: 23 };
const realHour = () => new Date(now()).getHours();
const hour = () => forced ? REF_HOUR[forced] : realHour();
const phase = () => { const h = hour(); return h >= 6 && h < 11 ? "matin" : h < 17 && h >= 11 ? "jour" : h < 21 && h >= 17 ? "soir" : "nuit"; };
const salut = () => { const h = hour(); return h >= 5 && h < 12 ? "Bonjour" : h >= 12 && h < 18 ? "Bon après-midi" : h >= 18 && h < 22 ? "Bonsoir" : "Bonne nuit"; };
const auRevoir = () => { const p = phase(); return p === "soir" ? "Bonne soirée." : p === "nuit" ? "Bonne nuit." : "Bonne journée."; };
const libelleMoment = () => { const h = hour(); return h < 11 ? "matin" : h < 16 ? "midi" : "soir"; };
const hhmm = (t = now()) => { const d = new Date(t); return `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`; };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const today = () => { const d = new Date(now()); return `<b>${cap(d.toLocaleDateString("fr-FR", { weekday: "long" }))}</b>${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`; };

/* ---------- Icônes ---------- */
const svg = (inner, vb = "0 0 24 24") => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
const ICONS = {
  cachets:    '<g transform="rotate(-40 12 12)"><rect x="3" y="8.5" width="18" height="7" rx="3.5"/><path d="M12 8.5v7"/></g>',
  infirmiere: '<path d="M12 5v14M5 12h14" stroke-width="3.4"/>',
  medecin:    '<path d="M20.4 5.1a5 5 0 0 0-7.1 0L12 6.4l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 20.6l8.4-8.4a5 5 0 0 0 0-7.1z"/>',
  repas:      '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.2 0-3.5 3-3.5 6.5S15 13.5 17 13.5"/>',
  appel:      '<path d="M21 16.5v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.4 10.8a16 16 0 0 0 4.8 4.8l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  coiffeur:   '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  marche:     '<path d="M12 22v-7"/><path d="M12 15c-4 0-6.5-3-6.5-6.5a6.5 6.5 0 0 1 13 0C18.5 12 16 15 12 15z"/>',
  visite:     '<path d="M3.5 10.5L12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  courses:    '<path d="M5 8h14l-1.3 12.2a1 1 0 0 1-1 .8H7.3a1 1 0 0 1-1-.8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
};
const CHECK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>');

const SUN   = '<g class="w-sun"><circle cx="32" cy="32" r="11"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4.2 4.2M44.8 44.8L49 49M15 49l4.2-4.2M44.8 19.2L49 15"/></g>';
const MOON  = '<path class="w-moon" d="M40 12a20 20 0 1 0 12 30A16 16 0 0 1 40 12z"/>';
const CLOUD = (y = 0, cls = "w-cloud") => `<path class="${cls}" transform="translate(0 ${y})" d="M20 50h26a10 10 0 0 0 0-20 14 14 0 0 0-27-2A11 11 0 0 0 20 50z"/>`;
const WEATHER = {
  soleil:     { label: "Grand soleil", art: (n) => n ? MOON : SUN,  tip: "Une petite veste suffit." },
  eclaircies: { label: "Éclaircies",   art: (n) => `<g transform="translate(10 -8) scale(.75)">${n ? MOON : SUN}</g>` + CLOUD(4), tip: "Prenez un gilet si vous sortez." },
  nuages:     { label: "Nuageux",      art: () => `<g transform="translate(8 -10) scale(.7)">${CLOUD(0, "w-cloud2")}</g>` + CLOUD(4), tip: "Un temps calme pour sortir." },
  pluie:      { label: "Pluie",        art: () => CLOUD(-6) + '<path class="w-drop" d="M24 50l-3 7M34 50l-3 7M44 50l-3 7"/>', tip: "Pensez au parapluie." },
  neige:      { label: "Neige",        art: () => CLOUD(-6) + '<g class="w-snow"><circle cx="23" cy="54" r="2.4"/><circle cx="33" cy="58" r="2.4"/><circle cx="43" cy="54" r="2.4"/></g>', tip: "Restez au chaud, ça glisse dehors." },
};

/* ---------- Météo ---------- */
function renderWeather() {
  const m = { ...C.meteo };
  if (Q.get("meteo")) m.ciel = Q.get("meteo");
  if (Q.get("temp")) m.temp = +Q.get("temp");
  if (Q.get("ville")) m.ville = Q.get("ville");
  const w = WEATHER[m.ciel] || WEATHER.soleil;
  const night = phase() === "nuit";
  $("weatherIcon").innerHTML = svg(w.art(night), "0 0 64 64");
  $("weatherTemp").textContent = `${Math.round(m.temp)}°`;
  $("weatherSky").textContent = night && m.ciel === "soleil" ? "Ciel dégagé" : w.label;
  $("weatherRange").textContent = night ? `Cette nuit ${m.min}°` : `Max ${m.max}° · Min ${m.min}°`;
  $("weatherTip").textContent = m.conseil || (night ? "Bonne nuit, au chaud." : w.tip);
  app.dataset.sky = m.ciel;
}

/* ---------- La journée ---------- */
const MAX_ROWS = 5;
const SOON_MIN = 15;     // « Maintenant » : jusqu'à 15 min après l'heure du rendez-vous
function duree(min) {
  if (min < 60) return `Dans ${min} min`;
  const h = Math.floor(min / 60), r = min % 60;
  return r ? `Dans ${h} h ${String(r).padStart(2, "0")}` : `Dans ${h} h`;
}
function agenda() {
  return (C.agenda || [])
    .map((r) => ({ ...r, t: atToday(parseHeure(r.heure) || [0, 0]) }))
    .sort((a, b) => a.t - b.t);
}
function renderDay() {
  const list = agenda(), t = now();
  const past = (r) => r.t + SOON_MIN * 60000 < t;
  const firstOpen = list.findIndex((r) => !past(r));
  const nextIdx = list.findIndex((r) => r.t > t);
  const start = Math.max(0, Math.min((firstOpen < 0 ? list.length : firstOpen) - 1, list.length - MAX_ROWS));
  const rows = list.slice(start, start + MAX_ROWS);

  $("dayList").innerHTML = rows.map((r) => {
    const i = list.indexOf(r);
    const isPast = past(r), isNow = !isPast && r.t <= t, isNext = i === nextIdx;
    const cls = isPast ? "is-past" : isNow ? "is-now" : isNext ? "is-next" : "";
    const chip = isPast ? ""
               : isNow  ? `<span class="chip chip-now">Maintenant</span>`
               : isNext ? `<span class="chip chip-next">${duree(Math.round((r.t - t) / 60000))}</span>` : "";
    return `<li class="row ${cls}" data-icone="${r.icone || ""}">
      <span class="row-time">${hhmm(r.t)}</span>
      <span class="row-icon">${isPast ? CHECK : svg(ICONS[r.icone] || ICONS.visite)}</span>
      <span class="row-text"><span class="row-title">${r.titre}</span>${r.detail ? `<span class="row-detail">${r.detail}</span>` : ""}</span>
      ${chip}
    </li>`;
  }).join("");
  fitRows();
  const left = list.filter((r) => !past(r)).length;
  $("dayCount").textContent = !list.length ? "" : left === 0 ? "Tout est fait" : left === 1 ? "Encore 1 chose" : `Encore ${left} choses`;
  $("dayEmpty").hidden = list.length > 0;
}

/* Jamais de défilement : si l'écran est trop petit, on garde les lignes qui tiennent. */
function fitRows() {
  const box = $("dayList"); if (!box.offsetParent) return;
  const bottom = box.getBoundingClientRect().bottom + 1;
  const over = () => box.lastElementChild && box.lastElementChild.getBoundingClientRect().bottom > bottom;
  while (box.children.length > 2 && over()) {          // d'abord ce qui est déjà fait, puis la fin de journée
    const first = box.firstElementChild;
    (first.classList.contains("is-past") ? first : box.lastElementChild).remove();
  }
}

/* ---------- Affichage ---------- */
function texts(state) {
  const S = names.senior, P = names.proche, m = libelleMoment();
  return {
    calm:   { titre: `${salut()} ${S}`, texte: "", voix: null },
    remind: { titre: `Vos cachets du ${m}`, texte: "Ils sont dans le pilulier.", voix: `${S}, c'est l'heure de vos cachets du ${m}.` },
    alert:  { titre: `${P} va vous appeler`, texte: `Pour vos cachets du ${m}.`, voix: `${P} va vous appeler.` },
    done:   { titre: `Merci ${S}`, texte: auRevoir(), voix: null },
  }[state];
}

function render(state) {
  const d = texts(state);
  if (state === "calm")   { $("hello").textContent = d.titre; renderWeather(); renderDay(); }
  if (state === "remind") { $("remindTitle").textContent = d.titre; $("remindBody").textContent = d.texte; }
  if (state === "alert")  { $("alertTitle").textContent = d.titre;  $("alertBody").textContent = d.texte; }
  if (state === "done")   { $("doneTitle").textContent = d.titre;   $("doneBody").textContent = d.texte; }
  $("initial").textContent = names.proche.charAt(0).toUpperCase();
  $("topTime").textContent = hhmm();
}

function tick() {
  $("clock").textContent = hhmm();
  $("date").innerHTML = today();
  app.dataset.phase = phase();
  render(current);
}
setInterval(tick, 15000);

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

/* Les phrases enregistrées avec la voix douce. */
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
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
  if (!text) return;
  const chime = state === "remind" || state === "alert";
  const delay = chime ? 1.1 : 0.4;
  let dur = 4;
  if (started) {
    if (ctx && ctx.state === "suspended") ctx.resume();
    if (chime) playFile("chime");
    const file = recorded()[norm(text)];
    dur = (C.voice.mode !== "synthese" && file && playFile(file, delay)) || synth(text, delay);
  }
  clearTimeout(captionTimer);
  $("captionText").textContent = `« ${text.trim()} »`;
  setTimeout(() => $("caption").classList.add("on"), delay * 1000);
  if (!hold) captionTimer = setTimeout(() => $("caption").classList.remove("on"), (delay + dur + 0.8) * 1000);
}
function hush() { clearTimeout(captionTimer); $("caption").classList.remove("on"); if ("speechSynthesis" in window) speechSynthesis.cancel(); }

/* ---------- Changer d'écran ---------- */
function show(state, { voix = false } = {}) {
  if (!ORDER.includes(state)) return;
  current = state;
  app.dataset.state = state;
  app.dataset.phase = phase();
  render(state);
  hush();
  clearTimeout(doneTimer);
  if (voix) speak(state, texts(state).voix);
  if (state === "done" && !hold) doneTimer = setTimeout(() => show("calm"), C.doneReturnsToCalmAfterMs);
}

/* ---------- Commandes cachées ---------- */
const manual = (state) => show(state, { voix: true });
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
  $("start").classList.add("hide");
  $("startBtn").textContent = "Toucher pour commencer";
}
function goHome() { started = false; hush(); $("start").classList.remove("hide"); }
$("startBtn").addEventListener("click", start);

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- Outils (console du navigateur) ----------
   ChezSoi.moment("soir")    → forcer le fond : matin | jour | soir | nuit (null = selon l'heure)
   ChezSoi.heure("15h00")    → régler l'horloge de démo (null = vraie heure)
   ChezSoi.ecran("rappel")   → calme | rappel | urgence | fait */
window.ChezSoi = {
  moment: (m) => { forced = m || null; tick(); },
  heure: (h) => { setHeure(h); tick(); },
  ecran: (e) => manual(FROM_PARAM[e] || e),
};

const skipStart = Q.get("direct") === "1" || C.ecranDemarrage === false;
if (skipStart) $("start").classList.add("hide");
const first = FROM_PARAM[Q.get("etat")] || "calm";
tick();
if (document.fonts) document.fonts.ready.then(() => render(current));   // re-mesure avec la vraie police
show(first, { voix: hold && first !== "calm" });
