// co2-aware-frontend/src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Import von MUI Theme-Komponenten
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import der Schriftart
import '@fontsource/inter';
import './index.css';

// HIER IST DIE KORREKTUR: Theme definieren
const lightTheme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={lightTheme}>
      {/* CssBaseline normalisiert das CSS für ein konsistentes Aussehen */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);

console.log('Frontend started in mode:', import.meta.env.VITE_APP_MODE);

if (import.meta.env.VITE_APP_MODE === 'CO2_AWARE' && 'serviceWorker' in navigator) {
  const swUrl = '/sw.js';
  // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const API_BASE_URL = ''; // gleich-origin

  navigator.serviceWorker.register(swUrl, { scope: '/' })
    .then(() => {
      console.log('Service worker registered successfully');
    })
    .catch((e) => console.log('Service worker registration failed', e));
}

