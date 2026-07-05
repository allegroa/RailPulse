# Log Collector Server

Un'applicazione leggera per raccogliere e visualizzare log da fonti esterne.

## Come usarlo

1. Installa le dipendenze (già fatto):
   \`\`\`bash
   npm install
   \`\`\`

2. Avvia il server:
   \`\`\`bash
   node server.js
   \`\`\`
   Il server si avvierà sulla porta 3000. Puoi aprire \`http://localhost:3000\` per vedere la dashboard dei log.

## Come inviare log

Invia una richiesta HTTP \`POST\` all'indirizzo \`/api/logs\`.
Il server accetta dati in formato JSON.
Campi consigliati (ma opzionali): \`source\`, \`level\`. Tutto il resto verrà salvato nel \`payload\`.

Esempio con \`curl\`:
\`\`\`bash
curl -X POST http://localhost:3000/api/logs \\
     -H "Content-Type: application/json" \\
     -d '{"source": "My App", "level": "error", "message": "Connessione fallita", "code": 500}'
\`\`\`

## Esposizione all'esterno (Consigliato: Cloudflare Tunnels)

Per rendere la tua applicazione visibile su internet in modo **sicuro e gratuito**, senza dover aprire porte sul router o configurare indirizzi IP dinamici, ti consiglio di usare **Cloudflare Tunnels**.

### Passaggi per installare Cloudflare Tunnels sul Raspberry:
1. Crea un account gratuito su [Cloudflare Zero Trust](https://dash.cloudflare.com/?to=/:account/zero-trust).
2. Vai su **Access > Tunnels** e clicca su **Create a tunnel**.
3. Scegli il connettore "Cloudflared" e dagli un nome (es. \`rpi-logs\`).
4. Scegli il sistema operativo (Debian/Ubuntu per il Raspberry) e copia il comando di installazione che ti viene fornito.
5. Incolla quel comando nel terminale del Raspberry.
6. Una volta connesso, nella pagina successiva di Cloudflare configura il percorso (Route):
   - **Public Hostname:** Scegli il dominio e sottodominio che vuoi usare (es. \`logs.tuodominio.com\`).
   - **Service:** Scegli \`HTTP\` e metti \`localhost:3000\`.
7. Salva! Ora il tuo Log Collector sarà raggiungibile ovunque su internet all'indirizzo che hai scelto, in modo sicuro (con HTTPS automatico).
