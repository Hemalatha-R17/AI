import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      // Traces to: RICE-POT C — auth mechanism: Bearer token placeholder
      ...(process.env.AUTH_TOKEN
        ? { Authorization: `Bearer ${process.env.AUTH_TOKEN}` }
        : {}),
    },
    ignoreHTTPSErrors: false,
  },

  projects: [
    {
      name: 'api-tests',
    },
  ],
});
