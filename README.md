# Web Portofolio

## 🧑‍💻 Author

**Hafiz FS** (hafizfs)

## 🔗 Link

_(Tautan hasil deploy akan diletakkan di sini, contoh:
`https://web-portofolio.deno.dev` atau `https://hafizfs.pages.dev`)_

## 🛠 Tech Stack

Proyek portofolio ini dibangun menggunakan teknologi-teknologi modern berikut:

- **Vue.js 3** (Composition API framework)
- **Vite** (Build Tool & Dev server transparan yang sangat cepat)
- **TypeScript** (Static typing agar source code mudah di-maintain)
- **Tailwind CSS** (Utility-first styling framework)
- **Three.js** (Rendering objek tiga dimensi berbasis WebGL)

---

## 🚀 Plan Deployment

Berikut adalah langkah-langkah untuk mendeploy aplikasi Vue + Vite ini. Karena
Anda me-_mention_ Deno Deploy dan Cloudflare Pages, saya buatkan panduan
mendetail untuk keduanya beserta langkah konfigurasi ekstensi domain (_Custom
Domain_):

### Opsi 1: Deployment ke Deno Deploy

Aplikasi _frontend_ Vite menghasilkan file statikal (`HTML, JS, CSS`) pada
folder `dist`. Deno Deploy berfokus pada eksekusi backend, sehingga kita perlu
membuat file web-server sederhana untuk menyajikan folder `dist` tersebut.

**Langkah 1: Buat Server Deno** Di dalam _root_ direktori proyek Anda, buat file
bernama `server.ts` dan masukkan kode berikut untuk menjadi server web mandiri
Deno:

```typescript
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

Deno.serve((req) => {
    return serveDir(req, {
        fsRoot: "dist", // Folder hasil build Vite
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
    });
});
```

**Langkah 2: Proses Build & Deploy** Deno Deploy saat ini tidak menjalankan
`npm run build` bawaan node secara otomatis. Oleh sebab itu, ada dua pendekatan:

- **Pendekatan Praktis:** Ubah aturan di `.gitignore` supaya folder `dist/` ikut
  dilacak Git. Jalankan `npm run build` di lokal Anda, lalu pastikan folder
  `dist` dan `server.ts` di-push ke GitHub.
- **Pendekatan Lanjut:** Gunakan GitHub Actions untuk menjalankan script _build_
  Vite dan otomatis mendeploy file yang ter-build tersebut menggunakan
  `deployctl` (CLI Deno Deploy).

**Langkah 3: Integrasi dengan Deno Deploy**

1. Buka [Deno Deploy Dashboard](https://deno.com/deploy) dan buat proyek (New
   Project).
2. Tautkan (Connect) ke repository GitHub Anda.
3. Sebagai titik awal (Entrypoint file), pilih file `server.ts` yang sudah Anda
   buat.
4. Simpan, dan proyek Anda akan tayang dengan domain bawaan Deno (misal:
   `web-portofolio.deno.dev`).

**Langkah 4: Setup Custom Domain di Deno Deploy**

1. Pada proyek di Deno Deploy, pilih tab **Settings** > **Domains**.
2. Klik **Add Domain** dan masukkan alamat web Anda (misal
   `portofolio.hafiz.com`).
3. Deno Deploy akan merespons dengan menampilkan _DNS Records_ (Tipe A, AAAA,
   atau CNAME).
4. Sematkan _record_ tersebut pada panel _DNS Management_ penyedia domain yang
   Anda gunakan.
5. Verifikasi akan memakan waktu sejenak dan sertifikat SSL akan dirilis secara
   gratis.

---

### Opsi 2: Deployment ke Cloudflare Pages

Ini adalah opsi _hosting_ yang lebih efisien karena dikhususkan untuk situs
statis, _frontend framework_, dan mendukung instalasi `Node/NPM build step`
secara _native_ di _server_ (tanpa file server.ts tambahan).

**Langkah 1: Konfigurasi di Dashboard Cloudflare**

1. Pastikan seluruh karya (Termasuk `.gitignore` terbaru agar direktori
   `/resources` tertangkap) sudah di-push ke GitHub.
2. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > menu
   **Workers & Pages**.
3. Buat aplikasi baru (**Create application**) > Arahkan ke tab **Pages** > klik
   **Connect to Git**.
4. Lakukan pengaturan _repository_ ke `web_portofolio`.
5. Di Set up builds and deployments, letakkan setelan ini:
   - **Framework preset:** `Vue`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Tekan **Save and Deploy**. Cloudflare bertugas membangun aplikasi Anda secara
   otomatis di Cloud-nya.

**Langkah 2: Setup Custom Domain di Cloudflare Pages**

1. Setelah status deployment berhasil, buka tab **Custom domains** pada rincian
   app.
2. Klik tombok biru **Set up a custom domain**.
3. Ketikkan nama _domain_ Anda (Misal `portofolio.hafiz.com`).
4. Klik **Continue**. Apabila DNS zone _domain_ itu dikelola oleh Cloudflare,
   proses sinkronisasi CNAME ditangani seketika. Jika dikelola provider lain,
   sistem Cloudflare menyajikan set _record CNAME/TXT_ untuk disematkan pada
   pengaturan DNS eksternal Anda.

Anda tinggal menunggu beberapa menit selagi SSL merambat, lalu proyek ini dapat
diakses secara publik.
