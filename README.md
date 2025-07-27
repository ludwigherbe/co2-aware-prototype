//ToDo: deutsche und englische Version des README.md erstellen
# CO2-Aware Prototype

## Intro

This project is a prototype for a CO2-aware web application, designed to demonstrate the integration of environmental considerations into software development.

## Technologie-Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** React (Vite)  
- **Datenbank:** PostgreSQL  
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
│   └── ...
├── docker-compose.yml
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

Die Anwendung ist nun betriebsbereit. Das Frontend ist typischerweise unter `http://localhost:5173` und das Backend unter `http://localhost:5000` erreichbar.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.