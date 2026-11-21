import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-6">
      <div className="grid max-w-md gap-4 text-center">
        <p lang="en" className="font-ipa text-lg text-[var(--text-2)]">
          /peɪdʒ nɒt faʊnd/
        </p>
        <h1 className="font-display text-3xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="text-sm text-[var(--text-2)]">
          Alamat ini tidak ada atau sudah dipindah.
        </p>
        <Button asChild className="justify-self-center">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </main>
  );
}
