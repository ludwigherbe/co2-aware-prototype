import { test, expect, Page } from '@playwright/test';
import { startNotesClock, note } from './../notes';

// const BASE_URL = "http://localhost:8080";
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const timeoutPhase = 10000; // 10 Sekunden für passive Phasen

// --- Test-Schritt Definitionen ---

async function runCycle1(page: Page) {
  note('STEP:Z1_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-1"]').click();
  await page.waitForLoadState('networkidle');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-2"]').click();
  await page.waitForLoadState('networkidle');
  note('STEP:Z1_END');
}

async function runCycle2(page: Page) {
  note('STEP:Z2_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="next-page-button"]').click(); // Seite 2
  await page.locator('[data-testid="product-card-11"]').click();
  await page.goBack();
  await page.locator('[data-testid="product-card-12"]').click();
  note('STEP:Z2_END');
}

async function runCycle3(page: Page) {
  note('STEP:Z3_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="search-input"] input').fill('Bank');
  await page.waitForURL('**/home?search=Bank**');
  await page.locator('[data-testid="search-input"] input').fill('');
  await page.waitForURL('**/home?search=**');
  await page.locator('[data-testid="next-page-button"]').click(); // -> Seite 2
  await page.locator('[data-testid="next-page-button"]').click(); // -> Seite 3
  await expect(page).toHaveURL(/\/home\?search=&page=3$/);
  await page.locator('[data-testid="product-card-21"]').click();
  await page.goBack();
  await expect(page).toHaveURL(/\/home\?search=&page=3$/);
  await page.locator('[data-testid="product-card-22"]').click();
  note('STEP:Z3_END');
}

async function runCycle4(page: Page) {
  note('STEP:Z4_START');
  await page.goto(BASE_URL);
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-testid="next-page-button"]').click();
  }
  await expect(page).toHaveURL(/\/home\?search=&page=4$/);
  await page.locator('[data-testid="product-card-31"]').click();
  await page.goBack();
  await expect(page).toHaveURL(/\/home\?search=&page=4$/);
  await page.locator('[data-testid="product-card-32"]').click();
  note('STEP:Z4_END');
}

async function runCycle5(page: Page) {
  note('STEP:Z5_START');
  await page.goto(BASE_URL);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-testid="next-page-button"]').click();
  }
  await expect(page).toHaveURL(/\/home\?search=&page=5$/);
  await page.locator('[data-testid="product-card-45"]').click();
  note('STEP:Z5_END');
}

async function runCycle6(page: Page) {
  note('STEP:Z6_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="next-page-button"]').click(); // Seite 2
  await page.locator('[data-testid="product-card-15"]').click();
  note('STEP:Z6_END');
}

async function runCycle7(page: Page) {
  note('STEP:Z7_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-1"]').click();
  await page.locator('[data-testid="add-to-cart-button"]').click();
  await expect(page.locator('.MuiSnackbar-root')).toBeVisible();
  await page.locator('[data-testid="cart-button"]').click();
  await page.locator('[data-testid="checkout-button"]').click();
  note('STEP:Z7_END');
}

// --- Haupt-Test: Führt alle Zyklen sequenziell aus ---

test('Finales 7-Zyklen Testszenario', async ({ page }) => {
  startNotesClock();
  note('RUN_START');

  test.setTimeout(420000);

  // --- ZYKLUS 1 ---
  await runCycle1(page);

  // --- Passive Phase 1 ---
  note('PHASE:PASSIVE_1_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_1_END');

  // --- ZYKLUS 2 ---
  await runCycle2(page);

  // --- Passive Phase 2 ---
  note('PHASE:PASSIVE_2_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_2_END');

  // --- ZYKLUS 3 ---
  await runCycle3(page);

  // --- Passive Phase 3 ---
  note('PHASE:PASSIVE_3_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_3_END');

  // --- ZYKLUS 4 ---
  await runCycle4(page);

  // --- Passive Phase 4 ---
  note('PHASE:PASSIVE_4_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_4_END');

  // --- ZYKLUS 5 ---
  await runCycle5(page);

  // --- Passive Phase 5 ---
  note('PHASE:PASSIVE_5_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_5_END');

  // --- ZYKLUS 6 ---
  await runCycle6(page);

  // --- Passive Phase 6 ---
  note('PHASE:PASSIVE_6_START');
  await page.waitForTimeout(timeoutPhase);
  note('PHASE:PASSIVE_6_END');

  // --- ZYKLUS 7 ---
  await runCycle7(page);

  note('RUN_END');
});
