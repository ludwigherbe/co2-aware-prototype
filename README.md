//ToDo: deutsche und englische Version des README.md erstellen
# CO2-Aware Prototype

## Intro

This project is a prototype for a CO2-aware web application, designed to demonstrate the integration of environmental considerations into software development.

## Technologie-Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** React (Vite)  
- **Datenbank:** PostgreSQL
- **Tests:** Playwright
- **Containerisierung:** Docker, Docker Compose

## Verzeichnisstruktur

```plaintext
co2-aware-prototype/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── Dockerfile
│   └── ...
├── co2-aware-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── layouts/
│   │── ...
├── testrunner/
│   ├── tests/ (Playwright)
├── docker-compose.yml
├── usage_scenario_classic.yml
└── README.md
```

## Installation & Nutzung

Die Anwendung wird über Docker Compose verwaltet. Stelle sicher, dass Docker und Docker Compose auf deinem System installiert sind.

1.  **Repository klonen:**
    ```bash
    git clone [https://github.com/ludwigherbe/co2-aware-prototype.git](https://github.com/ludwigherbe/co2-aware-prototype.git)
    cd co2-aware-prototype
    ```

2.  **Backend und Datenbank starten:**
    Dieser Befehl baut die notwendigen Docker-Images und startet die Container für das Backend und die PostgreSQL-Datenbank.
    ```bash
    docker compose up --build
    ```

3.  **Datenbank initialisieren (Seeding):**
    Führe den folgenden Befehl aus, um die Datenbank mit den notwendigen Tabellen und Testdaten zu befüllen. Dieser Schritt muss nur einmal nach dem ersten Start oder wenn die Daten zurückgesetzt werden sollen, ausgeführt werden.
    ```bash
    docker exec -it co2-aware-backend npm run db:seed
    ```

4.  **Frontend starten:**
    Wechsle in das Frontend-Verzeichnis, installiere die Abhängigkeiten und starte das Frontend.
    ```bash
    cd co2-aware-frontend
    npm install
    npm run dev
    ```
5. **Test ausführen:**
    Um das Testszenario mit Playwright auszuführen, wechsle in das `testrunner`-Verzeichnis und führe die Tests aus:
    ```npx playwright test --ui
    ```

Die Anwendung ist nun betriebsbereit. Das Frontend ist typischerweise unter `http://localhost:5173` und das Backend unter `http://localhost:5000` erreichbar.

## Messung - Green Metrics Tool
- Modus: CLASSIC oder CO2_AWARE an folgenden Stellen korrekt setzen:
docker-compose.yml - backend - enviroment - APP_MODE
docker-compose.yml - testrunner - environment - APP_MODE
frontend/Dockerfile - ENV VITE_APP_MODE

- in der Testdatei scenario.spec.ts die gewünschte Zeit zwischen den Zyklen eingestellt

## Messergebnisse und Auswertungsskripte

Die Rohdaten liegen im Verzeichnis `messergebnisse/results` und können mit den dortigen Python-Skripten ausgewertet werden.
Am übersichtlichsten sind sie allerdings auf der Website des Green Metrics Tools dargestellt: https://metrics.green-coding.io/stats.html?id=7194f7d4-f85c-49af-83b1-065dc97a1b8e (ID anpassen je nach Messung)

Um die Daten zu explorieren empfiehlt es sich die Excel Datei `messergebnisse/Auswertung Messergebnisse Prototyp Green Metrics Tool.xlsx` zu verwenden.
Hier können die Daten angesehen werden, die Berechnung nachverfolgt werden und die Umrechnungsfaktoren, sowie die CO2-Emissionsfaktoren angepasst werden.


## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.