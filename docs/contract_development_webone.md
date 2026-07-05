# SOFTWARE DEVELOPMENT AND MAINTENANCE SERVICE AGREEMENT

**BY AND BETWEEN:**

1. **ADT Solution S.r.l.** (or sole proprietorship), with registered office at [Address], [City], VAT / Tax Code [Number], represented by its pro-tempore legal representative Mr. Alberto Baqqari, hereinafter referred to as the **"Supplier"**;

**AND:**

2. **[Customer Company Name]**, with registered office at [Address], [City], VAT / Tax Code [Number], represented by its pro-tempore legal representative [Representative Name], hereinafter referred to as the **"Customer"**.

The Supplier and the Customer are hereinafter referred to individually as a **"Party"** and collectively as the **"Parti"** or **"Parties"**.

---

### PREMISES

A. The Supplier specializes in the development of software solutions for the monitoring and diagnostics of railway infrastructure and owns the intellectual property and technical expertise for the development and maintenance of the platform named **"WebOne"** (project **RAMSYS**), a Decision Support System (DSS) for railway Asset Management and Condition-Based/Predictive Maintenance.
B. The Customer operates or performs diagnostic activities on railway and/or metro networks and has expressed the need to adopt a multi-tenant web platform for the visualization and predictive analysis of multi-measure diagnostic data, in accordance with the specifications described in **Annex A** (Technical Specifications).
C. The Parties agree that the software development, customization, and evolution services shall be provided on an ongoing basis for a monthly recurring fee, in accordance with the terms and conditions set forth herein.

Now, therefore, in consideration of the mutual covenants contained herein, the Parties agree as follows:

---

### ARTICLE 1 — SUBJECT MATTER OF THE AGREEMENT
1.1. This Agreement governs the provision by the Supplier to the Customer, and the Customer's acceptance, of software development, customization, integration, maintenance, and technical support services for the **WebOne (RAMSYS)** platform (hereinafter the **"Software"** or the **"Services"**).
1.2. The technical characteristics, enabled functional modules (such as *Track Geometry*, *Corrugation*, *Tunnel Scan*), technical stack (React/Node.js/C++), multi-tenancy rules, and "Air-Gap" security requirements are detailed in **Annex A** (Technical Specifications), which forms an integral and essential part of this Agreement.

---

### ARTICLE 2 — METHODOLOGY AND AGILE DEVELOPMENT
2.1. The software development Services shall be delivered on a monthly basis using the Agile methodology. The Parties shall periodically (on a monthly or sprint basis) agree upon the prioritized list of features to be implemented (*Product Backlog*), in alignment with the general roadmap outlined in Annex A.
2.2. The Supplier agrees to allocate a qualified development team to ensure steady progress and to deliver periodic software releases in a test environment for verification and validation by the Customer.
2.3. The Customer agrees to collaborate actively with the Supplier, promptly providing the necessary diagnostic datasets (e.g., `.csv` and `.geo` files) and performing user acceptance testing (UAT) on intermediate releases within 10 (ten) business days from delivery.

---

### ARTICLE 3 — FEES, INVOICING, AND PAYMENT TERMS
3.1. In consideration for the ongoing development and ordinary maintenance services described in Article 1, the Customer shall pay the Supplier a recurring monthly fee of **EUR [Amount]** (plus applicable VAT).
3.2. The monthly fee includes a dedicated package of **[Number] hours per month** for development, customization, and support. Any additional hours requested by the Customer and pre-authorized in writing shall be invoiced at the hourly rate of **EUR [Amount]** + VAT.
3.3. Invoices shall be issued monthly [in advance / in arrears] by the [Day] day of each month. Payment shall be made via bank transfer within **[30/60] days** from the invoice date.
3.4. In the event of late payments, interest on late payments shall automatically accrue pursuant to applicable legislation (Legislative Decree 231/2002 or equivalent European directive). If the payment delay exceeds 30 (thirty) days from the due date, the Supplier shall have the right to suspend the Services and access to the web platform, upon 5 (five) days' written notice to the Customer.

---

### ARTICLE 4 — INTELLECTUAL PROPERTY AND LICENSE
4.1. All intellectual and industrial property rights related to the WebOne (RAMSYS) platform, including core source code, binary `.geo` parsing modules, and analysis algorithms developed by the Supplier, shall remain the sole and exclusive property of **ADT Solution**.
4.2. The Supplier grants the Customer a non-exclusive, non-transferable, and temporary license (limited to the duration of this Agreement) to use the WebOne platform. The license is configured as multi-tenant, subject to the quota limits (e.g., maximum number of companies, projects, systems) specified in Annex A.
4.3. Any customization of the Software developed specifically for the Customer based on its exclusive requirements (excluding reusable core code and basic algorithms of the Supplier) shall be owned by the Customer upon full payment of the corresponding fees. The Supplier shall retain the right to use the general know-how acquired during such development.

---

### ARTICLE 5 — SERVICE LEVEL AGREEMENTS (SLA) AND SUPPORT
5.1. The Supplier shall provide corrective maintenance (bug fixing) and technical support services based on the severity of the issues reported by the Customer, according to the following classification:
*   **Severity 1 (Blocker):** A critical failure that renders the platform completely unusable or causes data loss.
    *   *Response Time:* within 4 business hours.
    *   *Resolution/Workaround Time:* within 24 business hours.
*   **Severity 2 (Critical/Medium):** An issue that severely limits the use of an important feature (e.g., the visualizer chart or file parser) but allows partial use or offers an available workaround.
    *   *Response Time:* within 8 business hours.
    *   *Resolution/Workaround Time:* within 5 business days.
*   **Severity 3 (Minor/Evolutionary):** Minor cosmetic bugs, minor adjustment requests, or technical questions.
    *   *Response Time:* within 16 business hours.
    *   *Resolution Time:* scheduled in the subsequent development sprint.
5.2. The business hours refer to the Supplier’s standard working hours: Monday to Friday, from 09:00 to 18:00 (Italian time), excluding national holidays.

---

### ARTICLE 6 — SECURITY AND "AIR-GAP" ISOLATION
6.1. The Supplier guarantees that the Software is designed to run in a fully isolated local or LAN environment ("Air-Gap"), excluding any external telemetry, license checking, or tracking scripts that require an active internet connection, unless explicitly requested in writing by the Customer for integration with external web services (e.g., Google Maps).
6.2. The Supplier agrees to implement and maintain adequate security measures to prevent unauthorized access and protect the application from *Path Traversal* attacks, ensuring logical data segregation in the multi-tenant database.

---

### ARTICLE 7 — CONFIDENTIALITY AND NON-DISCLOSURE (NDA)
7.1. Each Party undertakes to keep strictly confidential and not disclose to third parties any technical, commercial, financial, or industrial information of a proprietary nature disclosed by the other Party during the performance of this Agreement (hereinafter **"Confidential Information"**).
7.2. Confidential Information includes, but is not limited to: the Software source code, diagnostic parsing algorithms, railway diagnostic data provided by the Customer, development roadmaps, and pricing.
7.3. This confidentiality obligation shall survive the expiration or termination of this Agreement for a period of 3 (three) years.

---

### ARTICLE 8 — PERSONAL DATA PROCESSING (GDPR)
8.1. The Parties shall process personal data in compliance with EU Regulation 2016/679 (GDPR) and applicable national privacy laws.
8.2. To the extent that the Supplier processes personal data on behalf of the Customer in the course of providing the Services (e.g., user credentials, system logs), the Customer shall act as the Data Controller and the Supplier is hereby appointed as the **Data Processor** pursuant to Article 28 of the GDPR. The details of the processing are governed by **Annex B** attached hereto.

---

### ARTICLE 9 — DURATION, TERMINATION, AND HANDOVER
9.1. This Agreement shall have an initial term of **12 (twelve) months** from the date of execution. It shall automatically renew for successive 12-month periods unless either Party objects by sending a written notice of non-renewal via registered letter or certified email (PEC) at least **90 (ninety) days** prior to the expiration date.
9.2. Either Party may terminate this Agreement at any time for convenience upon at least **60 (sixty) days** written notice. In case of termination by the Customer, the Customer shall pay all monthly fees accrued up to the effective date of termination.
9.3. Upon termination of this Agreement for any reason, the Supplier shall cooperate in good faith to facilitate a smooth transition, ensuring the return of all diagnostic datasets and Customer data in a standard format (e.g., SQL database dump, JSON/CSV files). Any technical handover support or training for a new provider shall be billed on a time-and-materials basis at the hourly rate specified in Article 3.2.

---

### ARTICLE 10 — TERMINATION FOR CAUSE
10.1. The Supplier may terminate this Agreement for cause with immediate effect, by written notice via PEC or registered mail, in the event of:
*   Failure by the Customer to pay two (2) consecutive monthly invoices.
*   Breach of the Intellectual Property (Article 4) or Confidentiality (Article 7) provisions.
*   Cessation of operations, insolvency, or bankruptcy proceedings of either Party.
10.2. Termination for cause shall not prejudice any claim for damages that either Party may have.

---

### ARTICLE 11 — LIMITATION OF LIABILITY
11.1. Except in cases of willful misconduct or gross negligence, the Supplier's maximum aggregate liability for any damages arising out of or in connection with the performance or non-performance of this Agreement shall be limited to the total monthly fees actually paid by the Customer in the 6 (six) months preceding the event that gave rise to the claim.
11.2. The Supplier shall not be liable to the Customer or any third party for indirect, incidental, special, or consequential damages, including loss of profits, business interruption, loss of data, or reputational damage.

---

### ARTICLE 12 — GOVERNING LAW AND JURISDICTION
12.1. This Agreement shall be governed by and construed in accordance with the **laws of Italy**.
12.2. Any dispute arising out of or in connection with the interpretation, performance, or termination of this Agreement shall be submitted to the exclusive jurisdiction of the **Court of [City, e.g., Milan]**.

---

In witness whereof, the Parties have executed this Agreement.

[Place], [Date]

\
**THE SUPPLIER**  
ADT Solution S.r.l.  
*(Alberto Baqqari)*  

\
**THE CUSTOMER**  
[Company Name]  
*([Representative Name])*  

---

# ANNEX A — TECHNICAL SPECIFICATIONS (WebOne / RAMSYS)

This Annex defines the technical requirements and functional modules of the Software covered by the monthly development agreement.

### 1. Project Overview & Functional Modules
WebOne (RAMSYS) is a multi-tenant web platform designed for interactive visualization, defect tracking, and statistical compliance analysis of physical railway diagnostic data originating from ADT Solution diagnostic systems.

The monthly development Services cover the engineering, enhancement, and optimization of the following modules:
*   **Core Module & Multi-Tenancy (RBAC):** Rigorous logical and physical isolation of data using a hierarchical system (*Company → Project → System (railway line) → Files*). Role-Based Access Control (SuperAdmin, Company Admin, Client Operator).
*   **Data Ingestion Module:**
    *   Resilient, chunked upload mechanism for large diagnostic datasets (> 5MB).
    *   Standard CSV file ingestion with automated numeric formatting normalization.
    *   Low-level binary parser for the proprietary `.geo` format (extracting chainage/km, speed, alignment, longitudinal level, superelevation, gauge, and GPS coordinates).
*   **Data Visualizer Module (Oscilloscope Chart):**
    *   High-performance data visualization utilizing ordered equidistant sampling and reservoir sampling algorithms to prevent web browser freeze.
    *   Locked spatial X-axis (representing kilometrage/chainage).
    *   Multiple Y-axes allowing simultaneous selection of different measurements, rendered with independent scales and offsets.
    *   Bidirectional GIS mapping: hovering over any point on the chart updates a synchronized Google Maps view displaying the precise geographic location.
*   **Tolerance Analysis & Standards Compliance Module:**
    *   Dynamic tolerance thresholds set in millimeters ($\pm\text{ mm}$) for each measurement channel.
    *   Visual defect mapping (chart lines change color dynamically when thresholds are breached, leaving the grid background clean).
    *   Defect statistics report (total sample count, defect percentages) and red alerts when the defect ratio exceeds **5%** of the trass.
*   **Railway Landmarks (Singularities) Module:**
    *   Ability to insert spatial annotations (signals, level crossings, stations, turnouts, kilometrage posts) directly via chart click.
    *   Data stored in a parallel JSON file (`{filename}_db.json`) in the same system directory to preserve the integrity of the raw measurement file.

### 2. Development Technology Stack
*   **Frontend:** React (Vite) + Tailwind CSS + Chart.js (zoom and annotation plugins) + PapaParse (client-side CSV processing) + i18n framework (supporting Italian, English, and Chinese).
*   **Backend:** Node.js (Express.js) + Prisma ORM (MySQL / PostgreSQL database target) + JWT authentication.
*   **Infrastructure:** Containerized environment using Docker & Docker Compose (`weebone_backend`, `weebone_frontend`, `weebone_db`, `weebone_prisma_migrate`).
*   **Security & Air-Gap Compliance:** Absence of external telemetry to ensure off-grid, local server installation capability. Path sanitization to mitigate *Path Traversal* vulnerabilities.
