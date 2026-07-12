import { test, expect } from '@playwright/test';

test.describe('Settlements Flow', () => {
  test('should navigate to settle up page and show balances', async ({ page }) => {
    await page.goto('/dashboard/settle');
    
    await expect(page.locator('h1', { hasText: 'Settle Up' })).toBeVisible();
    
    // Check if there's a record payment button
    const recordPaymentBtn = page.getByRole('button', { name: /Record Payment/i });
    if (await recordPaymentBtn.isVisible()) {
      await recordPaymentBtn.click();
      
      // Verify payment dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Amount to pay')).toBeVisible();
    }
  });

  test('should display balances on the balances page', async ({ page }) => {
    await page.goto('/dashboard/balances');
    
    await expect(page.locator('h1', { hasText: 'Balances' })).toBeVisible();
    await expect(page.getByText('Total Balance')).toBeVisible();
  });
});
