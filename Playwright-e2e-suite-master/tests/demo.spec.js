const { test, expect } = require('@playwright/test');

test('Todo List App Test', async ({ page }) => {
  // Step 1: Demo website open
  await page.goto('https://demo.playwright.dev/todomvc/');
  
  // Step 2: Check karo page title sahi hai
  const title = await page.title();
  expect(title).toBe('React • TodoMVC');
  
  // Step 3: Pehla task add karo
  await page.fill('.new-todo', 'Seekhna Playwright');
  await page.keyboard.press('Enter');
  
  // Step 4: Doosra task add karo
  await page.fill('.new-todo', 'Git seekhna hai');
  await page.keyboard.press('Enter');
  
  // Step 5: Teesra task add karo
  await page.fill('.new-todo', 'GitHub pe upload karna hai');
  await page.keyboard.press('Enter');
  
  // Step 6: Wait karo
  await page.waitForTimeout(2000);
  
  // Step 7: Check karo 3 tasks add ho gaye
  const todoCount = await page.locator('.todo-list li').count();
  console.log('Total tasks:', todoCount);
  expect(todoCount).toBe(3);
  
  // Step 8: Pehle task ko complete mark karo
  await page.locator('.todo-list li').first().locator('.toggle').click();
  
  // Step 9: Check karo pehla task complete ho gaya
  const firstTodo = await page.locator('.todo-list li').first();
  const isCompleted = await firstTodo.locator('.toggle').isChecked();
  expect(isCompleted).toBe(true);
  
});