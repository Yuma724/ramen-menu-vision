import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main heading is visible
    await expect(page.getByText('Ramen Menu Vision')).toBeVisible();
    
    // Check if the upload area is visible
    await expect(page.getByText(/drag.*drop.*menu image/i)).toBeVisible();
  });

  test('should show upload interface', async ({ page }) => {
    await page.goto('/');
    
    // Check for upload instructions
    const uploadText = page.getByText(/drag.*drop|click to select/i);
    await expect(uploadText).toBeVisible();
  });
});

