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