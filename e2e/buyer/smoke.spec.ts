import { expect, test } from '@playwright/test';

const buyerUrl = process.env.VITE_BUYER_URL ?? 'http://localhost:5173';

test('buyer app loads with a non-empty title', async ({ page }) => {
  await page.goto(buyerUrl);

  await expect(page).toHaveTitle(/.+/);
});
