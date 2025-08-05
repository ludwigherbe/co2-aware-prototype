# Base-Image mit Node.js
FROM mcr.microsoft.com/playwright:v1.50.0-focal

# Arbeitsverzeichnis im Container setzen
WORKDIR /usr/src/app

# package.json und package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Restlichen Quellcode kopieren
COPY . .

# Standardbefehl, der beim Start des Containers ausgeführt wird
CMD ["npx", "playwright", "test"]