import { test, expect } from '@playwright/test';

test.describe('Chores Board Flow', () => {
  test('should load the Kanban board successfully', async ({ page }) => {
    // Navigate to chores
    await page.goto('/dashboard/chores');

    // Check if the Chores header rendered
    await expect(page.locator('h1', { hasText: 'Chores' })).toBeVisible();

    // Verify columns exist
    await expect(page.locator('h3', { hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Done' })).toBeVisible();
  });

  test('should have a button to add a chore', async ({ page }) => {
    await page.goto('/dashboard/chores');
    
    // Check for Add Chore button
    const addBtn = page.getByRole('link', { name: 'Add Chore' });
    await expect(addBtn).toBeVisible();
    
    // Click should navigate to the new chore form
    await addBtn.click();
    await expect(page).toHaveURL(/.*\/chores\/new/);
  });
});
