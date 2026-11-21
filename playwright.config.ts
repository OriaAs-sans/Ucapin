import { defineConfig, devices } from "@playwright/test";

// Tes E2E memakai dev server lokal dan database Laragon. Jalankan: npm run test:e2e
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/masuk",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
