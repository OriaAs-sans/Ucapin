import { expect, test } from "@playwright/test";
import { readLocalEnv } from "./env";

const env = readLocalEnv();

test("tanpa sesi diarahkan ke halaman masuk", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/masuk$/);
  await expect(page.getByRole("heading", { name: "Masuk ke Ucapin" })).toBeVisible();
});

test("sandi salah menampilkan pesan error yang jelas", async ({ page }) => {
  test.skip(!env.TEST_ACCOUNT_ACTIVE_EMAIL, "Akun testing belum diatur di .env.local");
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(env.TEST_ACCOUNT_ACTIVE_EMAIL);
  await page.getByLabel("Kata sandi").fill("sandi-yang-salah");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveText("Email atau kata sandi tidak cocok.");
});

test("daftar akun baru lalu masuk ke onboarding, lalu keluar", async ({ page }) => {
  await page.goto("/masuk");
  await page.getByRole("tab", { name: "Daftar" }).click();
  await page.getByLabel("Nama panggilan").fill("Tes Otomatis");
  await page.getByLabel("Email").fill(`tes.${Date.now()}@contoh.local`);
  await page.getByLabel("Kata sandi").fill("sandi-uji-panjang");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Daftar dan pilih tujuan" }).click();
  await expect(page).toHaveURL(/\/mulai$/);

  const res = await page.request.post("/api/v1/auth/logout");
  expect(res.ok()).toBeTruthy();
  await page.goto("/");
  await expect(page).toHaveURL(/\/masuk$/);
});

test("pendaftaran tanpa persetujuan suara ditolak", async ({ page }) => {
  await page.goto("/masuk");
  await page.getByRole("tab", { name: "Daftar" }).click();
  await page.getByLabel("Nama panggilan").fill("Tanpa Setuju");
  await page.getByLabel("Email").fill(`tanpa.${Date.now()}@contoh.local`);
  await page.getByLabel("Kata sandi").fill("sandi-uji-panjang");
  await page.getByRole("button", { name: "Daftar dan pilih tujuan" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("persetujuan");
});
