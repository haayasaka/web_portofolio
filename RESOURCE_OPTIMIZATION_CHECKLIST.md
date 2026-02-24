# Resource Optimization Checklist

Prioritas tinggi (impact terbesar pada bandwidth / startup):

- `resources/models/macbookpro.glb` (~9.43 MB)
  - Kompres mesh dengan Meshopt/Draco.
  - Jika ada texture besar di dalam GLB, kompres ke KTX2/BasisU.
  - Target awal: `< 3-5 MB`.

- `public/penugasan.mp4` (~9.37 MB)
  - Re-encode H.264 (CRF lebih tinggi / bitrate lebih rendah) atau sediakan varian resolusi lebih kecil untuk mobile.
  - Tambahkan poster frame jika perlu UX cepat.
  - Target awal: `< 3-5 MB`.

- `resources/video/animation.mp4` (~6.03 MB)
  - Re-encode untuk menurunkan bitrate (karena dipakai 2 video elements di HeroVideoSection).
  - Jika durasi pendek/loop, pertimbangkan resize resolusi.
  - Target awal: `< 2-3 MB`.

Prioritas tinggi (SVG besar tapi raster-embedded):

- `resources/prestasi/arshantara-logo.svg` (~3.69 MB)
  - File SVG berisi `data:image/...` (embedded raster).
  - Pilihan:
    - Re-export sebagai SVG vector murni dari sumber desain, atau
    - Ganti ke `WebP/PNG` jika memang bukan vector.

- `resources/herovideo/himakom.svg` (~1.29 MB)
  - SVG raster-embedded. Re-export vector murni atau ganti format raster terkompresi.

- `resources/herovideo/himakom-masking.svg` (~660 KB)
  - SVG raster-embedded. Karena dipakai sebagai mask, re-export shape vector murni sangat disarankan.

Prioritas menengah (portofolio logos):

- `resources/portofolio/artech_logo.svg` (~594 KB)
- `resources/portofolio/smariga.svg` (~270 KB)
- `resources/portofolio/presensi_eskul.svg` (~158 KB)
- `resources/portofolio/logo_jtk.svg` (~142 KB)
- `resources/portofolio/reveliora.svg` (~95 KB)
- `resources/portofolio/lucyphora.svg` (~64 KB)
  - Semua terdeteksi sebagai SVG dengan raster embedded.
  - Re-export vector murni (jika logo asli vector) atau convert ke `WebP/PNG`.
  - Untuk carousel, ukuran visual kecil -> raster terkompresi sering lebih efisien.

Prioritas menengah (gambar PNG):

- `resources/prestasi/mapres-photo.png` (~627 KB)
  - Coba convert ke `WebP` (quality ~75-85) atau AVIF.
  - PNG untuk foto biasanya boros.

Catatan:

- `src/data/specAssets.ts` masih mengarah ke `resources/layouts/*` yang saat ini tidak ada di workspace.
- Build saat ini tetap sukses karena file tersebut tidak sedang dipakai, tetapi sebaiknya dihapus atau diperbarui jika fitur lama akan dipakai lagi.
