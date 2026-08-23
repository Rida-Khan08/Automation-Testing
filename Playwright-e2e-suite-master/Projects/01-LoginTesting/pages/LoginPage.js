
const { expect } = require('@playwright/test');

class LoginPage {
 
    constructor(page) {
        this.page = page;
        
        // 1. SELECTORS (Locators)
        this.usernameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#login-button');
    }

    // 2. ACTIONS ( Methods)
    async enterUsername(username) {
        await this.usernameInput.fill(username);
    }

    // Enter Password function
    async enterPassword(password) {
        await this.passwordInput.fill(password);
    }

    // Press Login button function
    async clickLoginButton() {
        await this.loginButton.click();
    }

    //one time run login function (Shortcut)
    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }
}

// export file
module.exports = LoginPage;