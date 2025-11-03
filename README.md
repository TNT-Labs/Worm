# 🐛 Worm Day: Galactic Glutton

Un remake in stile arcade del classico Snake, ambientato nello spazio. Guida il tuo verme intergalattico attraverso un campo di asteroidi e meteore, raccogliendo potenziamenti e scalando la classifica.

## 🔧 Correzioni Bug v2.0

### Bug Risolti

1. **✅ Suono "eat" mancante** - Aggiunto playSound('eat') quando il verme mangia
2. **✅ Alert bloccante** - Sostituito con notifica animata non bloccante
3. **✅ Caricamento risorse migliorato** - Gestione errori robusta con fallback
4. **✅ Controllo risorse audio** - Implementato check corretto con try-catch
5. **✅ Meteore posizionate meglio** - Migliore algoritmo di generazione sicura
6. **✅ Service Worker ottimizzato** - Gestione cache migliorata con risorse opzionali
7. **✅ Encoding HTML corretto** - Emoji visualizzate correttamente
8. **✅ Indicatore Power-up** - Barra di progresso visiva per durata power-up
9. **✅ Limite particelle** - MAX_PARTICLES = 200 per evitare lag
10. **✅ Controllo velocità minima** - MIN_GAME_SPEED = 50ms per evitare velocità eccessive
11. **✅ Resize migliorato** - Considera anche l'altezza dello schermo
12. **✅ Tastiera maiuscole** - Supporto per W/A/S/D maiuscole
13. **✅ Prevenzione scroll** - preventDefault su touch events
14. **✅ Race condition fix** - Flag resourcesLoaded per controllare stato caricamento

---

## 🚀 Novità Principali

* **Effetti Visivi Esplosivi:** Particelle dinamiche al Game Over e alla raccolta di cibo
* **Meteore Mobili:** Nuovi ostacoli che si muovono attraverso lo schermo
* **Buffer di Input:** Controlli precisi e reattivi (previene il "doppio input")
* **Indicatore Power-up:** Barra visiva che mostra la durata rimanente dei potenziamenti
* **Notifiche Level-up:** Animazioni fluide invece di alert bloccanti
* **Audio Robusto:** Gestione errori per risorse audio mancanti

---

## 🎮 Come si Gioca

L'obiettivo è guidare il verme intergalattico (la testa luminosa) per mangiare le **stelle gialle** (⭐). Ogni stella ti fa crescere e aumenta il tuo punteggio.

### Controlli

| Metodo | Tasto/Azione | Funzione |
| :--- | :--- | :--- |
| **Tastiera** | Frecce o `W`, `A`, `S`, `D` | Muovi il verme |
| **Touch/Mobile** | **Swipe** sul canvas di gioco | Controlli direzionali |
| **Pulsanti** | **Pulsanti D-Pad** in HTML | Controlli direzionali |

### Modalità di Gioco

* **Difficoltà Adattiva:** La velocità del verme aumenta gradualmente ogni **3 stelle** raccolte
* **Livelli:** Ogni **10 punti**, si avanza al livello successivo, aumentando il numero di asteroidi fissi e introducendo **nuove meteore mobili**

---

## ⚠️ Ostacoli e Power-Up

### Ostacoli Intergalattici

| Elemento | Aspetto | Effetto |
| :--- | :--- | :--- |
| **Asteroide Fisso** | Quadrato Grigio Scuro | Collisione = **Game Over** (a meno che lo scudo sia attivo) |
| **Meteora Mobile** | Quadrato Arancione | Si muovono diagonalmente o in linea retta. Collisione = **Game Over** (a meno che lo scudo sia attivo) |
| **Teletrasporto** | Bordi del Canvas | Il verme riappare sul lato opposto quando esce dai bordi |

### Potenziamenti Temporanei

I Power-up compaiono casualmente sulla griglia.

| Power-up | Colore | Durata | Effetto |
| :--- | :--- | :--- | :--- |
| **Scudo** 🛡️ | Azzurro/Ciano | 50 cicli | Rende il verme invulnerabile a collisioni |
| **Boost Velocità** ⚡ | Rosso | 30 cicli | Raddoppia la velocità di gioco |
| **Rallentamento** 🐌 | Verde | 40 cicli | Dimezza la velocità di gioco |

---

## 📊 Classifica Locale

Il gioco utilizza `localStorage` per salvare i **5 punteggi più alti** direttamente nel tuo browser. Se raggiungi un punteggio sufficientemente alto, avrai l'opportunità di inserire le tue iniziali e stabilire un record.

---

## ⚙️ Struttura del Progetto

Il gioco è costruito utilizzando JavaScript puro, HTML e CSS, concentrandosi sull'uso dell'elemento Canvas.

* **`index.html`**: Struttura base del gioco e interfaccia utente
* **`style.css`**: Styling visivo, incluso lo sfondo spaziale
* **`script.js`**: Contiene l'intera logica di gioco:
    * Ciclo di gioco (`update` e `draw`)
    * Gestione della difficoltà e dei livelli
    * Logica di collisione e Power-up
    * **Sistema di Particelle** (`createParticles`)
    * Gestione del **Buffer di Input** (`directionChanged`)
    * Funzioni di salvataggio e visualizzazione della Classifica
    * **Indicatore Power-up** con barra di progresso
* **`sw.js`**: Service Worker per funzionalità PWA offline
* **`manifest.json`**: Configurazione PWA

---

## 📁 Struttura Cartelle Necessaria

```
worm-day/
├── index.html
├── style.css
├── script.js
├── sw.js
├── manifest.json
├── assets/
│   ├── images/
│   │   ├── worm_head.png
│   │   ├── worm_body.png
│   │   ├── star_food.png
│   │   ├── asteroids_static.png
│   │   ├── meteor_mobile.png
│   │   ├── powerup_shield.png
│   │   ├── powerup_speed.png
│   │   └── powerup_slow.png
│   └── audio/
│       ├── sfx_eat.mp3
│       ├── sfx_game_over.mp3
│       └── bgm_loop.mp3
└── images/
    ├── icon-192x192.png
    └── icon-512x512.png
```

**Nota:** Il gioco funziona anche senza le risorse multimediali (immagini e audio). Verranno usati fallback grafici e il gioco continuerà senza suoni se i file audio non sono disponibili.

---

## 🚀 Installazione e Avvio

1. Clona o scarica il repository
2. (Opzionale) Aggiungi le risorse multimediali nelle cartelle `assets/images/` e `assets/audio/`
3. Apri `index.html` in un browser moderno
4. Per testare come PWA, usa un server locale:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server -p 8000
   ```
5. Visita `http://localhost:8000`

---

## 🎯 Caratteristiche Tecniche

* **Canvas API** per rendering 2D
* **Web Audio API** per effetti sonori e musica
* **LocalStorage** per persistenza punteggi
* **Service Worker** per funzionalità offline (PWA)
* **Touch Events** per controlli mobile
* **Sistema di particelle** per feedback visivo
* **Gestione errori robusta** per risorse mancanti
* **Responsive design** che si adatta a vari schermi

---

## 🐛 Bug Noti (Risolti)

Tutti i bug principali sono stati risolti nella versione 2.0. Se trovi nuovi problemi, segnalali!

---

## 📝 License

Progetto educativo open-source. Sentiti libero di modificare e migliorare!

---

## 🎮 Buon Divertimento!

Raggiungi il punteggio più alto e domina la classifica! 🏆
