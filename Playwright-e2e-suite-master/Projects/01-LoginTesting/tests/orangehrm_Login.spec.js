
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('OrangeHRM Login Functionality', () => {

  test('Verify successful login with valid credentials', async ({ page }) => {
    console.log('Executing Test: OrangeHRM Login');

    // Navigate to the OrangeHRM application
    await page.goto('https://opensource-demo.orangehrmlive.com/');

    // Enter username
    await page.fill('input[name="username"]', 'Admin');

    // Enter password
    await page.fill('input[name="password"]', 'admin123');

    // Click the Login button
    await page.click('button[type="submit"]');

    // Verify user is redirected to the Dashboard page
    await expect(page).toHaveURL(/dashboard/);

    // Verify Dashboard heading is visible
    await expect(page.locator('h6')).toContainText('Dashboard');

    console.log('Login completed successfully');
  });

});

