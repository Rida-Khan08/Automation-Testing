
const { test, expect } = require('@playwright/test');

// 1. Import (POM) 
const LoginPage = require('../pages/LoginPage');

test.describe('POM Login Test', () => {
  
  test('Verify login using Page Object Model', async ({ page }) => {
    console.log('Test Start: POM Login');
    
    const loginPage = new LoginPage(page);
    
    // 3.open  WEBSITE 
    await page.goto('https://www.saucedemo.com/');
 
    await loginPage.login('standard_user', 'secret_sauce');
   
    await page.waitForTimeout(2000);
    const title = await page.title();
    expect(title).toContain('Swag Labs');
    
    console.log(' POM Test Pass!');
  });
});