# Come comunicare con il Log Collector

Questo documento spiega come un'altra applicazione (scritta in qualsiasi linguaggio) può trasmettere e ricevere dati dal Log Collector in esecuzione sul Raspberry Pi all'indirizzo **`192.168.1.144`**.

Il Log Collector comunica tramite semplici richieste HTTP (API REST) e utilizza il formato JSON.

---

## 1. Trasmettere dati al Log Collector (Inviare un log)

Per inviare un log, la tua applicazione deve effettuare una richiesta **HTTP POST** all'endpoint:
`http://192.168.1.144:3000/api/logs`

Puoi inviare qualsiasi dato strutturato in formato JSON nel corpo (body) della richiesta. Il server è progettato per accettare campi dinamici, ma ti consigliamo di usare sempre almeno i seguenti:
- `source`: Il nome dell'applicazione o del modulo che sta inviando il log.
- `level`: Il livello del log (es. `info`, `warn`, `error`).
- *Tutti gli altri campi personalizzati* finiranno automaticamente raggruppati all'interno della colonna "payload".

### Esempio in cURL (Terminale)
```bash
curl -X POST http://192.168.1.144:3000/api/logs \
     -H "Content-Type: application/json" \
     -d '{
           "source": "App Client", 
           "level": "error", 
           "message": "Connessione fallita", 
           "code": 500,
           "dettagli": "Timeout dopo 30 secondi"
         }'
```

### Esempio in Python (Libreria requests)
```python
import requests

url = "http://192.168.1.144:3000/api/logs"
data = {
    "source": "Python App",
    "level": "info",
    "message": "Script avviato correttamente"
}

response = requests.post(url, json=data)
if response.status_code == 201:
    print("Log salvato con successo!")
```

### Esempio in JavaScript/Node.js (Fetch API)
```javascript
fetch("http://192.168.1.144:3000/api/logs", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        source: "WebApp",
        level: "warn",
        azione_utente: "click_invalido"
    })
});
```

---

## 2. Ricevere dati dal Log Collector (Leggere i log)

Se desideri che un'altra applicazione legga i log salvati, basta effettuare una richiesta **HTTP GET** all'endpoint:
`http://192.168.1.144:3000/api/logs`

Il server risponderà con un array JSON contenente gli ultimi 100 log in ordine cronologico inverso (dal più recente al più vecchio). Puoi anche specificare il parametro `limit` nell'URL per riceverne un numero diverso (es. `?limit=50`).

### Esempio in cURL
```bash
curl -X GET http://192.168.1.144:3000/api/logs?limit=5
```

### Esempio in Python
```python
import requests

url = "http://192.168.1.144:3000/api/logs"
response = requests.get(url)

if response.status_code == 200:
    logs = response.json()
    for log in logs:
        print(f"[{log['timestamp']}] {log['source']} ({log['level']}): {log['payload']}")
```

### Formato della Risposta (JSON)
L'applicazione riceverà una lista di oggetti con questa struttura:
```json
[
  {
    "id": 15,
    "timestamp": "2026-07-04T17:45:00.000Z",
    "source": "App Client",
    "level": "error",
    "payload": "{\"message\":\"Connessione fallita\",\"code\":500,\"dettagli\":\"Timeout dopo 30 secondi\"}"
  }
]
```
*(Nota che il campo `payload` viene restituito come stringa JSON, quindi potrebbe essere necessario decodificarlo lato client, ad es. con `json.loads(log['payload'])` in Python).*
