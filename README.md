# Familien-Autopilot Monorepo

Starter-Repository für dein Produkt mit:
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Datenbank:** MySQL
- **DB-Verwaltung:** phpMyAdmin
- **HTTP-Kommunikation:** native `fetch` statt Axios

## Struktur

```text
familien-autopilot/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Schnellstart

### 1) Datenbank und phpMyAdmin starten

```bash
docker compose up -d
```

MySQL läuft dann auf `localhost:3306` und phpMyAdmin auf `http://localhost:8080`.

### 2) Backend starten

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend läuft auf `http://localhost:4000`.

### 3) Frontend starten

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend läuft auf `http://localhost:5173`.

## Standard-Zugangsdaten DB

Diese Werte sind im Compose-File und den `.env.example` Dateien hinterlegt:

- DB Name: `familien_autopilot`
- DB User: `appuser`
- DB Passwort: `apppassword`
- Root Passwort: `rootpassword`

## Architektur

### Backend (modular)
- `routes/` nur Routing
- `controllers/` nur Request/Response
- `services/` Business-Logik
- `config/` DB und Umgebungen
- `middlewares/` Fehlerbehandlung

### Frontend (modular)
- `api/` alle Fetch-Calls zentral
- `pages/` Seiten
- `components/` UI-Bausteine
- `features/` Feature-bezogene Logik
- `layouts/` Layouts

## Was schon vorbereitet ist

- Health-Check Route
- Meal Suggestions API (`/api/meals/suggestions`)
- React Dashboard mit 5 Rezept-Vorschlägen
- Native `fetch` API-Client
- Docker Compose mit MySQL + phpMyAdmin

## Nächste Schritte

1. Auth ergänzen
2. Familien-/Mitglieder-Modell ergänzen
3. Wochenplan-Tabellen anlegen
4. Einkaufsliste aus Rezepten generieren
5. Swipe-/Like-Flow für Vorschläge hinzufügen
