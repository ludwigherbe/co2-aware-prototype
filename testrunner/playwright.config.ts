import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--unsafely-treat-insecure-origin-as-secure=http://frontend:80',
            '--unsafely-treat-insecure-origin-as-secure=http://co2-aware-frontend:80'
          ]
        }
      },
    },
  ],
});