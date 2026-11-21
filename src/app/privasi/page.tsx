import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi · Ucapin",
  description: "Data apa yang dikumpulkan Ucapin, untuk apa, dan hak kamu atas data tersebut.",
};

// DRAF: bagian bertanda [ISI: ...] wajib dilengkapi dan ditinjau pemilik layanan sebelum rilis.
function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded-[4px] bg-[var(--almost-wash)] px-1 font-bold text-[var(--almost-text)]">
      [ISI: {children}]
    </mark>
  );
}

export default function PrivasiPage() {
  return (
    <main id="main-content" className="mx-auto max-w-[68ch] px-5 py-10 leading-relaxed">
      <Link href="/masuk" className="text-sm font-semibold text-[var(--link)] underline">
        Kembali ke Ucapin
      </Link>
      <h1 className="mt-4 font-display text-4xl font-extrabold">Kebijakan Privasi</h1>
      <p className="mt-2 text-sm text-[var(--text-2)]">
        Berlaku sejak <Placeholder>tanggal berlaku</Placeholder>. Disusun mengacu pada UU No. 27
        Tahun 2022 tentang Pelindungan Data Pribadi.
      </p>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Siapa pengelola datamu</h2>
        <p>
          Pengendali data pribadi untuk layanan Ucapin adalah <Placeholder>nama perorangan atau
          badan usaha</Placeholder>, beralamat di <Placeholder>alamat</Placeholder>. Pertanyaan
          dan permintaan terkait data bisa dikirim ke <Placeholder>email kontak privasi</Placeholder>.
        </p>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Data yang kami kumpulkan</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Akun:</strong> nama panggilan, email, dan kata sandi (disimpan dalam bentuk
            hash, tidak bisa dibaca siapa pun).
          </li>
          <li>
            <strong>Preferensi belajar:</strong> tujuan, level, target menit harian, waktu
            koreksi, dan pilihan ikut liga beserta nama panggilan liga.
          </li>
          <li>
            <strong>Hasil latihan:</strong> transkrip ucapan per kalimat, skor, kata di Bank
            Kesalahan, dan durasi setiap rekaman.
          </li>
          <li>
            <strong>Cookie:</strong> hanya cookie sesi untuk menjaga kamu tetap masuk, dan
            pilihan tema di perangkatmu. Tidak ada cookie iklan atau pelacak pihak ketiga.
          </li>
        </ul>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Rekaman suara</h2>
        <p>
          Rekaman suaramu adalah data pribadi. Setiap rekaman dikirim ke layanan pengenal suara{" "}
          <strong>ElevenLabs</strong> hanya untuk diubah menjadi teks dan dinilai kejelasannya.
          Ucapin <strong>tidak menyimpan audio rekaman</strong>; yang tersimpan hanya durasi dan
          hasil penilaiannya. ElevenLabs memproses data di luar Indonesia, sehingga pemrosesan ini
          termasuk transfer data pribadi lintas negara. Ketentuan penyimpanan di pihak ElevenLabs:{" "}
          <Placeholder>ringkasan ketentuan retensi ElevenLabs sesuai paket yang dipakai</Placeholder>.
        </p>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Pihak yang memproses data</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Supabase: basis data dan autentikasi, server di Singapura.</li>
          <li>Vercel: hosting aplikasi.</li>
          <li>ElevenLabs: pengenal suara dan suara contoh.</li>
        </ul>
        <p>Data tidak dijual dan tidak dipakai untuk iklan.</p>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Lama penyimpanan</h2>
        <p>
          Data disimpan selama akunmu aktif. Setelah akun dihapus, data dihapus dari basis data
          utama saat itu juga, dan dari cadangan dalam <Placeholder>jangka waktu cadangan</Placeholder>.
        </p>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Hakmu</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Mengakses dan mengunduh data:</strong> menu Tujuan &amp; Target, bagian Data
            &amp; privasi, tombol Unduh semua dataku.
          </li>
          <li>
            <strong>Menghapus akun dan semua data:</strong> di bagian yang sama, tombol Hapus akun.
          </li>
          <li>
            <strong>Memperbaiki data dan menarik persetujuan:</strong> ubah preferensi kapan saja,
            atau hubungi <Placeholder>email kontak privasi</Placeholder>.
          </li>
        </ul>
      </section>

      <section className="mt-8 grid gap-3">
        <h2 className="font-display text-2xl font-bold">Pengguna di bawah umur</h2>
        <p>
          <Placeholder>batas usia minimum dan ketentuan persetujuan orang tua/wali</Placeholder>
        </p>
      </section>
    </main>
  );
}
