// Akun testing hanya untuk pengembangan lokal. Email dan sandinya dibaca dari
// .env.local, tidak pernah ditulis di kode.
export const TEST_ACCOUNT_IDS = {
  fresh: "learner-baru",
  active: "learner-alya",
} as const;

const ALL_TEST_ACCOUNT_IDS: readonly string[] = Object.values(TEST_ACCOUNT_IDS);

export function isTestAccountId(id: string): boolean {
  return ALL_TEST_ACCOUNT_IDS.includes(id);
}

export function testAccountsEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_TEST_ACCOUNTS === "true"
  );
}

export function readTestAccountCredentials(): {
  freshEmail: string;
  activeEmail: string;
  password: string;
} {
  const freshEmail = process.env.TEST_ACCOUNT_NEW_EMAIL?.trim().toLowerCase();
  const activeEmail = process.env.TEST_ACCOUNT_ACTIVE_EMAIL?.trim().toLowerCase();
  const password = process.env.TEST_ACCOUNT_PASSWORD;

  const missing = [
    !freshEmail && "TEST_ACCOUNT_NEW_EMAIL",
    !activeEmail && "TEST_ACCOUNT_ACTIVE_EMAIL",
    !password && "TEST_ACCOUNT_PASSWORD",
  ].filter(Boolean);

  if (missing.length > 0 || !freshEmail || !activeEmail || !password) {
    throw new Error(
      `Isi ${missing.join(", ")} di .env.local sebelum menjalankan seed. Lihat .env.example.`
    );
  }
  if (password.length < 8) {
    throw new Error("TEST_ACCOUNT_PASSWORD minimal 8 karakter.");
  }

  return { freshEmail, activeEmail, password };
}
