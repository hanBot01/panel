// QRisku API client
// Endpoint: POST https://qrisku.my.id/api
// Body: { amount: "10000", qris_statis: "..." }
// Response: { status: "success", qris_base64: "..." }

const ENDPOINT = "https://qrisku.my.id/api";
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

  const key = `${amt}|${qrisStatis.length}`;
  if (cache.has(key)) return cache.get(key);

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

  cache.set(key, src);
  return src;
}

function normalizeAmount(v) {
  const n = Math.round(Number(v || 0));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Nominal tidak valid.");
  return String(n);
}
