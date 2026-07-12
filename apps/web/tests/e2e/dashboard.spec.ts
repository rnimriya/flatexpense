import { test, expect } from '@playwright/test';

test.describe('Dashboard Base Flow', () => {
  // Use mock authentication headers for testing if using Clerk
  
  test('should load the dashboard successfully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Check if the TopNav rendered with 'Overview' text
    await expect(page.locator('h2', { hasText: 'Overview' })).toBeVisible();

    // Verify Sidebar renders navigation links
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Expenses' })).toBeVisible();
  });

  test('should display total balance widgets', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for animation or mock data rendering
    const balanceCard = page.locator('text=Total Balance');
    await expect(balanceCard).toBeVisible();
  });
});
