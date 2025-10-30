# Worm Day: The Space Snake PWA

**Worm Day** è una Progressive Web App (PWA) che rivisita il classico gioco Snake in un'ambientazione spaziale, con l'aggiunta di asteroidi fissi e diversi Power-up per rendere il gameplay più dinamico.

Il gioco è completamente **responsivo** e ottimizzato per l'utilizzo su desktop e dispositivi mobili (smartphone).

## 🚀 Caratteristiche Principali

* **Gameplay Classico:** Muovi il verme per mangiare il cibo e crescere.
* **Pericoli Spaziali:** Evita gli asteroidi fissi sparsi sulla griglia.
* **Velocità Adattiva:** La velocità aumenta progressivamente man mano che il punteggio cresce.
* **Livelli:** Aumenta il livello e affronta un numero maggiore di asteroidi.
* **Teletrasporto:** Se il verme raggiunge un bordo, riappare sul lato opposto.
* **PWA Ready:** Può essere installato come applicazione nativa sul dispositivo (richiede i file `manifest.json` e `sw.js`).
* **Responsivo:** Ottimizzato per adattarsi a qualsiasi dimensione di schermo.

## ✨ Nuove Funzionalità e Power-up

Sono stati aggiunti tre Power-up che appaiono casualmente sul campo di gioco:

| Icona (Visiva) | Tipo di Power-up | Colore | Effetto | Durata (Approssimativa) |
| :--- | :--- | :--- | :--- | :--- |
| 🧊 | **Shield (Scudo)** | Ciano | Protegge il verme da una collisione con un asteroide o con se stesso, distruggendo l'ostacolo. | 50 tick |
| 🔴 | **Speed Boost (Accelerazione)** | Rosso | Raddoppia la velocità di movimento del verme. | 30 tick |
| 🟢 | **Slow Down (Rallentamento)** | Verde | Dimezza la velocità di movimento del gioco. | 40 tick |

## 🛠️ Struttura del Progetto

Il progetto si basa su HTML, CSS e JavaScript Vanilla.

| File | Descrizione |
| :--- | :--- |
| `index.html` | Contiene la struttura del gioco (canvas, schermata di Game Over, controlli) e il tag `viewport` fondamentale per la responsività. |
| `style.css` | Definisce lo stile, il layout **responsivo** del `body`, del `canvas` e dei controlli. |
| `script.js` | Contiene tutta la logica di gioco, inclusa la gestione dei Power-up, il movimento, le collisioni, la velocità adattiva e la funzione `resizeCanvas()` per il dimensionamento dinamico. |
| `manifest.json` | (Non incluso nel codice ma necessario per PWA) Definisce le proprietà di installazione della PWA. |
| `sw.js` | (Non incluso nel codice ma necessario per PWA) Service Worker per il caching e il funzionamento offline. |

## 📱 Controlli

Il gioco supporta l'input da tastiera e touch/swipe.

* **Desktop:** Utilizza i tasti freccia (↑, ↓, ←, →).
* **Mobile:**
    * Utilizza i **pulsanti direzionali** sotto il quadro di gioco.
    * Utilizza i gesti di **Swipe** sul canvas.

## ⚙️ Istruzioni per l'Esecuzione

1.  Clona o scarica la repository.
2.  Apri il file `index.html` nel tuo browser.
3.  Per eseguire il gioco in un ambiente locale PWA (per testare `manifest.json` e `sw.js`), è necessario utilizzare un server locale (ad esempio, con VS Code Live Server o un semplice server HTTP da linea di comando).
