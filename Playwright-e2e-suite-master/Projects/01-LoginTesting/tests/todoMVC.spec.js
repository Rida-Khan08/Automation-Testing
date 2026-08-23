
const { test, expect } = require('@playwright/test');

test('Verify Todo List functionality', async ({ page }) => {

  // Navigate to the TodoMVC demo application
  await page.goto('https://demo.playwright.dev/todomvc/');

  // Verify page title
  await expect(page).toHaveTitle('React • TodoMVC');

  // Add first task
  await page.fill('.new-todo', 'Learn Playwright');
  await page.keyboard.press('Enter');

  // Add second task
  await page.fill('.new-todo', 'Learn Git');
  await page.keyboard.press('Enter');

  // Add third task
  await page.fill('.new-todo', 'Upload project to GitHub');
  await page.keyboard.press('Enter');

  // Verify three tasks have been created
  const todoItems = page.locator('.todo-list li');
  await expect(todoItems).toHaveCount(3);

  console.log('Total tasks created: 3');

  // Mark the first task as completed
  await todoItems.first().locator('.toggle').click();

  // Verify the first task is marked as completed
  await expect(todoItems.first().locator('.toggle')).toBeChecked();

  console.log('First task marked as completed successfully');
});

