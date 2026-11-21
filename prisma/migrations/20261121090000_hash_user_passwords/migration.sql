-- Kata sandi sebelumnya tersimpan sebagai teks biasa dengan nilai default.
-- Kolom diganti nama, default dihapus, dan semua nilai lama dikosongkan
-- (hash kosong tidak pernah cocok), jadi akun lama perlu di-seed ulang atau daftar ulang.
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;
UPDATE "User" SET "passwordHash" = '';
