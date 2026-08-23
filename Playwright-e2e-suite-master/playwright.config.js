// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'basic-tests',
      testDir: './tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'login-testing-suite',
      testDir: './Projects/01-LoginTesting/tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
