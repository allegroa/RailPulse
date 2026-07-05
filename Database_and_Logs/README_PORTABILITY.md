# Ripristino del Progetto (Portabilità Totale)

Questo progetto è stato configurato per essere completamente indipendente dal disco locale originale.

## Struttura della Cartella
- **`WebOne/`**: Contiene l'intero codice sorgente (Frontend e Backend).
- **`Database_and_Logs/Database/`**: Contiene i file fisici InnoDB grezzi di MySQL dal server originale.
- **`Database_and_Logs/webone_dump.sql`**: Il dump completo del database. (Metodo Consigliato per il ripristino).
- **`Database_and_Logs/Logs/`**: Contiene la cronologia delle conversazioni e i log dell'agente AI.

## Istruzioni per ripristinare il Database su un nuovo PC
1. Installa **XAMPP** sul nuovo PC e avvia il modulo MySQL.
2. Apri phpMyAdmin o la riga di comando MySQL e crea un database vuoto chiamato `webone`.
3. Importa il file `webone_dump.sql` all'interno del nuovo database `webone`.
4. (Opzionale) Se non vuoi usare il dump SQL, puoi provare a sostituire l'intera cartella `C:\xampp\mysql\data\webone` con quella fornita nella sottocartella `Database`, ma il metodo SQL è molto più sicuro per InnoDB.

Il progetto continuerà a connettersi al database locale tramite `mysql://root:@localhost:3306/webone`, senza richiedere modifiche ai percorsi assoluti.
