/// <reference lib="webworker" />

/*
  Diese Zeile oben ist die entscheidende Änderung.
  Sie löst die TypeScript-Fehler, indem sie dem Compiler explizit mitteilt,
  dass dieser Code in einer Web-Worker-Umgebung läuft.
*/

console.log("Custom Service Worker loaded. Ready for manual caching control.");

self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'CACHE_URL') {
    console.log(`[Service Worker] Received message to cache: ${event.data.url}`);
    // Deine Logik zum Fetchen und manuellen Cachen kommt hier hin.
  }
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  // Deine Logik, um Anfragen abzufangen und eventuell
  // eine gecachte Antwort zurückzugeben, kommt hier hin.
});