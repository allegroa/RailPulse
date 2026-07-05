# SPECIFICHE TABELLA DEI DIFETTI E TOLLERANZE (EN 13231-3)

## LOGICA DI CALCOLO DEI DIFETTI
- **Raggruppamento:** Un difetto è definito come una sequenza ininterrotta di punti in cui il valore misurato (in modulo) supera la soglia (Threshold) impostata per quello specifico canale.
- La sezione di difetto inizia al primo punto fuori soglia e termina all'ultimo punto consecutivo prima che il valore rientri nei limiti della tolleranza.

## COLONNE OBBLIGATORIE:
- **#**: Numero sequenziale identificativo del difetto.
- **KM start**: Inizio della sezione difettosa in km (formato ferroviario es. 12+345 o decimale).
- **KM end**: Fine della sezione difettosa in km.
- **Threshold**: Soglia prestabilita per il difetto (valore di tolleranza).
- **Max defect**: Valore massimo (picco assoluto) rilevato all'interno della sezione difettosa.
- **Priority A (Intensità)**: Calcolata come percentuale di superamento della soglia: `((Max defect - Threshold) / Threshold) * 100`. Indica la gravità del picco.
- **Priority B (Estensione)**: *[Da definire nel dettaglio]* Misura l'estensione del difetto rispetto a una sezione di riferimento (es. percentuale di punti fuori soglia rispetto ai punti totali in una finestra mobile di 200m). Attualmente, raggruppando solo i punti anomali, è fissa al 100%.
- **Description / Channel**: Canale di misurazione o descrizione testuale del difetto (es. Allineamento_Destro).
- **PDF**: Campo boolean/checkbox per selezionare le righe da includere nell'esportazione PDF.
- **Validated**: Checkbox per la convalidazione manuale del difetto da parte dell'operatore.

## CRITERI DI VISUALIZZAZIONE E FILTRAGGIO:
- Mostrare **SOLO** i difetti che superano la soglia.
- Ordinamento predefinito per **Priority A (Intensità)** in ordine decrescente (dal più grave al meno grave).
- Possibilità di ordinare per KM Start o per Max defect.
- Funzionalità di **Raggruppamento** per tipo di difetto / canale.
- Filtri per canale, ricerca testuale e toggle per isolare le righe selezionate (Solo PDF).

## FUNZIONALITÀ DI OUTPUT ED EXPORT:
- **CSV / Excel**: Esportazione tabellare dei dati attualmente filtrati.
- **PDF**: Stampa di un report formattato e impaginato, contenente unicamente le righe con il checkbox PDF spuntato.
- **Riepilogo Numerico**: Contatore dinamico dei difetti totali rilevati, di quelli filtrati e di quelli selezionati per l'esportazione.