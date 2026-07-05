##PROMPT DIFETTI PER SEZIONE 
##SPECIFICHE VISUALIZZAZIONE DIFETTI PER SEZIONE (EN 13231-3)

## OBIETTIVO E NORMATIVA
- Conformemente alla normativa **EN 13231-3**, è necessario rappresentare visivamente la qualità della linea ferroviaria suddividendola in sezioni di lunghezza definita.

## LOGICA DI SUDDIVISIONE E CALCOLO GRAVITÀ
- **Lunghezza Sezione:** La linea deve essere suddivisa in blocchi predefiniti da **200m** (valore parametrizzabile e modificabile dall'utente).
- **Indice di Gravità:** Ogni blocco di `n` metri deve riportare un valore di gravità espresso in **percentuale (%)**.
- **Calcolo della Gravità:** La percentuale di gravità è determinata dalla somma (o incidenza) dei difetti rilevati all'interno della specifica sezione di linea.

## REQUISITI DI INTERFACCIA (UI/UX)
- **Posizionamento:** Al di sotto della card contenente il grafico principale dei dati.
- **Visualizzazione:** Inserire una card rettangolare (Heatmap / Bar-chart orizzontale), segmentata in blocchi corrispondenti alle sezioni calcolate.
- **Asse X (Ascissa):** Al di sotto della Heatmap, implementare un'ascissa che riporti l'etichetta chilometrica (formato ferroviario) in corrispondenza di ogni segmento.
- **Linee di Riferimento:** Separare visivamente i blocchi con linee verticali tratteggiate in corrispondenza degli stacchi chilometrici (es. ogni 200m).
- **Informazioni per Blocco:** Ogni segmento deve mostrare chiaramente la **percentuale di gravità** calcolata per quella tratta.
- **Colorazione:** Implementare una scala cromatica (es. verde-giallo-rosso) associata al valore percentuale per un'immediata percezione visiva delle aree critiche.
- **Interattività:** Includere tooltip al passaggio del mouse (hover) per visualizzare il range chilometrico esatto (KM start/end) e il dettaglio numerico dei difetti nella sezione.
