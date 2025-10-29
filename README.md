# 🪐 Worm Day: The Space Snake PWA

**Worm Day** è una Progressive Web App (PWA) ispirata al classico gioco Snake, ambientata in un cosmo pieno di pericoli. Guida il tuo verme spaziale, fallo crescere mangiando cibo, raccogli power-up e cerca di avanzare nei livelli evitando gli asteroidi e la tua coda.

Il progetto è sviluppato in HTML, CSS e JavaScript puro ed è ottimizzato per dispositivi mobili.

## ✨ Caratteristiche Implementate

* **Progressive Web App (PWA):** Installabile su dispositivi mobili e desktop.
* **Funzionamento Offline:** Il gioco è completamente utilizzabile anche senza connessione internet.
* **Sistema di Livelli:** Avanza di livello (ogni 10 punti) per affrontare un numero **crescente di Asteroidi Fissi**, aumentando la difficoltà progressivamente.
* **Power-up (Scudo Energetico):** Raccogli un raro power-up per ottenere **invulnerabilità temporanea** a collisioni e asteroidi.
* **Velocità Adattiva:** Il gioco accelera progressivamente man mano che il punteggio aumenta.
* **High Score Locale:** Il punteggio più alto viene salvato nel browser (`localStorage`).
* **Controlli Ottimizzati:** Supporto per tastiera (desktop) e **Controlli tramite Swipe (scorrimento)** per una migliore esperienza mobile.
* **Grafica Migliorata:**
    * **Sfondo Animato:** Effetto parallasse con stelle che simulano il movimento nello spazio.
    * **Testa Distintiva:** Indicatore visivo sulla testa del verme per mostrare la direzione.
* **Gestione Game Over:** Schermata modale personalizzata e non bloccante.

---

## 🛠️ Struttura del Progetto

| File | Descrizione |
| :--- | :--- |
| `index.html` | La struttura principale, contenente il `canvas` e la schermata di Game Over. |
| `style.css` | Definizioni di stile, inclusi gli stili spaziali e l'aspetto della schermata modale. |
| `script.js` | **Tutta la logica di gioco:** movimento, collisioni, punteggio, livelli, power-up e rendering grafico. Contiene anche la logica di **generazione sicura** degli elementi di gioco. |
| `manifest.json` | Definisce le proprietà di installazione della PWA (icone, nome, colori). |
| `sw.js` | Il Service Worker che gestisce la cache e il funzionamento offline. |

---

## 🚀 Come Eseguire il Gioco

Per eseguire e testare l'installazione PWA e le funzionalità offline, è necessario utilizzare un server web locale.

### Metodo Consigliato (VS Code)

1.  Installa l'estensione **Live Server** in Visual Studio Code.
2.  Clicca con il tasto destro su `index.html` e seleziona **"Open with Live Server"**.

### Installazione della PWA

Dopo aver aperto il gioco tramite server locale, il tuo browser mostrerà un'opzione (spesso un simbolo `+` o una freccia) nella barra degli indirizzi o nel menu per **installare** "Worm Day" come app nativa.

---

## 🕹️ Comandi di Gioco

| Azione | Controllo |
| :--- | :--- |
| **Muovi Verme** | Tasti freccia (Desktop) |
| **Muovi Verme** | Scorrimento (**Swipe**) sul canvas (Mobile) |

---

## 💡 Prossimi Miglioramenti

* Aggiungere **Audio ed Effetti Sonori (SFX)** per interazioni come mangiare, collisioni e raccolta di power-up.
* Implementare **Più Tipi di Power-up** (es. Iper-velocità, Punti Bonus).
