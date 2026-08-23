const { test, expect } = require('@playwright/test');
const TodoPage = require('../pages/TodoPage');

const TODO_ITEMS = ['Buy milk', 'Write tests', 'Fix bugs'];

test.describe('TodoMVC - Add Todos', () => {

  test('Should add a single todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_ITEMS[0]);
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText(TODO_ITEMS[0]);
  });

  test('Should add multiple todos with counter', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    for (const item of TODO_ITEMS) await todoPage.addTodo(item);
    await expect(todoPage.todoItems).toHaveCount(3);
    await expect(todoPage.todoCount).toContainText('3 items left');
  });

  test('Should not add empty todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.todoInput.fill('   ');
    await todoPage.todoInput.press('Enter');
    await expect(todoPage.todoItems).toHaveCount(0);
  });
});

test.describe('TodoMVC - Complete & Delete', () => {

  test('Should mark todo completed and update counter', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_ITEMS[0]);
    await todoPage.addTodo(TODO_ITEMS[1]);
    await todoPage.toggleTodo(0);
    await expect(todoPage.todoCount).toContainText('1 item left');
  });

  test('Should delete a todo on hover', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_ITEMS[0]);
    await todoPage.addTodo(TODO_ITEMS[1]);
    await todoPage.deleteTodo(0);
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText(TODO_ITEMS[1]);
  });

  test('Should clear completed todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    for (const item of TODO_ITEMS) await todoPage.addTodo(item);
    await todoPage.toggleTodo(0);
    await todoPage.toggleTodo(2);
    await todoPage.clearCompletedButton.click();
    await expect(todoPage.todoItems).toHaveCount(1);
  });
});

test.describe('TodoMVC - Filters', () => {

  test('Should filter Active, Completed and All', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    for (const item of TODO_ITEMS) await todoPage.addTodo(item);
    await todoPage.toggleTodo(1);

    await todoPage.filterBy('Active');
    await expect(todoPage.todoItems).toHaveCount(2);

    await todoPage.filterBy('Completed');
    await expect(todoPage.todoItems).toHaveCount(1);

    await todoPage.filterBy('All');
    await expect(todoPage.todoItems).toHaveCount(3);
  });
});

test.describe('TodoMVC - Edit', () => {

  test('Should edit todo on double click', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(TODO_ITEMS[0]);
    await todoPage.editTodo(0, 'Updated title');
    await expect(todoPage.todoItems.first()).toContainText('Updated title');
  });
});
