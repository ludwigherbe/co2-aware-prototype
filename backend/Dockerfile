# Schritt 1: Wähle ein offizielles Node.js-Basisimage
FROM node:18-alpine

# Schritt 2: Lege das Arbeitsverzeichnis im Container fest
WORKDIR /usr/src/app

# Schritt 3: Kopiere die package.json und package-lock.json
# Das getrennte Kopieren nutzt den Docker-Cache. Dependencies werden nur
# neu installiert, wenn sich diese Dateien ändern.
COPY package*.json ./

# Schritt 4: Installiere die Projekt-Abhängigkeiten
RUN npm install

# Schritt 5: Kopiere den restlichen Quellcode deines Backends
COPY . .

# Schritt 6: Gib den Port frei, auf dem deine App läuft
EXPOSE 5000

# Schritt 7: Definiere den Befehl zum Starten der Anwendung
CMD [ "node", "server.js" ]