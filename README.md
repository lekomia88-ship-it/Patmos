## Reiseplaner Patmos

Moderne Web-App, die Flug- und Fährverbindungen von Deutschland nach Patmos (GR) kombiniert. Frontend auf Basis von React + Vite + Tailwind, Backend mit Express und Mockdaten für Flug- und Fähranbieter.

### Features

- Eingabemaske für Abflughafen, Hin- und optional Rückreise
- Automatische Kombination von Flügen (Athen, Kos, Rhodos, Leros) mit Fähren (Blue Star, Dodekanisos Seaways, Rooster)
- Ranking nach Gesamtzeit, Preis und Umsteigequalität
- Favoriten via `localStorage`, Teilen-Link & einfacher PDF-Export (Print)
- Saubere API-Schichten (`/api/flights`, `/api/ferries`, `/api/combine`)

### Projektstruktur

```
/server   → Express-API mit Mockdaten & Kombinationslogik
/client   → React-Frontend (Vite, TailwindCSS)
```

### Getting Started

```bash
# Backend
cd server
npm install
npm run dev      # startet auf http://localhost:4000

# Frontend (zweites Terminal)
cd client
npm install
npm run dev      # öffnet http://localhost:5173
```

Die Frontend-App erwartet standardmäßig das Backend auf `http://localhost:4000`. Per `.env` kann ein anderer Host angegeben werden (`VITE_API_BASE_URL`).

### Tests & Qualität

- ESLint ist im Frontend bereits vorkonfiguriert (`npm run lint`)
- Mockdaten sind deterministisch und liefern realistische Uhrzeiten/Preise

### Weiterführende Ideen

- Austausch der Mockdaten durch echte Anbieter-APIs (z. B. Amadeus, Open Ferry APIs)
- Kartenansicht und Wetter-Widget pro Reisetag
- Automatisierte Preisalarme (E-Mail, Push)
