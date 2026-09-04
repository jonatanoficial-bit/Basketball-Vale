import { chromium } from 'file:///C:/Users/jonat/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /iniciar experiência/i }).click();
await page.getByRole('button', { name: /pular abertura/i }).click();
await page.getByRole('button', { name: /criar carreira/i }).click();
await page.getByRole('button', { name: /escolher franquia/i }).click();
await page.getByRole('button', { name: /ver proposta/i }).click();
await page.getByRole('button', { name: /assinar e iniciar/i }).click();
await page.locator('.tutorial-overlay').waitFor();
const guideLoaded = await page.locator('.tutorial-guide img').evaluate((image) => image.complete && image.naturalWidth > 0);
await page.screenshot({ path: 'artifacts/v6-mobile-tutorial.png', fullPage: true });
for (let step = 0; step < 5; step += 1) await page.getByRole('button', { name: 'Próximo', exact: true }).click();
await page.getByRole('button', { name: /começar minha história/i }).click();
await page.getByText('Desafios, recordes e conquistas').waitFor();
const legacyOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await page.screenshot({ path: 'artifacts/v6-mobile-legacy.png', fullPage: true });
await page.locator('.mobile-menu').click();
await page.getByRole('button', { name: /criar clube/i }).click();
await page.getByText('Crie a identidade da sua franquia').waitFor();
const clubOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await page.screenshot({ path: 'artifacts/v6-mobile-club.png', fullPage: true });
await page.locator('.mobile-menu').click();
await page.getByRole('button', { name: /conta & nuvem/i }).click();
await page.getByText('Conta, nuvem e proteção do save').waitFor();
const privacyHref = await page.getByRole('link', { name: /política de privacidade/i }).getAttribute('href');
const goldOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await page.screenshot({ path: 'artifacts/v6-mobile-gold.png', fullPage: true });
if (!guideLoaded || Math.max(legacyOverflow, clubOverflow, goldOverflow) > 2 || !privacyHref?.includes('privacy.html')) {
  throw new Error(JSON.stringify({ guideLoaded, legacyOverflow, clubOverflow, goldOverflow, privacyHref }));
}
console.log(JSON.stringify({ guideLoaded, legacyOverflow, clubOverflow, goldOverflow, privacyHref }, null, 2));
await browser.close();
