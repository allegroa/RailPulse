# Specifiche Modulo Invio Log (Debug)

Questo documento definisce le specifiche per il modulo responsabile dell'invio dei log di debug dell'applicazione al Log Collector remoto, in accordo con le regole definite in `rsp_come_spedire_msg.md`.

## 1. Configurazione e Connessione
- **Endpoint HTTP POST**: `http://192.168.1.144:3000/api/logs`
- **Metodo**: `POST`
- **Header**: `Content-Type: application/json`

## 2. Struttura del Messaggio

Tutti i messaggi inviati al server remoto devono avere il livello impostato fisso a `"debug"`.
Il payload JSON inviato deve contenere le seguenti informazioni:

- `source`: Il nome dell'applicazione o del modulo (es. `"track_web"`).
- `level`: Sempre `"debug"`.
- `timestamp`: Data e ora in cui l'evento si è verificato.
- `ip`: L'indirizzo IP della macchina da cui viene inviato il log.
- `macchina`: Il nome (hostname) della macchina.
- `message`: Il testo descrittivo del messaggio di log.

### Esempio di Payload JSON
```json
{
  "source": "track_web",
  "level": "debug",
  "timestamp": "2026-07-04T23:55:00+02:00",
  "ip": "192.168.1.100",
  "macchina": "PC-Operatore-1",
  "message": "L'applicazione è stata accesa"
}
```
*(Nota: come da specifiche del server Log Collector, i campi custom come `timestamp`, `ip`, `macchina` e `message` finiranno automaticamente raggruppati all'interno della colonna "payload" nel database del server).*

## 3. Messaggi Obbligatori

Il modulo deve garantire, come requisito minimo, l'invio dei seguenti eventi relativi al ciclo di vita dell'applicazione:

1. **Avvio dell'applicazione**: Deve essere inviato un messaggio non appena l'applicazione è stata avviata ed è pronta all'uso.
   - *Esempio messaggio*: `"L'applicazione è stata accesa"`
2. **Spegnimento dell'applicazione**: Deve essere inviato un messaggio durante le operazioni di chiusura, prima che il processo venga terminato del tutto.
   - *Esempio messaggio*: `"L'applicazione è stata spenta"`

## 4. Espandibilità (Messaggi Aggiuntivi)

Di volta in volta verranno aggiunti ulteriori messaggi di debug sparsi per l'applicativo a seconda delle necessità. Questi messaggi seguiranno la medesima struttura, variando unicamente nel campo `message` (o inserendo ulteriori campi JSON se necessari in futuro) per tracciare specifiche funzioni o procedure.

## 5. Dettagli Implementativi

Nel progetto attuale (basato su Next.js / Node.js), il modulo è stato implementato in questo modo:

- **Libreria Core**: La funzione di invio (`sendRemoteDebugLog`) è definita all'interno di `src/lib/remoteLogger.js`. Questo script utilizza i moduli integrati di Node (`os`) per determinare l'IP e il nome macchina, ed effettua la richiesta tramite `fetch`.
- **Integrazione Ciclo di Vita**: L'aggancio automatico per i log obbligatori è gestito tramite la funzionalità nativa di Next.js all'interno del file `src/instrumentation.js`:
  - **Avvio**: All'esecuzione della funzione `register()`, il messaggio di accensione viene sparato al Log Collector.
  - **Spegnimento**: Vengono intercettati i segnali di sistema di chiusura (`SIGINT`, `SIGTERM`) per intercettare lo stop manuale o di sistema del processo, assicurandosi di inviare il messaggio prima dell'uscita definitiva dal server.
