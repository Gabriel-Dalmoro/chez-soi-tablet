# Chez Soi – la borne (iPad)

Demo version: **front end only**. There is no server and no Firebase. Everything on screen comes from
`config.js`, or from the page address (handy for screenshots and marketing videos).

## 1. Run it
- On a laptop: `python3 -m http.server 8000` in this folder, then open http://localhost:8000
- On an iPad: drag this folder onto https://app.netlify.com/drop, open the link in **Safari** →
  Share → **Add to Home Screen**.

## 2. The 4 screens
| Screen | Shows | Address |
|---|---|---|
| Home (`calme`) | Big clock, date, greeting, **weather card**, **today's bookings** | `?etat=calme` |
| Reminder (`rappel`) | "Vos cachets du matin" + spoken caption | `?etat=rappel` |
| Loved one told (`urgence`) | "Pierre va vous appeler" | `?etat=urgence` |
| Done (`fait`) | "Merci Agnès" | `?etat=fait` |

### Home screen
- **Aujourd'hui**: one line per booking: time, icon, title, small detail.
  - Past ones turn soft with a green tick.
  - The next one gets a dark frame and a tag: "Dans 1 h", "Dans 10 min".
  - One that has just started (up to 15 min) gets an orange "Maintenant" tag.
  - Top-right counter: "Encore 3 choses" / "Tout est fait".
  - The list never scrolls. If the screen is too small, finished items are hidden first.
- **Weather**: temperature, sky, max/min and a short tip ("Pensez au parapluie.").
  At night the sun becomes a moon.

Change the bookings and the weather in `config.js` (`agenda` and `meteo`).
Booking icons: `cachets`, `infirmiere`, `medecin`, `repas`, `courses`, `appel`, `visite`, `coiffeur`, `marche`.

## 3. Screenshots and videos (address options)
By default the clock starts at 9h30 (`heureDemo` in `config.js`; set it to `null` for the real time).
Add these to the address, joined with `&`:

| Option | Example | What it does |
|---|---|---|
| `direct=1` | `?direct=1` | Skip the "Toucher pour commencer" screen |
| `etat` | `etat=rappel` | Open on a screen and stay there (no auto-return) |
| `heure` | `heure=10h25` | Set the clock. Everything follows: greeting, background, bookings, "Dans …" |
| `meteo` | `meteo=pluie` | `soleil`, `eclaircies`, `nuages`, `pluie`, `neige` |
| `temp` | `temp=7` | Temperature |
| `moment` | `moment=nuit` | Force only the background: `matin`, `jour`, `soir`, `nuit` |
| `prenom`, `proche` | `prenom=Jeanne&proche=Luc` | Change the names (recorded voice only works for Agnès/Pierre) |

Good shots to grab:
- Morning, nurse coming: `?direct=1&heure=9h30`
- Nurse is here now: `?direct=1&heure=10h35&meteo=eclaircies`
- Evening, last pills soon: `?direct=1&heure=18h50`
- Night, all done: `?direct=1&heure=22h40&meteo=nuages`
- Pills reminder with caption: `?direct=1&heure=9h00&etat=rappel`
- Rainy afternoon (portrait): `?direct=1&heure=14h55&meteo=pluie`

Best sizes: 1180×820 (iPad Air, landscape), 1024×768, or portrait 820×1180.

## 4. Voice (recorded, natural)
Tap **Toucher pour commencer** first to unlock sound. These sentences play the recorded voice;
anything else is read by the iPad's French voice:
- Agnès, c'est l'heure de vos cachets du matin / du midi / du soir.
- Pierre va vous appeler.

## 5. Hidden controls
- Top-right corner: next screen · Top-left corner: previous screen
- Long-press bottom-left corner (1.5 s): back to the start screen
- Keyboard / clicker: `1`–`4`, arrows, space
- Browser console: `ChezSoi.heure("15h00")`, `ChezSoi.moment("soir")`, `ChezSoi.ecran("rappel")`
