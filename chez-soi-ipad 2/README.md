# Chez Soi – la borne (iPad)

Demo version: **front end only**. There is no server and no Firebase. Everything on screen comes from
`config.js`, or from the page address (handy for screenshots and marketing videos).

## 1. Open it (no hosting needed)
**Double-click `index.html`.** It opens in your browser and works as is.
To skip the start screen, add `?direct=1` to the end of the address, e.g.
`file:///…/chez-soi-ipad 2/index.html?direct=1&heure=10h35`

Opened like this you get no sound (browsers block audio files from a file). Every screen looks the same.
To get sound, run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

### Take a screenshot the size of an iPad (Chrome)
1. Open the page, then press `Cmd+Option+I` (Mac) or `F12` (Windows).
2. Click the phone/tablet icon at the top left of the panel (or press `Cmd+Shift+M`).
3. At the top, choose **iPad Air** (or type 1180 × 820). Use the rotate icon for landscape.
4. Click the `⋮` menu in that top bar, then **Capture screenshot**. The PNG goes to your Downloads.

Ready-made screenshots are in the `screenshots/` folder (iPad Air, retina size).

## 2. The 4 screens
| Screen | Shows | Address |
|---|---|---|
| Home (`calme`) | Greeting, big clock, date, **the next thing to do**, weather in the corner | `?etat=calme` |
| Reminder (`rappel`) | "Vos cachets du matin" + spoken caption | `?etat=rappel` |
| Loved one told (`urgence`) | "Pierre va vous appeler" | `?etat=urgence` |
| Done (`fait`) | "Merci Agnès" | `?etat=fait` |

### Home screen
- One soft-coloured card (no icon): the **next** booking only, e.g. "À 10h30, dans 1 h · L'infirmière passe".
  Up to 15 min after it starts it says "Maintenant". When the day is done: "Tout est fait".
- Weather: one icon and the temperature, top right. At night the sun becomes a moon.

Change the bookings and the weather in `config.js` (`agenda` and `meteo`).
Booking types (they set the card colour): `cachets`, `infirmiere`, `medecin`, `repas`, `courses`, `appel`, `visite`, `coiffeur`, `marche`.

## 3. Address options (for screenshots and videos)
By default the clock starts at 9h30 (`heureDemo` in `config.js`; set it to `null` for the real time).
Add these to the address, joined with `&`:

| Option | Example | What it does |
|---|---|---|
| `direct=1` | `?direct=1` | Skip the "Toucher pour commencer" screen |
| `etat` | `etat=rappel` | Open on a screen and stay there (no auto-return) |
| `heure` | `heure=10h25` | Set the clock. Greeting, background and next booking follow |
| `meteo` | `meteo=pluie` | `soleil`, `eclaircies`, `nuages`, `pluie`, `neige` |
| `temp` | `temp=7` | Temperature |
| `moment` | `moment=nuit` | Force only the background: `matin`, `jour`, `soir`, `nuit` |
| `prenom`, `proche` | `prenom=Jeanne&proche=Luc` | Change the names (recorded voice only works for Agnès/Pierre) |

Good shots:
- Nurse in 1 hour: `?direct=1&heure=9h30`
- Nurse is here now: `?direct=1&heure=10h35&meteo=eclaircies`
- Pierre calls in 5 min, rainy: `?direct=1&heure=14h55&meteo=pluie`
- Evening pills soon: `?direct=1&heure=18h50&meteo=nuages`
- Night, all done: `?direct=1&heure=22h40&meteo=soleil`
- Pills reminder: `?direct=1&heure=9h00&etat=rappel`
- Pierre told: `?direct=1&heure=9h20&etat=urgence`
- Done: `?direct=1&heure=9h05&etat=fait`

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
