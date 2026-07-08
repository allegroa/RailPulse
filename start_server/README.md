# Start Server Manager

Questa cartella contiene una GUI Python per avviare e fermare i server WebOne in modo centralizzato.

## Esecuzione

- Da Windows: doppio clic su run_manager.bat
- Oppure da terminale:
  - py -3 start_server_manager.py
  - py -3 start_server_manager.py --validate

## Funzionalità incluse

- Selezione profilo ADTS o RMT Home
- Avvio/stop del backend, GenConfig e frontend
- Avvio sequenziale di tutti i moduli
- Log integrato e pulizia log
- Chiusura pulita di tutti i processi al termine dell'applicazione
