import { expect, test } from '@playwright/test';

test.describe('Critical Sales Flows', () => {
  test('downloads lead template from Leads page', async ({ page }) => {
    await page.goto('/leads');
    await page.getByRole('button', { name: 'Template' }).click();
    await expect(page.locator('[data-testid="app-toast"]')).toContainText('CSV template downloaded.');
  });

  test('opens deal room from Deals page', async ({ page }) => {
    await page.goto('/deals');
    await page.getByRole('button', { name: 'Open Deal Room' }).click();
    await expect(page.locator('[data-testid="app-toast"]')).toContainText('Deal room opened with');
  });

  test('runs a report template from Reports page', async ({ page }) => {
    await page.goto('/reports');
    await page.getByRole('button', { name: 'Run Now' }).first().click();
    await expect(page.locator('[data-testid="app-toast"]')).toContainText('queued for export');
  });
});
