import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should display the onboarding step for creating an apartment', async ({ page }) => {
    // Navigate to onboarding
    await page.goto('/onboarding');
    
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Check if the input for apartment name exists
    const apartmentNameInput = page.getByPlaceholder(/Apartment Name/i);
    if (await apartmentNameInput.isVisible()) {
      await apartmentNameInput.fill('My New Apartment');
      await page.getByRole('button', { name: /Create/i }).click();
      
      // Should redirect to dashboard or next step after creation
      await expect(page).toHaveURL(/.*\/dashboard/);
    }
  });
});
