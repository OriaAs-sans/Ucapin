// Ditampilkan saat halaman server sedang memuat data.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center px-6 text-center"
    >
      <div className="grid justify-items-center gap-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--line)] border-t-[var(--coral)] motion-reduce:animate-none"
        />
        <p className="text-sm font-semibold text-[var(--text-2)]">Menyiapkan latihanmu...</p>
      </div>
    </div>
  );
}
