// QRisku API client
// Endpoint: POST https://qrisku.my.id/api
// Body: { amount: "10000", qris_statis: "..." }
// Response: { status: "success", qris_base64: "..." }

const ENDPOINT = "https://qrisku.my.id/api";

// Cache untuk mengurangi request berulang pada nominal yang sama.
// Kalau kamu ingin *selalu* request tiap kali order, ganti `USE_CACHE` jadi false.
const USE_CACHE = true;
const cache = new Map();

/**
 * Return a QR image src usable by <img src="...">.
 * Uses API to generate QRIS image with nominal (amount).
 */
export async function getQrisImageSrc(amount, qrisStatis) {
  const amt = normalizeAmount(amount);
  if (!qrisStatis || typeof qrisStatis !== "string") {
    throw new Error("QRIS statis belum diisi.");
  }

  const key = `${amt}|${hashString(qrisStatis)}`;
  if (USE_CACHE && cache.has(key)) return cache.get(key);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amt,
      qris_statis: qrisStatis,
    }),
  });

  if (!res.ok) {
    throw new Error(`QRIS API HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data || data.status !== "success" || !data.qris_base64) {
    throw new Error((data && data.message) || "QRIS API gagal.");
  }

  const b64 = String(data.qris_base64).trim();
  const src = b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`;

  if (USE_CACHE) cache.set(key, src);
  return src;
}

function normalizeAmount(v) {
  const n = Math.round(Number(v || 0));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Nominal tidak valid.");
  return String(n);
}

// FNV-1a hash (ringan, cukup untuk key cache)
function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h.toString(16);
}
