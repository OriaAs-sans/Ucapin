"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center px-6"
    >
      <div className="grid max-w-md gap-4 text-center">
        <h1 className="font-display text-3xl font-extrabold">Halaman ini gagal dimuat</h1>
        <p className="text-sm text-[var(--text-2)]">
          Server tidak merespons dengan benar. Coba muat ulang. Kalau masih gagal,
          kembali ke Beranda lalu buka halaman ini lagi.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Coba lagi</span>
          </Button>
          <Button asChild variant="surface">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
