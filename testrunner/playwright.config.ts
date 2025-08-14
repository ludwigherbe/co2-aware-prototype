import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const baseNoPort = process.env.BASE_URL?.replace(/:80$/, '');
const SECURE_ARG = `--unsafely-treat-insecure-origin-as-secure=${BASE_URL},${baseNoPort}`;

export default defineConfig({
  projects: [
    {
      // name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        serviceWorkers: 'allow',
        baseURL: process.env.BASE_URL || 'http://co2-aware-frontend',
        ignoreHTTPSErrors: true,
        launchOptions: {
          args: [
            `--headless=new`,
            '--unsafely-treat-insecure-origin-as-secure=http://co2-aware-frontend',
            '--unsafely-treat-insecure-origin-as-secure=http://co2-aware-frontend:8080',
            '--unsafely-treat-insecure-origin-as-secure=http://co2-aware-frontend:80',
            SECURE_ARG
          ]
        }
      },
    },
  ],
});