# Specifiche Taipei Scaffold (`/webone/taipei`)

## 1. Architettura Attuale

La pagina Taipei Scaffold funge da editor interattivo per la mappa della metropolitana e la topologia dei nodi (stazioni).

- **Frontend Integrato**: La rotta `/webone/taipei` nel frontend principale embedda un iframe che punta alla route statica del backend: `http://localhost:5000/taipei_static/index.html`.
- **Core Engine**: Il motore grafico è un'applicazione standalone basata su D3.js (`backend_webbone/public/taipei/app.js`).
- **Storage Dati**: I dati principali (oggetti `STATIONS` e `LINES`) sono attualmente **hardcoded** all'interno di `app.js`.
- **Sistema di Salvataggio (Hybrid)**:
  - Il frontend salva ogni modifica (trascinamento nodi, modifica metadati) nel `localStorage` del browser.
  - Al termine di un trascinamento (drag), viene effettuata una chiamata POST a `/api/taipei/save-station`.
  - Il backend intercetta la POST, aggiorna `DATABASE/Taipei/stations.json` e tenta di modificare **direttamente il file sorgente `app.js`** tramite un'espressione regolare (`replace`), incrementando la variabile `DB_VERSION`.

## 2. Analisi del Problema: "I nodi non si salvano e risultano spostati"

L'anomalia per cui le coordinate vengono perse o i nodi risultano spostati (soprattutto cambiando browser o svuotando la cache) è causata da molteplici difetti nel sistema di salvataggio ibrido:

### A. Fallimento Silenzioso della RegEx
Il backend usa la seguente espressione regolare per aggiornare le coordinate in `app.js`:
`const pattern = new RegExp(\`(${id}\\s*:\\s*\\{.*?)x:\\d+,\\s*y:\\d+(.*?\\})\`, 'g');`
Questa regex prevede solo interi positivi (`\d+`). Se un nodo viene trascinato a coordinate negative o se il file viene formattato in modo diverso (es. spazi aggiuntivi o coordinate decimali), la regex **non trova alcuna corrispondenza**. Il file `app.js` non viene aggiornato, ma il server risponde con successo.

### B. Conflitto con il LocalStorage
Quando il backend riesce ad aggiornare `app.js`, incrementa la variabile `DB_VERSION`.
Al successivo ricaricamento della pagina, il frontend nota che la `DB_VERSION` del file è superiore a quella nel `localStorage` (`isOutdated = true`) e avvia una logica di "upgrade":
Prende le coordinate X/Y dal `localStorage` e le unisce ai dati appena scaricati da `app.js`.
Tuttavia, questa logica ignora eventuali salvataggi falliti. Se l'utente cambia PC, il `localStorage` è vuoto e si affida ad `app.js` (che potrebbe non essere stato aggiornato a causa del bug A, ripristinando le vecchie coordinate e vanificando il lavoro).

### C. Desincronizzazione ID e Metadati
L'interfaccia permette di rinominare l'ID di una stazione e modificarne i metadati (Nome, Linea). Queste modifiche **chiamano solo il salvataggio su `localStorage`** e non avvisano il backend.
Se l'ID viene cambiato (es. da `R28` a `R28X`), la successiva operazione di trascinamento invierà al backend il nuovo ID `R28X`. Il backend cercherà `R28X` nel file `app.js` tramite regex, non lo troverà (perché nel file sorgente è rimasto `R28`) e fallirà silenziosamente l'aggiornamento.

## 3. Direttive per la Soluzione

Per rendere il sistema affidabile, l'architettura deve abbandonare l'approccio ibrido e adottare un modello Client-Server standard:

1. **Decoupling dei Dati**: I dati `STATIONS` e `LINES` non devono più essere hardcoded all'interno di `app.js`.
2. **Fetch Iniziale**: All'avvio, `app.js` deve caricare i dati delle stazioni interrogando un endpoint GET del backend (es. `/api/taipei/stations`), il quale leggerà dal file ufficiale `DATABASE/Taipei/stations.json`.
3. **Salvataggio Unificato**: Ogni modifica (spostamento X/Y, rinomina ID, modifica metadati) deve essere inviata al backend, che aggiornerà il file JSON. Non ci sarà più bisogno di modificare il codice sorgente di `app.js` tramite RegExp.
4. **Rimozione LocalStorage**: Rimuovere l'uso del `localStorage` come fonte di verità per la topologia persistente. La singola fonte di verità deve essere il backend (`stations.json`).
