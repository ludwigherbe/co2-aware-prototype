import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(() => {
  const appMode = process.env.VITE_APP_MODE;
  
  console.log(`- Building frontend in mode: ${appMode} -`);

  const plugins = [react()];

  const server = {
    proxy: {
      '/api':    { target: 'http://localhost:5000', changeOrigin: true },
      '/images': { target: 'http://localhost:5000', changeOrigin: true },
    },
  }

  return {
    plugins: plugins,
    server: server
  }
});