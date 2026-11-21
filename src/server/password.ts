import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Format tersimpan: scrypt$<salt base64>$<hash base64>. Sandi asli tidak pernah disimpan.
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export const MIN_PASSWORD_LENGTH = 8;

function deriveKey(plain: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, keyLength, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(plain, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [algorithm, saltB64, keyB64] = stored.split("$");
  if (algorithm !== "scrypt" || !saltB64 || !keyB64) return false;

  const expected = Buffer.from(keyB64, "base64");
  const actual = await deriveKey(plain, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Dipakai saat email tidak ditemukan, agar waktu respons sama dengan saat sandi salah.
let dummyHash: Promise<string> | null = null;

export async function burnPasswordCheck(plain: string): Promise<void> {
  dummyHash ??= hashPassword(randomBytes(12).toString("base64"));
  await verifyPassword(plain, await dummyHash);
}
