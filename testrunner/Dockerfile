# Base-Image mit Node.js
FROM mcr.microsoft.com/playwright:v1.54.0-noble

# Arbeitsverzeichnis im Container setzen
WORKDIR /usr/src/app

# package.json und package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm ci --include=dev

# Restlichen Quellcode kopieren
COPY . .

# Standardbefehl, der beim Start des Containers ausgeführt wird
CMD ["npx", "playwright", "test"]