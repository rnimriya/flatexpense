import { test, expect } from '@playwright/test';

test.describe('Expenses Flow', () => {
  test('should navigate to expenses and open new expense modal', async ({ page }) => {
    await page.goto('/dashboard/expenses');
    
    await expect(page.locator('h1', { hasText: 'Expenses' })).toBeVisible();
    
    // Click Add Expense button
    const addButton = page.getByRole('link', { name: /Add Expense/i }).or(page.getByRole('button', { name: /Add Expense/i }));
    await addButton.click();

    // Verify we are on the new expense page
    await expect(page).toHaveURL(/.*\/dashboard\/expenses\/new/);
    
    // Verify form elements exist
    await expect(page.getByPlaceholder('What was this for?')).toBeVisible();
    await expect(page.getByPlaceholder('0.00')).toBeVisible();
  });
});
