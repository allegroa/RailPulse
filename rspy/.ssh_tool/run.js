const { Client } = require('ssh2');
const fs = require('fs');

let command = process.argv[2];
if (!command) {
    command = fs.readFileSync(0, 'utf-8'); // Read from stdin
}

if (!command) {
    console.error('Nessun comando fornito');
    process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
    conn.exec(command, (err, stream) => {
        if (err) {
            console.error('Errore esecuzione comando:', err);
            conn.end();
            process.exit(1);
        }
        
        stream.on('close', (code, signal) => {
            conn.end();
            process.exit(code || 0);
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).on('error', (err) => {
    console.error('Errore di connessione:', err);
    process.exit(1);
}).connect({
    host: '192.168.1.144',
    port: 22,
    username: 'user',
    password: 'user',
    readyTimeout: 10000
});
