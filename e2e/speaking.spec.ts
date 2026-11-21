import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { FAKE_MIC_META, FAKE_MIC_WAV, readLocalEnv } from "./env";

const env = readLocalEnv();
const hasAudio = fs.existsSync(FAKE_MIC_WAV);

test.use({
  launchOptions: {
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${FAKE_MIC_WAV}`,
    ],
  },
  permissions: ["microphone"],
});

test("rekam ucapan, nilai dengan pengenal suara, kata salah masuk Bank Kesalahan", async ({ page }) => {
  test.skip(
    !hasAudio || !env.TEST_ACCOUNT_ACTIVE_EMAIL,
    "Butuh ELEVENLABS_API_KEY dan akun testing di .env.local"
  );
  const { speechMs } = JSON.parse(fs.readFileSync(FAKE_MIC_META, "utf8")) as { speechMs: number };

  const login = await page.request.post("/api/v1/auth/login", {
    data: { email: env.TEST_ACCOUNT_ACTIVE_EMAIL, password: env.TEST_ACCOUNT_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/latihan-ucapan?goal=kerja");
  await expect(page.locator("[data-sentence-text]").first()).toHaveAttribute(
    "data-sentence-text",
    "I worked on five product launches and solved the main issue."
  );

  await page.getByRole("button", { name: "Mulai merekam ucapan" }).click();
  await expect(page.getByText(/Merekam\.\.\./)).toBeVisible();
  await page.waitForTimeout(speechMs + 600);
  await page.getByRole("button", { name: "Berhenti merekam dan nilai ucapan" }).click();

  await expect(page.getByRole("heading", { name: "Hasil penilaian suaramu" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Ulang · /t/ akhir hilang")).toBeVisible();
  await expect(page.getByText(/sudah otomatis dicatat ke/)).toContainText("worked");
});
