# 🐛 Worm Day: Galactic Glutton

Un remake in stile arcade del classico gioco Snake (o "verme") ambientato nello spazio, con l'aggiunta di asteroidi fissi, meteore mobili, power-up temporanei e una classifica locale. L'obiettivo è mangiare quante più stelle possibili senza scontrarsi con gli ostacoli o con il proprio corpo.



## 🎮 Come si Gioca

L'obiettivo è guidare il verme intergalattico (la testa luminosa) per mangiare le **stelle gialle** (`⭐`). Ogni stella ti fa crescere e aumenta il tuo punteggio.

### Controlli

| Metodo | Tasto/Azione | Funzione |
| :--- | :--- | :--- |
| **Tastiera** | `Freccia Su` / `W` | Muovi Su |
| | `Freccia Giù` / `S` | Muovi Giù |
| | `Freccia Sinistra` / `A` | Muovi Sinistra |
| | `Freccia Destra` / `D` | Muovi Destra |
| **Touch/Mobile** | **Swipe** sul canvas di gioco | Muove il verme nella direzione dello swipe |
| **Pulsanti** | **Pulsanti D-Pad** in HTML | Controlli direzionali |

### Modalità di Gioco

* **Difficoltà Adattiva:** La velocità del verme aumenta gradualmente ogni **3 stelle** raccolte.
* **Livelli:** Ogni **10 punti**, si avanza al livello successivo, aumentando il numero di asteroidi fissi e introducendo **nuove meteore mobili**.

## 🚀 Elementi di Gioco e Ostacoli

| Elemento | Aspetto | Effetto |
| :--- | :--- | :--- |
| **Cibo** | Cerchio Giallo (`⭐`) | Aumenta il punteggio e la lunghezza del verme. |
| **Asteroide Fisso** | Quadrato Grigio Scuro | Collisione = **Game Over** (a meno che lo scudo sia attivo). |
| **Meteora Mobile** | Quadrato Arancione (Mobili) | Si muovono attraverso lo schermo. Collisione = **Game Over** (a meno che lo scudo sia attivo). |
| **Teletrasporto** | Bordi del Canvas | Il verme riappare sul lato opposto quando esce dai bordi. |

### Power-Up (Spawn casuale)

| Power-up | Colore | Durata | Effetto |
| :--- | :--- | :--- | :--- |
| **Scudo** | Azzurro/Ciano | 50 update cicli | Rende il verme invulnerabile a collisioni (Asteroidi/Meteore/Se Stesso). |
| **Boost Velocità** | Rosso | 30 update cicli | Raddoppia la velocità di gioco. |
| **Rallentamento** | Verde | 40 update cicli | Dimezza la velocità di gioco. |

## 📊 Classifica Locale

Il gioco implementa una **Classifica Locale** (Leaderboard) che salva i 5 punteggi più alti nel tuo browser utilizzando `localStorage`.

* Al Game Over, se il tuo punteggio è sufficientemente alto (entra nella Top 5), ti verrà chiesto di inserire le tue iniziali per salvare il record.

## ⚙️ Struttura del Progetto

Il gioco è costruito utilizzando puro JavaScript, HTML e CSS, concentrandosi sull'uso dell'elemento Canvas per il rendering.

* **`index.html`**: Contiene la struttura del gioco, il canvas, i controlli D-Pad e le sezioni di Game Over/Classifica.
* **`style.css`**: Contiene lo styling del layout e l'aspetto grafico degli elementi non-canvas.
* **`script.js`**: Contiene tutta la logica di gioco, inclusi il ciclo `update`, la gestione delle collisioni, i Power-up, la logica dei livelli e la gestione della `localStorage` per la classifica.

### Punti Chiave di `script.js`

1.  **Rendering:** Tutte le entità (stelle, verme, ostacoli) sono disegnate sul Canvas in `draw()`.
2.  **Logica:** La funzione `update()` gestisce il movimento, la collisione (incluse le collisioni delle meteore con `Math.floor()`) e gli stati dei Power-up.
3.  **Difficoltà:** La difficoltà è regolata da due funzioni principali:
    * `calculateAsteroidCount()`: Aumenta gli ostacoli fissi ad ogni livello.
    * `generateMeteors()`: Aggiunge una meteora mobile extra ad ogni livello.
