
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo Shopping Cart Functionality', () => {

  test('Verify user can add a product to the shopping cart', async ({ page }) => {
    console.log('Executing Test: Add Product to Cart');

    // Navigate to SauceDemo application
    await page.goto('https://www.saucedemo.com/');

    // Login with valid credentials
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify successful login
    await expect(page).toHaveURL(/inventory/);
    console.log('Login completed successfully');

    // Add Sauce Labs Backpack to the cart
    await page.click('#add-to-cart-sauce-labs-backpack');
    console.log('Product added to cart');

    // Open the shopping cart
    await page.click('.shopping_cart_link');

    // Verify cart page is displayed
    await expect(page).toHaveURL(/cart/);

    // Verify product is present in the cart
    const cartItem = page.locator('.cart_item');
    await expect(cartItem).toBeVisible();

    console.log('Product successfully added to the shopping cart');
  });

});

