import { expect, test } from '@playwright/test';

const adminUrl = process.env.VITE_ADMIN_URL ?? 'http://localhost:5174';

test('admin app loads with a non-empty title', async ({ page }) => {
  await page.goto(adminUrl);

  await expect(page).toHaveTitle(/.+/);
});
