# PROMPT — Implementazione Architettura Multi-Tenant RAMSYS

> **Versione**: 2026-06-15  
> **Documento di riferimento**: `proposta di architecttura.md`  
> **Progetto**: WebOne / RAMSYS (P2604)  
> **Sorgente attiva**: `WebOne/` (backend: `backend_webbone/`, frontend: `frontend_webbone/`)

---

## ISTRUZIONE PER L'AI AGENTE (copia e incolla questo testo)

Sei un AI agente che deve **implementare end-to-end** la nuova architettura multi-tenant descritta in `proposta di architecttura.md`.

### Obiettivo

Trasformare il modello dati attuale:

```
Client → Product → File
```

nel modello target:

```
Client → Project → System → File
                └── SystemModule ← ModuleDefinition (catalogo moduli)
```

Con **provisioning riservato al solo ruolo `superadmin`** (adts-superuser): quote progetti/sistemi, creazione entità, abilitazione moduli.

---

## Vincoli non negoziabili

1. **Multi-tenancy**: DB condiviso, isolamento per riga (`clientId` o ereditato via join). Nessun DB per cliente.
2. **Quote N/X**: enforceate nel **service layer backend**, non solo in UI.
   - `Client.maxProjects` = numero massimo progetti per cliente
   - `Project.maxSystems` = numero massimo sistemi per progetto
3. **Provisioning solo superadmin**: creazione/modifica/eliminazione di Client (quote), Project, System, SystemModule.
4. **Admin/cliente operativi**: possono usare upload, visualizzazione, report **solo** su risorse già allocate e moduli abilitati.
5. **Moduli**: catalogo globale `ModuleDefinition` + junction `SystemModule`. **Vietate** colonne booleane tipo `hasCorrugation`.
6. **Filesystem speculare al DB**:
   ```
   /uploads/{clientFolder}/{projectSlug}/{systemSlug}/{moduleCode}/
     config/
     manuals/
     upload/
   ```
   Il path **non** viene accettato dal client: si calcola lato server dal DB.
7. **Migrazione backward-safe**: i dati esistenti (`Product`, `File.productId`) devono essere migrati senza perdita.
8. **Stack invariato**: Node.js + Express 5 + Prisma + MySQL (dev) / PostgreSQL (prod), React 19 + Vite 6 + Tailwind.
9. **i18n**: ogni nuova label UI via `t('chiave')` in `frontend_webbone/src/i18n.js` (it, en, zh).
10. **Log agentico**: aggiorna `.agent_specs_log.md` a fine ogni fase completata.

---

## Contesto codebase attuale

| Elemento | Path |
|----------|------|
| Schema Prisma | `WebOne/backend_webbone/prisma/schema.prisma` |
| Seed | `WebOne/backend_webbone/prisma/seed.js` |
| Middleware auth | `WebOne/backend_webbone/src/middlewares/` |
| Controller file | `WebOne/backend_webbone/src/controllers/file.controller.js` |
| Controller product (legacy) | `WebOne/backend_webbone/src/controllers/product.controller.js` |
| Routes admin | `WebOne/backend_webbone/src/routes/admin.js` |
| Frontend routing | `WebOne/frontend_webbone/src/App.jsx` |
| Sidebar / navigazione | `WebOne/frontend_webbone/src/components/Sidebar.jsx` |
| Pagine admin clienti | `WebOne/frontend_webbone/src/pages/AdminClientsPage.jsx` |
| Pagine admin prodotti (legacy) | `WebOne/frontend_webbone/src/pages/AdminProductsPage.jsx`, `ProductsPage.jsx` |
| Specifiche complete | `docs/specifiche_implementative.md` |

**Ruoli utente attuali**: `superadmin` | `admin` | `cliente`

---

## Catalogo moduli iniziale (seed)

Popolare `ModuleDefinition` con almeno:

| code | name | routePrefix |
|------|------|-------------|
| `TRACK_GEOMETRY` | Track Geometry | `/visualizer/track-geometry` |
| `CORRUGATION` | Corrugation | `/visualizer/corrugation` |
| `TUNNEL_SCAN` | Tunnel Scan | `/visualizer/tunnel-scan` |
| `OVERHEAD_LINE` | Overhead Line | `/visualizer/overhead-line` |
| `CONTACTLESS` | Contactless (UT/EC/Laser) | `/visualizer/contactless` |

Estendibile senza migration schema aggiuntive.

---

## FASE 1 — Database e migration

### Task

1. Estendere `schema.prisma`:
   - Aggiungere `maxProjects`, `status` su `Client`
   - Creare modelli: `Project`, `System`, `ModuleDefinition`, `SystemModule`, `ProvisioningAudit`
   - Modificare `File`: `productId` → `systemId`, aggiungere `moduleCode` opzionale
   - Mantenere temporaneamente `Product` (deprecato) fino a fine Fase 6

2. Scrivere migration Prisma (`npx prisma migrate dev --name multi_tenant_hierarchy`)

3. Script seed/migration dati:
   - Per ogni `Client` esistente: creare `Project` default (`slug: "default"`, `name: "Default"`, `maxSystems` = count prodotti migrati o quota impostata)
   - Per ogni `Product`: creare `System` equivalente sotto il progetto default
   - Copiare relazioni `File.productId` → `File.systemId`
   - Impostare `Client.maxProjects` coerente con i progetti creati

4. Seed `ModuleDefinition` con catalogo iniziale

### Acceptance criteria Fase 1

- [ ] `npx prisma migrate dev` esegue senza errori
- [ ] Ogni `File` legacy ha un `systemId` valido
- [ ] Seed moduli presente nel DB
- [ ] Nessun record orfano

---

## FASE 2 — Backend: provisioning superadmin

### Task

1. Creare service layer:
   - `src/services/provisioning.service.js` — logica quote, CRUD Project/System, enable/disable moduli
   - `src/services/audit.service.js` — scrittura `ProvisioningAudit`

2. Creare controller e routes (prefisso `/api/admin/`):
   ```
   PUT    /admin/clients/:id/quota          { maxProjects }
   POST   /admin/clients/:id/projects       { name, slug, maxSystems }
   PUT    /admin/projects/:id/quota         { maxSystems }
   PUT    /admin/projects/:id               { name, status }
   DELETE /admin/projects/:id               (soft delete se ci sono file)
   POST   /admin/projects/:id/systems       { name, slug, lineName, kmStart, kmEnd }
   PUT    /admin/systems/:id                { name, status, lineName, ... }
   DELETE /admin/systems/:id
   PUT    /admin/systems/:id/modules        { modules: [{ moduleCode, enabled, configJson }] }
   GET    /admin/module-definitions
   ```

3. Middleware:
   - `requireSuperAdmin` su tutte le route provisioning
   - Verifica quote **prima** di INSERT:
     ```javascript
     if (await countProjects(clientId) >= client.maxProjects) throw QuotaExceeded(403)
     if (await countSystems(projectId) >= project.maxSystems) throw QuotaExceeded(403)
     ```

4. Alla creazione Project/System:
   - Generare slug URL-safe se omesso
   - Creare cartelle filesystem sotto `UPLOAD_DIR`
   - Scrivere riga `ProvisioningAudit`

### Acceptance criteria Fase 2

- [ ] Superadmin può creare progetto fino a quota; oltre quota → HTTP 403 con messaggio chiaro
- [ ] Admin/cliente che tentano POST provisioning → HTTP 403
- [ ] Ogni azione provisioning tracciata in `ProvisioningAudit`
- [ ] Cartelle create automaticamente al provisioning

---

## FASE 3 — Backend: middleware operativo e context API

### Task

1. Middleware `resolveTenant`:
   - Estrae `clientId` dal JWT
   - Superadmin: può impersonare/switchare client via header opzionale `X-Client-Id` (solo superadmin)

2. Middleware `requireSystemAccess(systemId)`:
   - Verifica che `System → Project → Client.clientId` corrisponda al tenant dell'utente
   - Superadmin bypass

3. Middleware `requireModule(moduleCode)`:
   - Verifica `SystemModule.enabled = true` per `(systemId, moduleCode)`

4. Endpoint operativo:
   ```
   GET /api/me/context
   ```
   Risposta JSON:
   ```json
   {
     "client": { "id", "name", "folderName" },
     "projects": [{
       "id", "name", "slug",
       "systems": [{
         "id", "name", "slug", "lineName",
         "modules": [{ "code", "name", "routePrefix", "enabled" }]
       }]
     }]
   }
   ```
   Filtrato per ruolo/tenant.

5. Refactor `file.controller.js`:
   - Upload richiede `systemId` + `moduleCode`
   - Path calcolato server-side, mai da body client
   - Lista file: `GET /api/systems/:systemId/files?module=TRACK_GEOMETRY`

### Acceptance criteria Fase 3

- [ ] Utente cliente A non accede a systemId di cliente B (403)
- [ ] Upload su modulo non abilitato → 403
- [ ] `GET /me/context` restituisce albero corretto per ogni ruolo
- [ ] Test manuale con superadmin + admin + cliente

---

## FASE 4 — Frontend: UI provisioning (superadmin)

### Task

1. Nuove pagine admin (o estensione `AdminClientsPage.jsx`):
   - **ClientDetail**: quota `maxProjects`, lista progetti
   - **ProjectDetail**: quota `maxSystems`, lista sistemi, CRUD
   - **SystemDetail**: metadati linea ferroviaria + pannello moduli (toggle enable + configJson editor base)

2. Route protette: solo `role === 'superadmin'`

3. Feedback UX:
   - Badge quota: `"2 / 5 progetti"`, `"1 / 3 sistemi"`
   - Disabilitare pulsante "Aggiungi" quando quota esaurita
   - Conferma prima di delete

4. i18n: aggiungere chiavi per tutte le label nuove

### Acceptance criteria Fase 4

- [ ] Superadmin gestisce intera gerarchia da UI
- [ ] Admin/cliente non vedono menu provisioning
- [ ] Quote visualizzate e rispettate in UI (allineate al backend)

---

## FASE 5 — Frontend: context operativo cliente

### Task

1. Creare `ContextProvider` (React Context o Zustand):
   - Stato: `{ projectId, systemId, moduleCode }`
   - Persistenza sessione: `sessionStorage`
   - Caricamento iniziale da `GET /me/context`

2. Componente **ContextSelector** (header o sidebar):
   - Dropdown Progetto → Sistema
   - Visibile per admin e cliente

3. Refactor **Sidebar**:
   - Menu moduli generato dinamicamente dai moduli abilitati sul sistema selezionato
   - Nascondere route non abilitate

4. Refactor pagine operative:
   - `ClientFolderPage.jsx` → scoped a `systemId + moduleCode`
   - `DataVizualizer.jsx` → riceve context; route parametriche per modulo
   - `ProductsPage.jsx` / `ProductDetail.jsx` → deprecare o redirigere a System

5. Guard routing: se modulo non abilitato → redirect a dashboard con messaggio

### Acceptance criteria Fase 5

- [ ] Login cliente → selezione progetto/sistema → menu mostra solo moduli abilitati
- [ ] Cambio sistema aggiorna file list e navigazione
- [ ] Deep link a modulo disabilitato → bloccato

---

## FASE 6 — Cleanup legacy e documentazione

### Task

1. Rimuovere `Product` da schema Prisma (dopo verifica migrazione completa)
2. Eliminare/deprecare:
   - `product.controller.js`, route product
   - `AdminProductsPage.jsx`, `ProductsPage.jsx`, `ProductDetail.jsx`
3. Aggiornare `docs/specifiche_implementative.md` sezione schema DB e gerarchia
4. Aggiornare `WebOne/README.md` con nuova gerarchia
5. Entry in `.agent_specs_log.md`

### Acceptance criteria Fase 6

- [ ] Zero riferimenti a `Product` nel codice attivo
- [ ] Build frontend `npm run build` OK
- [ ] Backend avvia senza errori
- [ ] Documentazione allineata

---

## Schema Prisma target (riferimento rapido)

Vedi schema completo in `proposta di architecttura.md`. Modelli chiave:

- `Client.maxProjects`
- `Project.maxSystems`, `@@unique([clientId, slug])`
- `System`, `@@unique([projectId, slug])`
- `ModuleDefinition.code` (unique)
- `SystemModule` (composite PK `[systemId, moduleId]`)
- `File.systemId`, `File.moduleCode`
- `ProvisioningAudit`

---

## Regole RBAC riepilogo

| Azione | superadmin | admin | cliente |
|--------|:----------:|:-----:|:-------:|
| Impostare quote client/progetto | ✅ | ❌ | ❌ |
| Creare/eliminare Project | ✅ | ❌ | ❌ |
| Creare/eliminare System | ✅ | ❌ | ❌ |
| Abilitare/disabilitare moduli | ✅ | ❌ | ❌ |
| Gestire utenti/gruppi client | ✅ | ✅ (proprio client) | ❌ |
| Upload file | ✅ | ✅ | ✅ |
| Visualizzare dati/moduli abilitati | ✅ | ✅ | ✅ |

---

## Test plan minimo

1. **Quota progetti**: client con `maxProjects=2` → terzo progetto rifiutato (API + UI)
2. **Quota sistemi**: project con `maxSystems=1` → secondo sistema rifiutato
3. **Isolamento tenant**: token cliente A → GET systemId cliente B → 403
4. **Module gate**: sistema senza `CORRUGATION` → upload/visualizer corrugation → 403
5. **Context API**: risposta coerente con DB e moduli abilitati
6. **Migrazione**: file pre-esistenti accessibili dopo migration sotto System default
7. **Audit**: ogni operazione provisioning ha riga in `ProvisioningAudit`

---

## Ordine di esecuzione obbligatorio

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
```

Non saltare fasi. Non rimuovere `Product` prima della Fase 6.

---

## Note operative per l'agente

- **Path locale**: se Node.js fallisce su Google Drive, copiare `WebOne/` su path locale (es. `D:\004_Software\WebOne\`) come da `WebOne/PROMPT_RIAVVIO_PROGETTO.md`
- **Convenzioni codice**: seguire stile esistente in controller/middleware/pages; diff minimi per file non correlati
- **Errori HTTP**: usare codici semantici — `403 QuotaExceeded`, `403 ModuleNotEnabled`, `403 TenantMismatch`, `404 NotFound`
- **Soft delete**: preferire `status = 'inactive'` su Project/System con file associati, invece di DELETE fisico
- **Slug**: generare da `name` con normalizzazione `[a-z0-9-]`, univoco per scope parent

---

## Definition of Done (intero prompt)

L'implementazione è completa quando:

1. Gerarchia `Client → Project → System → Module` funzionante in DB, API e UI
2. Quote enforceate backend-side
3. Provisioning esclusivo superadmin
4. Cliente naviga progetto → sistema → moduli abilitati
5. File storage allineato al path speculare
6. Dati legacy migrati
7. `Product` rimosso
8. `.agent_specs_log.md` aggiornato
9. Build e smoke test OK
