import { test, expect, Page } from '@playwright/test';
import { startNotesClock, note } from './../notes';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const APP_MODE = process.env.APP_MODE || 'CLASSIC';

const timeoutPhase = 30000; // 30 Sekunden für passive Phasen

async function swCall<T>(page: Page, payload: any): Promise<T> {
  return await page.evaluate(async (msg) => {
    const reg = await navigator.serviceWorker.ready;
    return await new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = (ev) => resolve(ev.data);
      reg.active?.postMessage(msg, [ch.port2]);
    });
  }, payload);
}

// --- Test-Schritt Definitionen ---

async function runCycle1(page: Page) {
  note(`STEP:Z1_START BASE_URL: ${BASE_URL}`);
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-1"]').click();
  await page.waitForLoadState('networkidle');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-2"]').click();
  await page.waitForLoadState('networkidle');
}

async function runCycle2(page: Page) {
  note('STEP:Z2_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="next-page-button"]').click(); // Seite 2
  await page.locator('[data-testid="product-card-11"]').click();
  await page.goBack();
  await page.locator('[data-testid="product-card-12"]').click();
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
}

async function runCycle5(page: Page) {
  note('STEP:Z5_START');
  await page.goto(BASE_URL);
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-testid="next-page-button"]').click();
  }
  await expect(page).toHaveURL(/\/home\?search=&page=5$/);
  await page.locator('[data-testid="product-card-45"]').click();
}

async function runCycle6(page: Page) {
  note('STEP:Z6_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="next-page-button"]').click(); // Seite 2
  await page.locator('[data-testid="product-card-15"]').click();
}

async function runCycle7(page: Page) {
  note('STEP:Z7_START');
  await page.goto(BASE_URL);
  await page.locator('[data-testid="product-card-1"]').click();
  await page.locator('[data-testid="add-to-cart-button"]').click();
  await expect(page.locator('.MuiSnackbar-root')).toBeVisible();
  await page.locator('[data-testid="cart-button"]').click();
  await page.locator('[data-testid="checkout-button"]').click();
}

// --- Haupt-Test: Führt alle Zyklen sequenziell aus ---

// test('7-Zyklen Testszenario', async ({ page }) => {
//   startNotesClock();
//   note('RUN_START');

//   test.setTimeout(420000); // 7 Minuten für das gesamte Szenario

//   // --- ZYKLUS 1 ---
//   await runCycle1(page);

//   // --- Passive Phase 1 ---
//   note('PHASE:PASSIVE_1_START');
//   if (APP_MODE === 'CO2_AWARE') {
//     await swCall(page, { type: 'TRIGGER_WARMUP', delayMs: 5000 });
//   }
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_1_END');

//   // --- ZYKLUS 2 ---
//   await runCycle2(page);

//   // --- Passive Phase 2 ---
//   note('PHASE:PASSIVE_2_START');
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_2_END');

//   // --- ZYKLUS 3 ---
//   await runCycle3(page);

//   // --- Passive Phase 3 ---
//   note('PHASE:PASSIVE_3_START');
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_3_END');

//   // --- ZYKLUS 4 ---
//   await runCycle4(page);

//   // --- Passive Phase 4 ---
//   note('PHASE:PASSIVE_4_START');
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_4_END');

//   // --- ZYKLUS 5 ---
//   await runCycle5(page);

//   // --- Passive Phase 5 ---
//   note('PHASE:PASSIVE_5_START');
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_5_END');

//   // --- ZYKLUS 6 ---
//   await runCycle6(page);

//   // --- Passive Phase 6 ---
//   note('PHASE:PASSIVE_6_START');
//   await page.waitForTimeout(timeoutPhase);
//   note('PHASE:PASSIVE_6_END');

//   // --- ZYKLUS 7 ---
//   await runCycle7(page);
//   if (APP_MODE === 'CO2_AWARE') {
//     const stats = await swCall<{ hits:number; misses:number; requests:number }>(page, { type: 'GET_COUNTERS' });
//     note(`SW_COUNTERS hits=${stats?.hits ?? 0} misses=${stats?.misses ?? 0} requests=${stats?.requests ?? 0}`);
//   }
//   await page.request.post('/api/metrics/flush');
//   await page.waitForTimeout(200);
//   note('RUN_END');
// });


test('Vielfaches des 7 Zyklus Testszenario', async ({ page }) => {
  startNotesClock();
  note('RUN_START');

  // Feste Vorgaben
  const MAX_TEST_MS = 700_000; // 11 Minuten
  const TARGET_CYCLES = 10;    // 10 Zyklen
  const FAST_PAUSE_MS = 2_000; // 2 Sekunden zwischen Aktivphasen
  const PASSIVE1_MS = 30_000;  // 30 Sekunden in Passivphase 1

  test.setTimeout(MAX_TEST_MS);

  const runs: Array<(page: Page) => Promise<void>> = [
    runCycle1, runCycle2, runCycle3, runCycle4, runCycle5, runCycle6, runCycle7,
  ];

  const start = Date.now();
  let cyclesDone = 0;

  // --- Zyklus 1: Aktivphase1, dann Passivphase1 (30s + SW-Warmup), danach Aktivphase2..7 mit 2s-Pause ---
  await runCycle1(page);
  if (APP_MODE === 'CO2_AWARE') {
    note('PHASE:PASSIVE_1_START');
    await swCall(page, { type: 'TRIGGER_WARMUP', delayMs: 5000 });
  }
  await page.waitForTimeout(PASSIVE1_MS);
  note('PHASE:PASSIVE_1_END');

  for (let i = 1; i < runs.length; i++) {
    await runs[i](page);
    await page.waitForTimeout(FAST_PAUSE_MS);
  }
  cyclesDone += 1;

  // --- Folgezyklen: immer Aktivphase1..7 mit 2s Pausen dazwischen ---
  while (cyclesDone < TARGET_CYCLES && (Date.now() - start) < MAX_TEST_MS) {
    for (let i = 0; i < runs.length; i++) {
      await runs[i](page);
      // Restzeit prüfen, um nicht über MAX_TEST_MS hinaus zu schlafen
      const remaining = MAX_TEST_MS - (Date.now() - start);
      if (remaining <= 0) break;
      await page.waitForTimeout(Math.min(FAST_PAUSE_MS, remaining));
    }
    cyclesDone += 1;
  }

  // Abschluss
  if (APP_MODE === 'CO2_AWARE') {
    const stats = await swCall<{ hits:number; misses:number; requests:number }>(
      page, { type: 'GET_COUNTERS' }
    );
    note(`SW_COUNTERS hits=${stats?.hits ?? 0} misses=${stats?.misses ?? 0} requests=${stats?.requests ?? 0}`);
  }
  await page.request.post('/api/metrics/flush');
  await page.waitForTimeout(200);
  note('RUN_END');
});
