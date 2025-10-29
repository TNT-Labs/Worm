# 🪐 Worm Day: The Space Snake PWA

**Worm Day** è una Progressive Web App (PWA) ispirata al classico gioco Snake, ma ambientata nello spazio. Guida il tuo verme spaziale attraverso il cosmo, fallo crescere mangiando stelle e fai attenzione a non toccare la tua coda!

Questo progetto è sviluppato in HTML, CSS e JavaScript puro, e utilizza i Service Worker per garantire l'installazione e il funzionamento offline.

## ✨ Caratteristiche Implementate

* **Progressive Web App (PWA):** Installabile su dispositivi mobili e desktop.
* **Funzionamento Offline:** Grazie al Service Worker, il gioco è completamente utilizzabile anche senza connessione internet.
* **High Score Locale:** Il punteggio più alto viene salvato nel browser utilizzando `localStorage`.
* **Velocità Adattiva:** Il gioco accelera progressivamente man mano che il punteggio aumenta, aumentando la difficoltà.
* **Gestione Game Over:** Schermata modale personalizzata e non bloccante per la fine del gioco e il riavvio.
* **Controlli:** Supporto per tastiera (frecce) e pulsanti virtuali per dispositivi mobili.

## 🛠️ Struttura del Progetto

Il progetto è composto dai seguenti file:

| File | Descrizione |
| :--- | :--- |
| `index.html` | La struttura principale della pagina web, contenente il `canvas` e la schermata di Game Over. |
| `style.css` | Definizioni di stile, inclusi i layout "spaziali" e l'aspetto della schermata modale. |
| `script.js` | La logica di gioco principale (movimento del verme, collisioni, punteggio, velocità, High Score). |
| `manifest.json` | Definisce come la PWA appare all'utente (icone, nome, colori del tema, ecc.). **(Non fornito, ma necessario)** |
| `sw.js` | Il Service Worker che gestisce la cache e il funzionamento offline. **(Non fornito, ma necessario)** |
| `images/` | Cartella che conterrà le icone della PWA (`icon-192x192.png`, ecc.). |

## 🚀 Come Eseguire il Gioco

Per eseguire e testare questo progetto, avrai bisogno di un server web locale, poiché i Service Worker e i moduli ES non funzionano correttamente quando si aprono i file direttamente dal disco (`file://`).

### Metodo 1: Usando Live Server (VS Code)

1.  Se usi Visual Studio Code, installa l'estensione **Live Server**.
2.  Clicca con il tasto destro su `index.html` e seleziona **"Open with Live Server"**.

### Metodo 2: Usando Python (Comando Rapido)

1.  Apri il tuo terminale o prompt dei comandi.
2.  Naviga nella cartella radice del progetto.
3.  Esegui il seguente comando (per Python 3):

    ```bash
    python -m http.server
    ```

4.  Apri il tuo browser all'indirizzo `http://localhost:8000`.

### Installazione della PWA

Dopo aver aperto il gioco tramite server locale, il tuo browser (es. Chrome, Edge) dovrebbe mostrarti un'icona **di installazione** (spesso un simbolo `+` o una freccia rivolta verso il basso) nella barra degli indirizzi o nel menu, che ti permetterà di installare "Worm Day" come app nativa sul tuo dispositivo.

## 🕹️ Comandi di Gioco

| Azione | Tasto (Desktop) | Pulsante (Mobile) |
| :--- | :--- | :--- |
| Muovi Su | `Freccia Su` (`ArrowUp`) | **Su** |
| Muovi Giù | `Freccia Giù` (`ArrowDown`) | **Giù** |
| Muovi Sinistra | `Freccia Sinistra` (`ArrowLeft`) | **Sinistra** |
| Muovi Destra | `Freccia Destra` (`ArrowRight`) | **Destra** |

## 💡 Prossimi Miglioramenti

* Implementazione dei **Controlli tramite Swipe** (scorrimento) per una migliore usabilità mobile.
* Aggiunta di **Ostacoli Spaziali Fissi** (Asteroidi) per aumentare la sfida.
* Miglioramenti grafici come lo **Sfondo Animato** (stelle che si muovono).
* Integrazione di **Audio ed Effetti Sonori** (SFX) per aumentare l'immersività.
