class TodoPage {
  constructor(page) {
    this.page = page;
    this.todoInput = page.locator('.new-todo');
    this.todoItems = page.locator('.todo-list li');
    this.todoCount = page.locator('.todo-count');
    this.clearCompletedButton = page.locator('.clear-completed');
    this.toggleAllButton = page.locator('.toggle-all');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  async addTodo(title) {
    await this.todoInput.fill(title);
    await this.todoInput.press('Enter');
  }

  async toggleTodo(index) {
    await this.todoItems.nth(index).locator('.toggle').check();
  }

  async deleteTodo(index) {
    const item = this.todoItems.nth(index);
    await item.hover();
    await item.locator('.destroy').click();
  }

  async editTodo(index, newTitle) {
    const item = this.todoItems.nth(index);
    await item.dblclick();
    await item.locator('.edit').fill(newTitle);
    await item.locator('.edit').press('Enter');
  }

  async filterBy(name) {
    await this.page.locator('.filters a', { hasText: name }).click();
  }
}

module.exports = TodoPage;
