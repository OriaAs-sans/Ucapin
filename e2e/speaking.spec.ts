import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { FAKE_MIC_META, FAKE_MIC_WAV, readLocalEnv } from "./env";

const env = readLocalEnv();
const hasAudio = fs.existsSync(FAKE_MIC_WAV) && fs.existsSync(FAKE_MIC_META);
const meta = hasAudio
  ? (JSON.parse(fs.readFileSync(FAKE_MIC_META, "utf8")) as { reference: string; speechMs: number })
  : { reference: "", speechMs: 0 };

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

test.skip(
  !hasAudio || !env.TEST_ACCOUNT_ACTIVE_EMAIL,
  "Butuh akun testing di .env.local (audio uji dibuat otomatis oleh global-setup)"
);

async function loginActive(page: Page) {
  // Isi ulang akun testing agar progres bab selalu mulai dari nol.
  const reset = await page.request.post("/api/v1/auth/reset", { data: { userId: "learner-alya" } });
  expect(reset.ok()).toBeTruthy();
  const login = await page.request.post("/api/v1/auth/login", {
    data: { email: env.TEST_ACCOUNT_ACTIVE_EMAIL, password: env.TEST_ACCOUNT_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();
}

async function recordOnce(page: Page) {
  await page.getByRole("button", { name: "Mulai merekam ucapan" }).click();
  await expect(page.getByText(/Merekam\.\.\./)).toBeVisible();
  await page.waitForTimeout(meta.speechMs + 600);
  await page.getByRole("button", { name: "Berhenti merekam dan nilai ucapan" }).click();
  await expect(page.getByRole("heading", { name: "Hasil penilaian suaramu" })).toBeVisible({
    timeout: 30_000,
  });
}

// Server E2E memakai SPEECH_MOCK="salah-ucap": satu kata di kalimat acuan diganti dengan pola
// salah ucap khas Indonesia, jadi hasil penilaian bisa dipastikan tanpa memanggil ElevenLabs.
test("rekam ucapan lalu satu salah ucap khas Indonesia ditandai", async ({ page }) => {
  await loginActive(page);
  await page.goto("/latihan-ucapan?bab=kerja-A2");
  await expect(page.locator("[data-sentence-text]").first()).toHaveAttribute(
    "data-sentence-text",
    meta.reference
  );
  await recordOnce(page);
  await expect(page.getByText(/Transkrip terdeteksi/)).toBeVisible();
  await expect(page.getByText(/Mode uji \(salah-ucap\)/)).toBeVisible();
  await expect(page.getByText(/Ulang · \/(v|θ|ð|ʃ)\/ (akhir )?jadi \/\w\//).first()).toBeVisible();
});

test("bab terkunci tidak bisa dibuka lewat URL", async ({ page }) => {
  await loginActive(page);
  await page.goto("/latihan-ucapan?bab=kerja-B1");
  await expect(page).toHaveURL(/terkunci=1/);
  await expect(page.getByText("Bab itu masih terkunci.", { exact: false })).toBeVisible();
});

test("menyelesaikan satu bab membuka bab berikutnya", async ({ page }) => {
  test.setTimeout(180_000);
  await loginActive(page);
  await page.goto("/latihan-ucapan?bab=kerja-A2");

  for (let i = 0; i < 5; i++) {
    await recordOnce(page);
    if (i < 4) await page.getByRole("button", { name: "Kalimat berikutnya" }).click();
  }

  await page.getByRole("button", { name: "Selesaikan bab" }).click();
  await expect(page).toHaveURL(/\/hasil\?sessionId=.+&bab=selesai/, { timeout: 30_000 });
  await expect(page.getByText("Bab selesai. Bab berikutnya di jalur ini sudah terbuka.")).toBeVisible();

  await page.goto("/latihan-ucapan");
  const kerja = page.locator("section", { has: page.getByRole("heading", { name: "Wawancara & Kerja" }) });
  await expect(kerja.getByText("1 dari 3 bab selesai")).toBeVisible();
  await expect(kerja.getByRole("link", { name: /Bab 2/ })).toBeVisible();
});
