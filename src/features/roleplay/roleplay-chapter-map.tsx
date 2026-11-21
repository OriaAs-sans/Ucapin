import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ChapterMap } from "@/components/shared/chapter-map";
import { Button } from "@/components/ui/button";
import type { ChapterPath } from "@/lib/chapters";

export function RoleplayChapterMap({
  paths,
  lockedNotice,
}: {
  paths: ChapterPath[];
  lockedNotice: boolean;
}) {
  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <Button asChild variant="surface" size="icon">
          <Link href="/" aria-label="Kembali ke Beranda">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Roleplay</h1>
          <p className="text-sm text-[var(--text-2)]">
            Setiap bab adalah satu percakapan. Jawab semua giliran untuk membuka bab
            berikutnya.
          </p>
        </div>
      </header>

      {lockedNotice && (
        <p
          role="status"
          className="rounded-control border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
        >
          Percakapan itu masih terkunci. Selesaikan bab sebelumnya di jalur yang sama dulu.
        </p>
      )}

      <ChapterMap paths={paths} unitLabel="giliran" />
    </AppShell>
  );
}
