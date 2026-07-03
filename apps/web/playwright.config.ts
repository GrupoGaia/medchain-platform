import { defineConfig, devices } from "playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.e2e\.ts/,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
