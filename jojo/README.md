# Jojo Store — Order App (Static)

Ini versi yang **UI-nya sudah dibagusin** (lebih modern, responsif, dan terasa seperti website profesional) + sudah **rapi strukturnya** supaya gampang di-maintain dan **siap deploy**.

## Struktur

- `index.html` — halaman utama
- `css/styles.css` — styling (Light/Dark)
- `js/config.js` — **semua konfigurasi** (nomor admin, QRIS, daftar produk & harga)
- `js/app.js` — logic UI (tabs, validasi, riwayat, QRIS modal, WhatsApp)
- `manifest.webmanifest` + `sw.js` — optional PWA (installable)

## Quick Edit (yang biasanya sering diganti)

Buka `js/config.js`:

- `ADMIN_NUMBER` → nomor WA admin (format `628xxx` tanpa `+`)
- `QRIS_STRING` → payload QRIS
- `PANEL_PACKAGES` & `PREMIUM_PACKAGES` → daftar paket + harga

## Jalankan Lokal

Karena ini static, kamu bisa langsung buka `index.html` di browser.

Kalau mau lebih “bener” (biar service worker/manifest jalan), pakai local server:

### Opsi A: Python

```bash
python -m http.server 8080
```
Buka `http://localhost:8080`.

### Opsi B: Node (http-server)

```bash
npx http-server -p 8080
```

## Deploy (paling gampang)

### Netlify / Cloudflare Pages
- Upload folder project ini
- Build command: **(kosong)**
- Publish directory: **`.`**

### GitHub Pages
- Push repo
- Set GitHub Pages ke branch `main` dan folder root

### Vercel
- Bisa deploy sebagai static site (tanpa build)

## Catatan
- QRIS image di-generate via `api.qrserver.com` (gratis). Kalau mau lebih “no dependency”, bisa ganti ke generator QR di backend sendiri.
- Riwayat transaksi tersimpan di browser (localStorage). Ada tombol **Export CSV** dan **Bersihkan**.

---

© Jojo Store
