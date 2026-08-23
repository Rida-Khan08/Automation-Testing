const { test, expect } = require('@playwright/test');

test('Todo List App Test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');
  
  const title = await page.title();
  expect(title).toBe('React • TodoMVC');
  
  await page.fill('.new-todo', 'Seekhna Playwright');
  await page.keyboard.press('Enter');
  
  await page.fill('.new-todo', 'Git seekhna hai');
  await page.keyboard.press('Enter');
  
 
  await page.fill('.new-todo', 'GitHub pe upload karna hai');
  await page.keyboard.press('Enter');
  
  
  await page.waitForTimeout(2000);
  
  const todoCount = await page.locator('.todo-list li').count();
  console.log('Total tasks:', todoCount);
  expect(todoCount).toBe(3);
  
  
  await page.locator('.todo-list li').first().locator('.toggle').click();
  
  const firstTodo = await page.locator('.todo-list li').first();
  const isCompleted = await firstTodo.locator('.toggle').isChecked();
  expect(isCompleted).toBe(true);
  
});
