import { test, expect } from '@playwright/test';

test.describe('Content Dashboard', () => {
  test('should load the dashboard and render feed items', async ({ page }) => {
    await page.goto('/dashboard');

    // Header is visible
    await expect(page.getByText('Content Dashboard')).toBeVisible();

    // Source filter bar renders the "すべて" (All) button
    await expect(page.getByRole('button', { name: /すべて/ })).toBeVisible();

    // At least one feed card renders (mock items are always present as fallback)
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('should filter by source', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for the X source filter button, then click it
    const xButton = page.getByRole('button', { name: /X @/ });
    await expect(xButton).toBeVisible();
    await xButton.click();

    // After filtering, an X card should still be present
    await expect(page.locator('article').first()).toBeVisible();
  });
});
