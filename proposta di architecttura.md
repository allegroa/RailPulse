# Proposta di Architettura — RAMSYS / WebOne

> Gerarchia cliente: **Cliente → N Progetti → X Sistemi → Moduli abilitati**  
> Provisioning (quote, progetti, sistemi, moduli): solo **adts-superuser**

---

## Situazione attuale vs target

Oggi il DB ha `Client → Product → File`. Le specifiche descrivono invece `Client → Project → System → Files`, con moduli per sistema. **`Product` va considerato legacy e migrato a `System`**, con `Project` come livello intermedio nuovo.

---

## Approccio sistemistico consigliato

### 1. Multi-tenancy: DB condiviso + isolamento per riga

Per RAMSYS (pochi clienti enterprise, molti dati per cliente) la scelta più pratica è:

- **Un solo database MySQL/PostgreSQL**
- Ogni record “operativo” porta un `clientId` (o lo eredita via join)
- **Nessun DB separato per cliente** (costoso da gestire; utile solo con requisiti legali estremi)

Isolamento garantito da:

- middleware che risolve il tenant dal JWT (`clientId`)
- ogni query filtrata per tenant
- path filesystem derivato dal DB, mai costruito dal client

### 2. Due piani di controllo distinti

| Piano | Chi | Cosa fa |
|-------|-----|---------|
| **Provisioning** | solo `adts-superuser` | crea clienti, imposta quote N/X, crea progetti/sistemi, abilita moduli |
| **Operativo** | admin + cliente | usa ciò che è già allocato: upload, grafici, report |

Il superuser **non** “usa” i dati diagnostici: fa solo configurazione contrattuale. Admin/cliente **non** possono superare quote o creare progetti/sistemi.

### 3. Context a 3 livelli nel runtime

Dopo login, il frontend mantiene un contesto navigabile:

```
Cliente (fisso dal JWT)
  └── Progetto (selezione)
        └── Sistema (selezione)
              └── Modulo (tab/menu filtrato da moduli abilitati)
```

Ogni API operativa riceve `systemId` (o lo deriva dal file). Il backend verifica:

1. l’utente appartiene al `clientId` del sistema
2. il sistema esiste ed è `active`
3. il modulo richiesto è abilitato su quel sistema

### 4. Moduli = catalogo + abilitazione, non tabelle duplicate

I moduli (Track Geometry, Corrugation, Tunnel Scan, …) sono un **catalogo globale** (`ModuleDefinition`). L’abilitazione è una **junction** `SystemModule`. Così aggiungi un modulo nuovo senza alterare lo schema.

Frontend: route e menu generati da `GET /me/context` o `GET /systems/:id/modules`.

### 5. Filesystem speculare al DB

```
/uploads/{clientFolder}/{projectSlug}/{systemSlug}/{moduleCode}/
  config/
  manuals/
  upload/
```

Il path si calcola dal DB al momento del provisioning; l’upload non accetta path arbitrari dal client.

### 6. RBAC a due assi

**Asse globale (ruolo utente):**

- `superadmin` → provisioning
- `admin` → utenti/gruppi del proprio cliente
- `cliente` → lettura/uso moduli abilitati

**Asse opzionale (scope fine):** se serve limitare un operatore a subset di progetti/sistemi:

```
UserProjectAccess(userId, projectId)
UserSystemAccess(userId, systemId)
```

Se non serve subito, partire solo con `clientId` sullo User e aggiungere scope fine dopo.

---

## Schema database proposto

```prisma
model Client {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  folderName      String    @unique
  maxProjects     Int       @default(0)   // quota N — solo superadmin modifica
  status          String    @default("active")
  users           User[]
  projects        Project[]
  groups          Group[]
}

model Project {
  id              Int       @id @default(autoincrement())
  clientId        Int
  client          Client    @relation(fields: [clientId], references: [id])
  name            String
  slug            String    // univoco per client
  maxSystems      Int       @default(0)   // quota X — solo superadmin
  status          String    @default("active")
  systems         System[]
  @@unique([clientId, slug])
}

model System {
  id              Int       @id @default(autoincrement())
  projectId       Int
  project         Project   @relation(fields: [projectId], references: [id])
  name            String
  slug            String
  lineName        String?   // linea ferroviaria dedicata
  kmStart         Decimal?
  kmEnd           Decimal?
  status          String    @default("active")
  modules         SystemModule[]
  files           File[]
  @@unique([projectId, slug])
}

model ModuleDefinition {
  id              Int       @id @default(autoincrement())
  code            String    @unique  // TRACK_GEOMETRY, CORRUGATION, TUNNEL_SCAN...
  name            String
  routePrefix     String?   // es. /visualizer/track-geometry
  isActive        Boolean   @default(true)
  systems         SystemModule[]
}

model SystemModule {
  systemId        Int
  moduleId        Int
  enabled         Boolean   @default(true)
  enabledAt       DateTime  @default(now())
  enabledByUserId Int?      // audit: quale superadmin
  configJson      Json?     // tolleranze default, cartelle, parametri modulo
  system          System    @relation(fields: [systemId], references: [id])
  module          ModuleDefinition @relation(fields: [moduleId], references: [id])
  @@id([systemId, moduleId])
}

model File {
  id              Int       @id @default(autoincrement())
  systemId        Int       // sostituisce productId
  moduleCode      String?   // opzionale ma utile per query
  filename        String
  path            String
  uploadedBy      Int
  ...
}

model ProvisioningAudit {
  id              Int       @id @default(autoincrement())
  actorUserId     Int
  action          String    // CREATE_PROJECT, SET_QUOTA, ENABLE_MODULE...
  entityType      String
  entityId        Int
  payloadJson     Json
  createdAt       DateTime  @default(now())
}
```

### Regole di enforcement (nel service layer, non solo UI)

```javascript
// Creazione progetto — solo superadmin
if (client.projects.count >= client.maxProjects) throw QuotaExceeded

// Creazione sistema — solo superadmin
if (project.systems.count >= project.maxSystems) throw QuotaExceeded

// Abilitazione modulo — solo superadmin
// File upload — admin/cliente OK, ma systemId deve appartenere al client dell'utente
// e moduleCode deve essere in SystemModule.enabled=true
```

---

## API consigliate

**Superadmin (provisioning):**

- `POST/PUT /admin/clients/:id/quota` → `{ maxProjects }`
- `POST /admin/clients/:id/projects` + `PUT .../quota` → `{ maxSystems }`
- `POST /admin/projects/:id/systems`
- `PUT /admin/systems/:id/modules` → abilita/disabilita moduli

**Cliente (operativo):**

- `GET /me/context` → client, progetti visibili, sistemi, moduli abilitati
- `GET /systems/:id/files?module=TRACK_GEOMETRY`
- upload/analisi sempre scoped a `systemId + moduleCode`

---

## Migrazione da `Product`

1. Aggiungi `Project`, `System`, `ModuleDefinition`, `SystemModule`
2. Crea un **progetto default** per ogni cliente esistente (`"Default"`)
3. Migra ogni `Product` → `System` sotto quel progetto
4. Sposta `File.productId` → `File.systemId`
5. Elimina `Product` quando il codice è aggiornato

---

## Cosa evitare

- **Moduli come colonne booleane** su `System` (`hasCorrugation`, …) → non scala
- **Quote solo in frontend** → bypassabile; devono essere constraint DB + service
- **Permettere ad admin di creare progetti** “con limite soft” → confonde RBAC; meglio superadmin unico provisioner
- **DB separato per cliente** → overkill salvo requisito contrattuale esplicito

---

## Ordine di implementazione

1. Schema Prisma + migration + seed `ModuleDefinition`
2. Service provisioning superadmin + audit log
3. Middleware `resolveTenant` + `requireModule('TRACK_GEOMETRY')`
4. Refactor filesystem e API file upload
5. Frontend: selettore Progetto → Sistema → menu moduli dinamico
6. Migrazione dati `Product` → `System`
