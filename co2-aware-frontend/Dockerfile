# Stufe 1: Bauen der React-Anwendung
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# Mache das Build-Argument im Dockerfile bekannt
ARG VITE_API_BASE_URL
ARG VITE_APP_MODE
# Setze es als Umgebungsvariable, damit npm/vite darauf zugreifen kann
ENV VITE_API_BASE_URL=http://co2-aware-backend:5000
ENV VITE_APP_MODE=CLASSIC

COPY package*.json ./
RUN npm ci

# Restlichen Quellcode kopieren
COPY . .

# Produktions-Build erstellen (erzeugt den /dist Ordner)
RUN npm run build


# Stufe 2: Bereitstellen der Anwendung mit Nginx
FROM nginx:alpine

# Kopiere die statischen Dateien aus der "build"-Stufe in das Nginx-Verzeichnis
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Kopiere die eigene Nginx-Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Gib den Port 80 frei, auf dem Nginx standardmäßig läuft
EXPOSE 80