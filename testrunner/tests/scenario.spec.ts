import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test('Szenario: Intensiv stöbernder Nutzer', async ({ page }) => {

  // --- ZYKLUS 1: Baseline-Messung (Aktiv: 20s) ---
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-9"]').click();
  await page.goto(BASE_URL);
  await page.locator('[data-testid="next-page-button"]').click();
  await page.locator('[data-testid="product-card-12"]').click();
});
