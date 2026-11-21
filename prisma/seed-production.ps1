# Isi ulang MATERI (kalimat drill, skenario roleplay, panduan fonem) di database production.
# Data pengguna (akun, sesi, Bank Kesalahan, progres bab) tidak disentuh.
#
# Cara pakai (PowerShell, dari folder project):
#   powershell -ExecutionPolicy Bypass -File prisma\seed-production.ps1
#
# Skrip ini tidak menyimpan URL atau sandi ke file, dan input sandi tidak muncul di layar
# maupun di riwayat terminal.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Seed materi Ucapin ke database PRODUCTION" -ForegroundColor Cyan
Write-Host "1. Buka Supabase > Connect > Session pooler, lalu salin (Ctrl+C atau tombol copy)"
Write-Host "   URL-nya apa adanya, yang masih berisi [YOUR-PASSWORD]."
Write-Host "   Tidak perlu ditempel di sini: skrip membaca URL langsung dari clipboard."
Write-Host ""

# Tempel (Ctrl+V) sering tidak berfungsi saat skrip dijalankan lewat npm, jadi URL diambil
# dari clipboard. URL ini belum berisi sandi, jadi aman ditampilkan host-nya.
$template = ""
while (-not $template.StartsWith("postgres")) {
    [void](Read-Host "Setelah URL disalin, tekan Enter")
    $template = ((Get-Clipboard | Select-Object -First 1) -as [string])
    $template = if ($template) { $template.Trim() } else { "" }
    if (-not $template.StartsWith("postgres")) {
        Write-Host "Clipboard belum berisi URL database (harus diawali postgresql://). Salin lagi dari Supabase, lalu tekan Enter." -ForegroundColor Yellow
    }
}
Write-Host "URL terbaca dari clipboard." -ForegroundColor Green

$secure = Read-Host "Ketik sandi database (tidak akan terlihat)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if (-not $password) {
    Write-Host "Sandi kosong. Dibatalkan." -ForegroundColor Red
    exit 1
}

# Karakter khusus di sandi (@ # / ? ! dan lainnya) harus di-encode agar URL tetap valid.
$encoded = [uri]::EscapeDataString($password)
if ($template.Contains("[YOUR-PASSWORD]")) {
    $url = $template.Replace("[YOUR-PASSWORD]", $encoded)
} else {
    Write-Host "URL tidak berisi [YOUR-PASSWORD]. Salin ulang URL asli dari Supabase. Dibatalkan." -ForegroundColor Red
    exit 1
}

# Seed lewat Session pooler (port 5432). Transaction pooler (6543) tidak cocok untuk skrip ini.
$url = $url -replace ":6543/", ":5432/"
$url = $url -replace "[?&]pgbouncer=true", ""

$target = [uri]$url
if ($target.Host -match "^(127\.0\.0\.1|localhost)$" -or $target.Host -notmatch "supabase\.com$") {
    Write-Host "Host '$($target.Host)' bukan database Supabase. Dibatalkan." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Target: $($target.Host) port $($target.Port), database $($target.AbsolutePath.TrimStart('/'))"
$answer = Read-Host "Isi ulang materi di database ini? Ketik YA untuk lanjut"
if ($answer -cne "YA") {
    Write-Host "Dibatalkan, tidak ada yang diubah."
    exit 0
}

try {
    $env:DATABASE_URL = $url
    $env:DIRECT_URL = $url
    npm run db:seed:content
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Seed gagal (lihat pesan di atas). Database production tidak berubah atau berubah sebagian; jalankan ulang setelah masalahnya beres." -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "Selesai." -ForegroundColor Green
} finally {
    Remove-Item Env:DATABASE_URL, Env:DIRECT_URL -ErrorAction SilentlyContinue
    $url = $null
    $password = $null
    $encoded = $null
}
