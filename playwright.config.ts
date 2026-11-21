import { defineConfig, devices } from "@playwright/test";

// Tes E2E memakai dev server sendiri (port 3100) dan database Laragon. Jalankan: npm run test:e2e
// Server ini selalu memakai pengenal suara tiruan (SPEECH_MOCK), jadi tes tidak memakai kuota
// ElevenLabs. Folder build terpisah agar tidak bentrok dengan `npm run dev` di port 3000.
const E2E_PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev -p ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}/masuk`,
    env: { SPEECH_MOCK: "salah-ucap", NEXT_DIST_DIR: ".next-e2e" },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
