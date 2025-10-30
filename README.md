# 🐛 Worm Day: Galactic Glutton

Un remake in stile arcade del classico Snake, ambientato nello spazio. Guida il tuo verme intergalattico attraverso un campo di asteroidi e meteore, raccogliendo potenziamenti e scalando la classifica.



## 🚀 Novità Principali

* **Effetti Visivi Esplosivi:** Particelle dinamiche al Game Over e alla raccolta di cibo per un feedback visivo immediato e spettacolare.
* **Meteore Mobili:** Nuovi ostacoli che si muovono attraverso lo schermo.
* **Giocabilità Migliorata:** Implementato un **Buffer di Input** per garantire controlli precisi e reattivi, specialmente alle alte velocità (previene il "doppio input").

---

## 🎮 Come si Gioca

L'obiettivo è guidare il verme intergalattico (la testa luminosa) per mangiare le **stelle gialle** (`⭐`). Ogni stella ti fa crescere e aumenta il tuo punteggio.

### Controlli

| Metodo | Tasto/Azione | Funzione |
| :--- | :--- | :--- |
| **Tastiera** | Frecce o `W`, `A`, `S`, `D` | Muovi il verme |
| **Touch/Mobile** | **Swipe** sul canvas di gioco | Controlli direzionali |
| **Pulsanti** | **Pulsanti D-Pad** in HTML | Controlli direzionali |

### Modalità di Gioco

* **Difficoltà Adattiva:** La velocità del verme aumenta gradualmente ogni **3 stelle** raccolte.
* **Livelli:** Ogni **10 punti**, si avanza al livello successivo, aumentando il numero di asteroidi fissi e introducendo **nuove meteore mobili**.

---

## ⚠️ Ostacoli e Power-Up

### Ostacoli Intergalattici

| Elemento | Aspetto | Effetto |
| :--- | :--- | :--- |
| **Asteroide Fisso** | Quadrato Grigio Scuro | Collisione = **Game Over** (a meno che lo scudo sia attivo). |
| **Meteora Mobile** | Quadrato Arancione | Si muovono diagonalmente o in linea retta. Collisione = **Game Over** (a meno che lo scudo sia attivo). |
| **Teletrasporto** | Bordi del Canvas | Il verme riappare sul lato opposto quando esce dai bordi. |

### Potenziamenti Temporanei

I Power-up compaiono casualmente sulla griglia.

| Power-up | Colore | Durata | Effetto |
| :--- | :--- | :--- | :--- |
| **Scudo** | Azzurro/Ciano | 50 update cicli | Rende il verme invulnerabile a collisioni (Ostacoli/Se Stesso). |
| **Boost Velocità** | Rosso | 30 update cicli | Raddoppia la velocità di gioco. |
| **Rallentamento** | Verde | 40 update cicli | Dimezza la velocità di gioco. |

---

## 📊 Classifica Locale

Il gioco utilizza `localStorage` per salvare i **5 punteggi più alti** direttamente nel tuo browser. Se raggiungi un punteggio sufficientemente alto, avrai l'opportunità di inserire le tue iniziali e stabilire un record.

---

## ⚙️ Struttura del Progetto

Il gioco è costruito utilizzando JavaScript puro, HTML e CSS, concentrandosi sull'uso dell'elemento Canvas.

* **`index.html`**: Struttura base del gioco e interfaccia utente.
* **`style.css`**: Styling visivo, incluso lo sfondo spaziale.
* **`script.js`**: Contiene l'intera logica di gioco:
    * Ciclo di gioco (`update` e `draw`).
    * Gestione della difficoltà e dei livelli.
    * Logica di collisione e Power-up.
    * **Sistema di Particelle** (`createParticles`).
    * Gestione del **Buffer di Input** (`directionChanged`).
    * Funzioni di salvataggio e visualizzazione della Classifica.
