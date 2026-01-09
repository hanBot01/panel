import { ADMIN_NUMBER, QRIS_STRING, PANEL_PACKAGES, PREMIUM_PACKAGES } from "./config.js";

// ---------- Helpers ----------
const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const formatIDR = (n) => currency.format(Number(n || 0));
const nowId = () => new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const HISTORY_KEY = "jojo_store_history_v3";

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function pushHistory(entry) {
  const items = getHistory();
  items.unshift(entry);
  setHistory(items);
}

function buildOption({ value, label, price }) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.dataset.price = String(price);
  opt.textContent = `${label} — ${formatIDR(price)}`;
  return opt;
}

// ---------- Toasts ----------
function toast(message, type = "info", timeout = 2800) {
  const wrap = $("#toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;

  const msg = document.createElement("div");
  msg.className = "msg";
  msg.textContent = message;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Tutup";
  btn.onclick = () => remove();

  el.append(msg, btn);
  wrap.appendChild(el);

  const remove = () => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 200);
  };

  requestAnimationFrame(() => el.classList.add("show"));
  window.setTimeout(remove, timeout);
}

// ---------- Theme ----------
function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// ---------- Tabs ----------
function setTab(tabName) {
  const tabs = $$(".tab");
  const sections = $$(".section");

  tabs.forEach((t) => {
    const active = t.dataset.tab === tabName;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });

  sections.forEach((s) => s.classList.toggle("is-active", s.dataset.section === tabName));

  moveIndicator();
  if (tabName === "history") renderHistory();
}

function moveIndicator() {
  const indicator = $(".tab-indicator");
  const active = $(".tab.is-active");
  if (!indicator || !active) return;
  const parent = active.parentElement;

  const parentRect = parent.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  const left = rect.left - parentRect.left;

  indicator.style.transform = `translateX(${left}px)`;
  indicator.style.width = `${rect.width}px`;
}

// ---------- Pricing UI ----------
function updatePanelTotal() {
  const select = $("#panelPackage");
  const opt = select?.selectedOptions?.[0];
  const price = opt?.dataset?.price ? Number(opt.dataset.price) : 0;
  $("#panelTotalPrice").textContent = formatIDR(price);
}

function updatePremiumTotal() {
  const select = $("#premPackage");
  const opt = select?.selectedOptions?.[0];
  const price = opt?.dataset?.price ? Number(opt.dataset.price) : 0;

  const noteGroup = $("#noteGroup");
  const badge = $("#premBadge");
  const total = $("#premTotalPrice");
  const btn = $("#btnPrem");

  // Default state (belum pilih)
  if (!select.value) {
    noteGroup.hidden = true;
    badge.textContent = "QRIS";
    total.textContent = formatIDR(0);
    btn.innerHTML = '<span class="btn-icon" aria-hidden="true">⚡</span>Beli Premium';
    return;
  }

  if (opt?.value === "other") {
    noteGroup.hidden = false;
    badge.textContent = "WA";
    total.textContent = "Tanya Admin";
    btn.innerHTML = '<span class="btn-icon" aria-hidden="true">💬</span>Tanya Admin WA';
  } else {
    noteGroup.hidden = true;
    badge.textContent = "QRIS";
    total.textContent = formatIDR(price);
    btn.innerHTML = '<span class="btn-icon" aria-hidden="true">⚡</span>Beli Premium';
  }
}


// ---------- Modal ----------
let lastFocus = null;

function openModal(payload) {
  const modal = $("#qrisModal");
  const img = $("#qrisImage");

  lastFocus = document.activeElement;

  // QR image (public QR generator)
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(QRIS_STRING)}`;
  img.style.opacity = "0.65";
  img.src = url;
  img.onload = () => (img.style.opacity = "1");

  // details
  $("#modalNominal").textContent = formatIDR(payload.price);
  $("#modalItem").textContent = payload.item || "-";
  $("#modalUser").textContent = payload.user || "-";

  // hide row if not relevant
  $("#modalUserRow").style.display = payload.type === "panel" ? "flex" : "none";

  const message = buildWhatsAppMessage(payload);
  const wa = `https://wa.me/${ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;
  const btnPaid = $("#btnPaid");
  btnPaid.href = wa;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  // focus first actionable
  setTimeout(() => btnPaid.focus(), 0);
}

function closeModal() {
  const modal = $("#qrisModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

function buildWhatsAppMessage(payload) {
  if (payload.type === "panel") {
    return (
      `Halo Admin, saya sudah transfer untuk Panel.\n\n` +
      `👤 Username: ${payload.user}\n` +
      `📦 Paket: ${payload.item}\n` +
      `💰 Nominal: ${formatIDR(payload.price)}\n\n` +
      `Mohon diproses, terima kasih.`
    );
  }

  return (
    `Halo Admin, saya sudah transfer untuk Premium.\n\n` +
    `📦 Paket: ${payload.item}\n` +
    `💰 Nominal: ${formatIDR(payload.price)}\n\n` +
    `Mohon diproses, terima kasih.`
  );
}

// ---------- Orders ----------
function processPanel() {
  const username = $("#panelUsername").value.trim();
  const select = $("#panelPackage");
  const opt = select?.selectedOptions?.[0];

  if (!username) {
    toast("Mohon isi username panel.", "error");
    $("#panelUsername").focus();
    return;
  }

  if (!opt || !opt.dataset.price) {
    toast("Pilih paket terlebih dahulu.", "error");
    select.focus();
    return;
  }

  const price = Number(opt.dataset.price);
  const item = opt.textContent.split(" — ")[0];

  const entry = {
    id: Date.now(),
    date: nowId(),
    type: "panel",
    user: username,
    item,
    price,
  };
  pushHistory(entry);
  $("#statusPill").textContent = "Menunggu bayar";

  openModal(entry);
}

function processPremium() {
  const select = $("#premPackage");
  const opt = select?.selectedOptions?.[0];

  if (!select.value) {
    toast("Pilih aplikasi terlebih dahulu.", "error");
    select.focus();
    return;
  }

  if (!opt) {
    toast("Pilih aplikasi terlebih dahulu.", "error");
    select.focus();
    return;
  }

  const item = opt.textContent.split(" — ")[0];
  const price = Number(opt.dataset.price || 0);

  // Tanya admin
  if (opt.value === "other" || price === 0) {
    const note = $("#premNote").value.trim();
    if (!note) {
      toast("Tulis nama aplikasi yang dicari.", "error");
      $("#premNote").focus();
      return;
    }

    const entry = {
      id: Date.now(),
      date: nowId(),
      type: "premium",
      user: "-",
      item: `Request Premium: ${note}`,
      price: 0,
    };
    pushHistory(entry);

    const msg = `Halo Admin, saya mau tanya harga premium.\n\n📝 Aplikasi: ${note}\nMohon infonya min, terima kasih.`;
    const wa = `https://wa.me/${ADMIN_NUMBER}?text=${encodeURIComponent(msg)}`;

    toast("Membuka WhatsApp admin...", "info");
    window.open(wa, "_blank", "noopener");
    return;
  }

  const entry = {
    id: Date.now(),
    date: nowId(),
    type: "premium",
    user: "-",
    item,
    price,
  };
  pushHistory(entry);
  $("#statusPill").textContent = "Menunggu bayar";

  openModal(entry);
}

// ---------- History UI ----------
function renderHistory() {
  const container = $("#historyContainer");
  const history = getHistory();

  container.innerHTML = "";
  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.innerHTML = `<div class="iconx">📭</div><div><b>Belum ada riwayat transaksi.</b></div><div style="margin-top:6px">Riwayat akan muncul setelah kamu membuat pesanan.</div>`;
    container.appendChild(empty);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "history-list";

  history.forEach((h) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const badge = h.type === "panel" ? "PANEL" : "PREMIUM";
    const user = h.type === "panel" ? `<div class="history-user">👤 User: <b>${escapeHtml(h.user)}</b></div>` : "";

    li.innerHTML = `
      <div class="history-top">
        <div class="history-date">${escapeHtml(h.date)}</div>
        <div class="history-badge">${badge}</div>
      </div>
      <div class="history-title">${escapeHtml(h.item)}</div>
      <div class="history-price">${h.price ? formatIDR(h.price) : "Tanya Admin"}</div>
      ${user}
    `;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clearHistory() {
  setHistory([]);
  renderHistory();
  toast("Riwayat berhasil dibersihkan.", "success");
}

function exportHistory() {
  const items = getHistory();
  if (!items.length) {
    toast("Tidak ada riwayat untuk diexport.", "warn");
    return;
  }

  const rows = [
    ["id", "date", "type", "user", "item", "price"],
    ...items.map((h) => [h.id, h.date, h.type, h.user, h.item, h.price]),
  ];

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `jojo-store-history-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);

  toast("Export berhasil (CSV).", "success");
}

// ---------- Boot ----------
function initUI() {
  // Year
  $("#footerYear").textContent = `© ${new Date().getFullYear()} All Rights Reserved`;

  // Theme
  initTheme();
  $("#themeBtn").addEventListener("click", toggleTheme);

  // Populate selects
  const panelSelect = $("#panelPackage");
  PANEL_PACKAGES.forEach((p) => panelSelect.appendChild(buildOption(p)));

  const premSelect = $("#premPackage");
  PREMIUM_PACKAGES.forEach((p) => premSelect.appendChild(buildOption(p)));

  // Pricing events
  panelSelect.addEventListener("change", updatePanelTotal);
  premSelect.addEventListener("change", updatePremiumTotal);

  // Buttons
  $("#btnPanel").addEventListener("click", processPanel);
  $("#btnPrem").addEventListener("click", processPremium);

  // Tabs
  $$(".tab").forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  window.addEventListener("resize", moveIndicator);
  moveIndicator();

  // History actions
  $("#btnClear").addEventListener("click", clearHistory);
  $("#btnExport").addEventListener("click", exportHistory);

  // Modal close
  const modal = $("#qrisModal");
  modal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.close === "true") closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Paid click feedback
  $("#btnPaid").addEventListener("click", () => {
    toast("Mengarah ke WhatsApp untuk konfirmasi...", "info", 2200);
    // biarkan WA terbuka, tapi modal bisa tetap ditutup kalau user balik
    setTimeout(() => {
      closeModal();
      $("#statusPill").textContent = "Terkirim";
    }, 600);
  });

  // Initial totals
  updatePanelTotal();
  updatePremiumTotal();

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => void 0);
  }
}

document.addEventListener("DOMContentLoaded", initUI);
