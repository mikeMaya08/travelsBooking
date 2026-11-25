import { defineConfig } from '@playwright/test';

// Tests run against the deployed app. Override with BASE_URL to target another environment (e.g. local dev).
const baseURL = process.env.BASE_URL || 'https://travels-booking-opal.vercel.app';

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
});