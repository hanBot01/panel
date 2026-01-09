// Konfigurasi Jojo Store
// Edit file ini untuk ganti nomor admin, QRIS, atau daftar produk.

export const ADMIN_NUMBER = "6281313601538"; // contoh: 628xxxxxxxxxx (tanpa +)

// QRIS payload (string panjang)
export const QRIS_STRING = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214508257991305870303UMI51440014ID.CO.QRIS.WWW0215ID20232921284770303UMI5204541153033605802ID5920JOJO STORE OK13496366006CIAMIS61054621162070703A0163045679";

// Produk Panel (label akan tampil di dropdown)
export const PANEL_PACKAGES = [
  { value: "2gb", label: "2GB RAM", price: 2000 },
  { value: "3gb", label: "3GB RAM", price: 3000 },
  { value: "4gb", label: "4GB RAM", price: 4000 },
  { value: "5gb", label: "5GB RAM", price: 5000 },
  { value: "6gb", label: "6GB RAM", price: 6000 },
  { value: "7gb", label: "7GB RAM", price: 7000 },
  { value: "8gb", label: "8GB RAM", price: 8000 },
  { value: "9gb", label: "9GB RAM", price: 9000 },
  { value: "10gb", label: "10GB RAM", price: 10000 },
  { value: "unli", label: "Unlimited RAM", price: 9000 },
];

// Produk Premium
// - Jika price = 0 maka mode "Tanya Admin" (minta input nama aplikasi)
export const PREMIUM_PACKAGES = [
  { value: "netflix_privat", label: "Netflix Privat", price: 32000 },
  { value: "spotify", label: "Spotify Premium", price: 20000 },
  { value: "youtube", label: "YouTube Premium", price: 12000 },
  { value: "other", label: "Lainnya (Tanya Admin)", price: 0 },
];
