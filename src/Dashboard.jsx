import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { firestoreDb } from "./firebase";

/* ---------- Label maps (turn stored values into readable text) ---------- */
const PURPOSE = {
  gaming: "Gaming",
  office: "Office / Study",
  editing: "Video / Photo Editing",
  programming: "Programming",
  "3d": "3D / Rendering",
  general: "General Use",
};
const BRAND = {
  "no-preference": "No preference",
  intel: "Intel",
  amd: "AMD",
  nvidia: "NVIDIA",
  integrated: "Integrated graphics",
};
const STORAGE_TYPE = { nvme: "NVMe SSD", sata: "SATA SSD", hdd: "HDD" };
const CASE = {
  "mini-itx": "Compact (Mini-ITX)",
  "micro-atx": "Small (Micro-ATX)",
  "mid-tower": "Standard (Mid tower)",
  "full-tower": "Large (Full tower)",
};

function formatStorage(gb) {
  const n = Number(gb);
  return n >= 1000 ? `${n / 1000} TB` : `${n} GB`;
}

function formatDate(ts) {
  const date = ts?.toDate?.();
  if (!date) return "Just now";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestoreDb, "requirements"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // newest first (sorted here so no Firestore index is needed)
        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER) -
            (a.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER)
        );
        setItems(list);
        setLoading(false);
      },
      (err) => {
        setError(err.code || err.message);
        setLoading(false);
      }
    );

    return unsubscribe; // stop listening when the page closes
  }, [user]);

  return (
    
    <div style={styles.page}>
      {/* Top bar */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>Dashboard</h1>
          <span style={styles.userText}>
            Signed in as {user.displayName || user.email}
          </span>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          Log out
        </button>
      </header>

      <main style={styles.main}>
        {/* Section heading + count */}
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>My PC requirements</h2>
          {!loading && !error && (
            <span style={styles.countBadge}>
              {items.length} {items.length === 1 ? "request" : "requests"}
            </span>
          )}
        </div>

        {loading && <p style={styles.status}>Loading your requirements...</p>}

        {error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={{ margin: 0, color: "#6b7280" }}>
              You haven't submitted any requirements yet.
            </p>
          </div>
        )}

        {/* Cards */}
        <div style={styles.grid}>
          {items.map((item) => (
            <article key={item.id} style={styles.card}>
              {/* Card header */}
              <div style={styles.cardHead}>
                <div>
                  <h3 style={styles.cardTitle}>
                    {PURPOSE[item.purpose] || item.purpose}
                  </h3>
                  <span style={styles.date}>{formatDate(item.createdAt)}</span>
                </div>
                <div style={styles.budget}>
                  {Number(item.budget).toLocaleString()}
                  <span style={styles.budgetLabel}>Budget</span>
                </div>
              </div>

              {/* Specs */}
              <div style={styles.specs}>
                <Spec label="CPU" value={BRAND[item.cpuBrand] || item.cpuBrand} />
                <Spec label="Graphics" value={BRAND[item.gpuBrand] || item.gpuBrand} />
                <Spec label="RAM" value={`${item.ram} GB`} />
                <Spec
                  label="Storage"
                  value={`${formatStorage(item.storage)} ${
                    STORAGE_TYPE[item.storageType] || item.storageType
                  }`}
                />
                <Spec label="Cabinet" value={CASE[item.caseSize] || item.caseSize} />
              </div>

              {/* Extras */}
              <div style={styles.tags}>
                <Tag on={item.rgb}>RGB lighting</Tag>
                <Tag on={item.wifi}>Wi-Fi / Bluetooth</Tag>
              </div>

              {/* Notes */}
              {item.notes && (
                <div style={styles.notes}>
                  <span style={styles.notesLabel}>Notes</span>
                  <p style={styles.notesText}>{item.notes}</p>
                </div>
              )}

              <div style={styles.cardFoot}>Request ID: {item.id}</div>
            </article>
          ))}
        </div>
      
      </main>
      
    </div>
    
  );
}

/* ---------- Small helper components ---------- */
function Spec({ label, value }) {
  return (
    <div style={styles.specRow}>
      <span style={styles.specLabel}>{label}</span>
      <span style={styles.specValue}>{value}</span>
    </div>
  );
}

function Tag({ on, children }) {
  return (
    <span
      style={{
        ...styles.tag,
        background: on ? "#e6f7ec" : "#f3f4f6",
        color: on ? "#15803d" : "#9ca3af",
      }}
    >
      {on ? "✓" : "✕"} {children}
    </span>
  );
}

/* ---------- Styles ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "16px 32px",
    background: "#ffffff",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.08)",
  },
  brand: { margin: 0, fontSize: 22, color: "#111827" },
  userText: { fontSize: 13, color: "#6b7280" },
  logoutBtn: {
    padding: "9px 20px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px 48px" },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: { margin: 0, fontSize: 20, color: "#111827" },
  countBadge: {
    padding: "4px 12px",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
  },
  status: { color: "#6b7280" },
  errorBox: {
    padding: "12px 14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#b91c1c",
    fontSize: 14,
  },
  emptyBox: {
    padding: "48px 20px",
    textAlign: "center",
    background: "#fff",
    borderRadius: 12,
    border: "1px dashed #d1d5db",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    padding: 24,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
    boxSizing: "border-box",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: { margin: "0 0 4px", fontSize: 18, color: "#111827" },
  date: { fontSize: 12, color: "#9ca3af" },
  budget: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: 20,
    fontWeight: 700,
    color: "#2563eb",
  },
  budgetLabel: { fontSize: 11, fontWeight: 500, color: "#9ca3af" },
  specs: { display: "flex", flexDirection: "column", gap: 10 },
  specRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
  },
  specLabel: { color: "#6b7280" },
  specValue: { color: "#111827", fontWeight: 500, textAlign: "right" },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: { padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500 },
  notes: { padding: 12, background: "#f9fafb", borderRadius: 8 },
  notesLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280" },
  notesText: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#374151",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  cardFoot: {
    marginTop: "auto",
    fontSize: 11,
    color: "#9ca3af",
    wordBreak: "break-all",
  },
};