# Chez Soi – la borne (iPad)

## 1. Config
`config.js` already contains the team Firebase config. Only change it if the project changes.

## 2. Put it online
1. https://app.netlify.com/drop → drag this whole folder.
2. On the iPad, open the link in **Safari** → Share → **Add to Home Screen**.
3. Open it once while online (fonts, voices and Firebase get cached for offline use).
After any change to `config.js`: drag the folder again onto the same Netlify site (Deploys tab).

## 3. What the borne listens to (`foyers/demo`, team spec)
- `borne.ecran.mode`: `calme` · `rappel` · `urgence` · `fait`
- `titre` / `texte`: shown as-is. Only "Bonjour…" and "Bonne journée." adapt to the time of day
  (Bonjour / Bon après-midi / Bonsoir / Bonne nuit, and Bonne soirée / Bonne nuit).
- `voix`: read once when `depuis` changes; `null` = silent.
- `bouton`: shown only if `showButton: true` in config.js (team choice: no button). If on, a tap
  marks the medicine as taken (same effect as priseConfirmee, source "borne").
- Case 7: if the console hasn't put the screen back to `calme` 11 s after `fait`, the borne does it
  itself (`autoRetourCalme`), with the next appointment from `agenda`.
- The borne also writes `borne.enLigne` and `borne.dernierSignal` every 20 s.

## 4. Voice (recorded, natural)
These exact sentences play the recorded voice; anything else is read by the iPad's French voice:
- Agnès, c'est l'heure de vos cachets du matin / du midi / du soir.
- Agnès, n'oubliez pas vos cachets du matin / du midi / du soir.
- Pierre va vous appeler.

## 5. Time of day
The calm screen follows the real time: morning (rising sun), day (sun high), evening (sunset),
night (dark background, moon and stars). For the demo you can force one with `forcerMoment` in
config.js, or from a laptop console: `ChezSoi.moment("soir")`.

## 6. Hidden controls (work without network, change the iPad only)
- Top-right corner: next state · Top-left corner: previous state
- Long-press bottom-left corner (1.5 s): back to the start screen
- Bluetooth keyboard/clicker: `1`–`4`, arrows, space
Test from a laptop console: `ChezSoi.simuler({ mode: "rappel", titre: "Vos cachets du soir", texte: "", voix: "…", depuis: Date.now() })`

## 7. Before going on stage
Brightness max · Auto-Lock off · volume up / Bluetooth speaker · tap **Toucher pour commencer** (unlocks sound) ·
Guided Access on · one rehearsal with Wi-Fi off.
Status dot (bottom-right): green = synced · orange = offline · grey = no Firebase key.
