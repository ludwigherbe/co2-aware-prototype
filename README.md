# CO2-Aware Prototype
english version below

## Intro

Dieses Projekt ist ein Prototyp für eine CO2-intensitätsabhängige Webanwendung, die entwickelt wurde, um die Integration von Umweltaspekten in die Softwareentwicklung zu demonstrieren und mittels Green Metrics Tool zu messen.

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
    ```bash
    npx playwright test --ui
    ```

Die Anwendung ist nun betriebsbereit. Das Frontend ist typischerweise unter `http://localhost:5173` und das Backend unter `http://localhost:5000` erreichbar.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.


## Messung – Green Metrics Tool

Um den Modus auf `CLASSIC` oder `CO2_AWARE` zu setzen, passe die folgenden Stellen an:

- **docker-compose.yml**
    - `backend` → `environment` → `APP_MODE`
    - `testrunner` → `environment` → `APP_MODE`
- **frontend/Dockerfile**
    - `ENV VITE_APP_MODE`

Stelle sicher, dass der gewünschte Modus (`CLASSIC` oder `CO2_AWARE`) überall konsistent eingetragen ist.

- in der Testdatei scenario.spec.ts die gewünschte Zeit zwischen den Zyklen eingestellt

# Messergebnisse und Auswertungsskripte

## Verzeichnisstruktur

```plaintext
messergebnisse/
├── results/
│   ├── [messungs_name]/
│   │   ├── notes.json
│   │   └── measurements.json
│   └── master_results.csv
├── datascraper.py
├── create_plots.py
└── Auswertung Messergebnisse Prototyp Green Metrics Tool.xlsx
```

## Rohdaten & Auswertung

Die Rohdaten befinden sich im Verzeichnis `messergebnisse/results` und können mit den bereitgestellten Python-Skripten ausgewertet werden. Eine übersichtliche Darstellung der Ergebnisse ist auch auf der Website des Green Metrics Tools möglich:  
[https://metrics.green-coding.io/stats.html?id=7194f7d4-f85c-49af-83b1-065dc97a1b8e](https://metrics.green-coding.io/stats.html?id=7194f7d4-f85c-49af-83b1-065dc97a1b8e)  
*(Die ID je nach Messung anpassen)*

---

## Datenerfassung mit `datascraper.py`

Das Skript `datascraper.py` lädt Messdaten von der Green Coding API und bereitet sie für die weitere Verarbeitung auf.

**Ablauf:**
1. **Konfiguration:** In der `CONFIG`-Variable werden Messungsnamen den IDs der Green Coding Plattform zugeordnet.
2. **Datenauswahl:** Über die Liste `MEASUREMENTS_TO_PROCESS` können zu verarbeitende Messungen ausgewählt werden.
3. **API-Abfrage & Caching:** Die Daten werden pro Messungs-ID heruntergeladen und lokal im Cache (`results/[messungs_name]`) gespeichert.
4. **Datenverarbeitung:** Relevante Metriken wie Energieverbrauch (`psu_energy_ac_mcp_machine`) und Netzwerkverkehr werden extrahiert.
5. **Ergebnisspeicherung:** Aggregierte Ergebnisse werden in `results/master_results.csv` zusammengefasst.

**Nutzung:**
```bash
python messergebnisse/datascraper.py
```
Vorher gewünschte Messungen in `MEASUREMENTS_TO_PROCESS` eintragen.

---

## Visualisierung mit `create_plots.py`

Mit `create_plots.py` können Diagramme für Energieverbrauch und Netzwerknutzung erstellt werden.

**Ablauf:**
1. **Messung auswählen:** In `MEASUREMENT_TO_PLOT` den Messungsnamen angeben.
2. **Daten laden:** Skript liest die zugehörigen JSON-Dateien aus dem `results`-Verzeichnis.
3. **Diagrammerstellung:** Zwei Diagramme werden generiert:
    - Energieverbrauch im Zeitverlauf
    - Netzwerknutzung im Zeitverlauf
4. **Speichern:** Diagramme als PNG im jeweiligen Messungsordner.

**Nutzung:**
```bash
python messergebnisse/create_plots.py
```
Vorher sicherstellen, dass die Rohdaten vorhanden sind (`datascraper.py` ausgeführt).

---

## Manuelle Auswertung mit Excel

Die Datei **Auswertung Messergebnisse Prototyp Green Metrics Tool.xlsx** ermöglicht eine detaillierte, manuelle Analyse:

- Einsehen der Rohdaten und aggregierten Ergebnisse
- Nachvollziehen der Skript-Berechnungen
- Eigene Berechnungen und Analysen (z.B. Anpassung von Umrechnungs- oder CO2-Emissionsfaktoren)


# CO2-Aware Prototype

## Intro

This project is a prototype for a CO2-aware web application, designed to demonstrate the integration of environmental considerations into software development and to be measured with the Green Metrics Tool.

## Technology Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** React (Vite)  
- **Database:** PostgreSQL  
- **Tests:** Playwright  
- **Containerization:** Docker, Docker Compose  

## Directory Structure

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
│   │   └── ...
├── testrunner/
│   ├── tests/ (Playwright)
├── docker-compose.yml
├── usage_scenario_classic.yml
└── README.md
```

## Installation & Usage

The application is managed via Docker Compose. Ensure that Docker and Docker Compose are installed on your system.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ludwigherbe/co2-aware-prototype.git
   cd co2-aware-prototype
   ```

2. **Start the backend and database:**  
   This command builds the necessary Docker images and starts the containers for the backend and the PostgreSQL database.
   ```bash
   docker compose up --build
   ```

3. **Initialize the database (Seeding):**  
   Run the following command to populate the database with the necessary tables and test data. This step only needs to be performed once after the initial start or if the data needs to be reset.
   ```bash
   docker exec -it co2-aware-backend npm run db:seed
   ```

4. **Start the frontend:**  
   Change to the frontend directory, install the dependencies, and start the frontend.
   ```bash
   cd co2-aware-frontend
   npm install
   npm run dev
   ```

5. **Run tests:**  
   To run the test scenario with Playwright, change to the `testrunner` directory and execute the tests:
   ```bash
   npx playwright test --ui
   ```

The application is now operational. The frontend is typically accessible at `http://localhost:5173` and the backend at `http://localhost:5000`.

---

# Measurement - Green Metrics Tool

- Set the mode to CLASSIC or CO2_AWARE in the following locations:
  - docker-compose.yml – backend – environment – APP_MODE  
  - docker-compose.yml – testrunner – environment – APP_MODE  
  - frontend/Dockerfile – ENV VITE_APP_MODE  

- In the test file `scenario.spec.ts`, adjust the desired time between cycles.

---

## Measurement Results and Analysis Scripts

### Directory Structure

```plaintext
messergebnisse/
├── results/
│   ├── [measurement_name]/
│   │   ├── notes.json
│   │   └── measurements.json
│   └── master_results.csv
├── datascraper.py
├── create_plots.py
└── Auswertung Messergebnisse Prototyp Green Metrics Tool.xlsx
```

### Raw Data & Analysis

The raw data is located in the `messergebnisse/results` directory and can be analyzed using the provided Python scripts.  
A clear presentation of the results is also available on the Green Metrics Tool website:  
[https://metrics.green-coding.io/stats.html?id=7194f7d4-f85c-49af-83b1-065dc97a1b8e](https://metrics.green-coding.io/stats.html?id=7194f7d4-f85c-49af-83b1-065dc97a1b8e)  
*(Adjust the ID depending on the measurement)*

---

## Data Scraping with `datascraper.py`

The script `datascraper.py` fetches measurement data from the Green Coding API and prepares it for further processing.

**Workflow:**
1. **Configuration:** In the `CONFIG` variable, measurement names are mapped to their corresponding IDs from the Green Coding platform.  
2. **Data Selection:** The `MEASUREMENTS_TO_PROCESS` list is used to select which measurements to process.  
3. **API Query & Caching:** Data for each measurement ID is downloaded and cached locally in the `results/[measurement_name]` directory.  
4. **Data Processing:** Relevant metrics such as energy consumption (`psu_energy_ac_mcp_machine`) and network traffic are extracted.  
5. **Result Storage:** Aggregated results are summarized in `results/master_results.csv`.  

**Usage:**
```bash
python messergebnisse/datascraper.py
```
Before running, ensure the desired measurements are listed in `MEASUREMENTS_TO_PROCESS`.

---

## Visualization with `create_plots.py`

The script `create_plots.py` can be used to generate charts for energy consumption and network usage.

**Workflow:**
1. **Select Measurement:** Specify the name of the measurement in the `MEASUREMENT_TO_PLOT` variable.  
2. **Load Data:** The script reads the corresponding JSON files from the `results` directory.  
3. **Chart Generation:** Two charts are generated:  
   - Energy consumption over time  
   - Network usage over time  
4. **Save:** The charts are saved as PNG files in the respective measurement folder.  

**Usage:**
```bash
python messergebnisse/create_plots.py
```
Ensure that the raw data is available (`datascraper.py` must be executed first).

---

## Manual Analysis with Excel

The file **Auswertung Messergebnisse Prototyp Green Metrics Tool.xlsx** allows for detailed manual analysis:

- View raw data and aggregated results  
- Understand the calculations performed by the scripts  
- Conduct your own calculations and analyses (e.g., by adjusting conversion factors or CO₂ emission factors)  

---

## License

This project is licensed under the MIT License.
