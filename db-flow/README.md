# React Flow Data Graph Editor

Een interactieve graph editor gebouwd met **React Flow** voor het ontwerpen van:

- 🔁 **Data pipelines** (DAG-based workflows)
- 🗄️ **Database Entity Relationship Diagrams (ERD)**

Dit project combineert een visuele editor met een type-safe architectuur, gericht op schaalbaarheid en uitbreidbaarheid.

---

## ✨ Features

### Algemene
- React Flow canvas met custom nodes
- Centrale state via Zustand
- TypeScript-first architectuur
- Klaar voor auto-layout, validatie en backend integratie

### Pipeline mode
- Directed data pipelines (DAG)
- Source / Transform / Sink nodes
- Voorbereid voor execution & validatie
- Geschikt voor ETL-achtige workflows

### ERD mode
- Tabellen als nodes
- Kolommen met PK / FK indicators
- Relaties als edges
- Basis voor database-visualisatie en reverse engineering

---

## 🧱 Tech stack

- **React** + **Vite**
- **TypeScript** (strict)
- **React Flow**
- **Zustand** (state management)
- **Zod** (validatie – voorbereid)

---

## 📁 Projectstructuur

```txt
src/
 ├─ app/              # App shell & React Flow setup
 ├─ graph/            # Gedeelde graph types & utilities
 │   ├─ types.ts
 │   ├─ validators.ts
 │   └─ layout.ts
 ├─ pipeline/         # Pipeline-specifieke logica
 │   ├─ nodes/
 │   └─ rules.ts
 ├─ erd/              # ERD-specifieke logica
 │   ├─ nodes/
 │   └─ edges/
 ├─ store/            # Zustand stores
 ├─ components/       # UI components (toolbar, panels)
 └─ main.tsx
