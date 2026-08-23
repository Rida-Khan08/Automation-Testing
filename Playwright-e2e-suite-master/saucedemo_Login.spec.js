
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo Login Functionality', () => {

  test('Verify successful login with valid credentials', async ({ page }) => {
    console.log('Executing Test: Valid Login');

    // Navigate to SauceDemo application
    await page.goto('https://www.saucedemo.com/');

    // Enter valid username
    await page.fill('#user-name', 'standard_user');

    // Enter valid password
    await page.fill('#password', 'secret_sauce');

    // Click Login button
    await page.click('#login-button');

    // Verify user is redirected to inventory page
    await expect(page).toHaveURL(/inventory/);

    // Verify page title
    await expect(page).toHaveTitle(/Swag Labs/);

    console.log('Login successful');
  });

  test('Verify error message for invalid credentials', async ({ page }) => {
    console.log('Executing Test: Invalid Login');

    // Navigate to SauceDemo application
    await page.goto('https://www.saucedemo.com/');

    // Enter invalid username
    await page.fill('#user-name', 'wrong_user');

    // Enter invalid password
    await page.fill('#password', 'wrong_pass');

    // Click Login button
    await page.click('#login-button');

    // Verify error message is displayed
    const errorMessage = page.locator('.error-message-container');
    await expect(errorMessage).toBeVisible();

    console.log('Error message displayed successfully');
  });

  test('Verify login attempt with locked out user', async ({ page }) => {
    console.log('Executing Test: Locked Out User Login');

    // Navigate to SauceDemo application
    await page.goto('https://www.saucedemo.com/');

    // Enter locked out username
    await page.fill('#user-name', 'locked_out_user');

    // Enter valid password
    await page.fill('#password', 'secret_sauce');

    // Click Login button
    await page.click('#login-button');

    // Verify locked out error message appears
    const errorMessage = page.locator('.error-message-container');
    await expect(errorMessage).toBeVisible();

    console.log('Locked out user validation completed');
  });

});

