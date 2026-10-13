import { useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { firestoreDb, auth } from "./firebase.js"; // use the name your auth export has

const initialForm = {
  purpose: "gaming",
  budget: "",
  cpuBrand: "no-preference",
  gpuBrand: "no-preference",
  ram: "16",
  storage: "512",
  storageType: "nvme",
  caseSize: "mid-tower",
  rgb: false,
  wifi: false,
  notes: "",
};

export default function PCRequirementsForm() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.code || err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        ...form,
        budget: Number(form.budget),
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(firestoreDb, "requirements"), data);

      setSubmitted({ ...data, id: ref.id, createdAt: new Date().toISOString() });
    } catch (err) {
      setError(err.code || err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = { display: "block", width: "100%", marginBottom: 14, padding: 6 };
  const label = { display: "block", marginBottom: 4, fontWeight: 500 };

  const topBar = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        background: "#ffffff",
        boxShadow: "0 1px 6px rgba(0, 0, 0, 0.08)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <span style={{ color: "#374151", fontSize: 14 }}>
        {user?.displayName || user?.email}
      </span>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 18px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );

  if (submitted) {
    return (
      <>
        {topBar}
        <div
          style={{
            maxWidth: 480,
            margin: "60px auto",
            padding: "40px 32px",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Success icon */}
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#e6f7ec",
              color: "#22a05a",
              fontSize: 36,
              lineHeight: "72px",
            }}
          >
            ✓
          </div>

          <h2 style={{ margin: "0 0 8px", color: "#1f2937" }}>
            Your Requirement Successfully Sent
          </h2>

          <p style={{ margin: "0 0 28px", color: "#6b7280", fontSize: 15 }}>
            Thank you! We have received your details and will get back to you soon.
          </p>

          <button
            onClick={() => {
              setSubmitted(null);
              setForm(initialForm);
            }}
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Submit Another Requirement
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {topBar}
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}
      >
        <h2>PC build requirements</h2>

        <label style={label}>Main purpose</label>
        <select name="purpose" value={form.purpose} onChange={handleChange} style={field}>
          <option value="gaming">Gaming</option>
          <option value="office">Office / study</option>
          <option value="editing">Video / photo editing</option>
          <option value="programming">Programming</option>
          <option value="3d">3D / rendering</option>
          <option value="general">General use</option>
        </select>

        <label style={label}>Budget</label>
        <input
          type="number"
          name="budget"
          min="0"
          placeholder="Enter your total budget"
          value={form.budget}
          onChange={handleChange}
          required
          style={field}
        />

        <label style={label}>CPU preference</label>
        <select name="cpuBrand" value={form.cpuBrand} onChange={handleChange} style={field}>
          <option value="no-preference">No preference</option>
          <option value="intel">Intel</option>
          <option value="amd">AMD</option>
        </select>

        <label style={label}>Graphics card preference</label>
        <select name="gpuBrand" value={form.gpuBrand} onChange={handleChange} style={field}>
          <option value="no-preference">No preference</option>
          <option value="nvidia">NVIDIA</option>
          <option value="amd">AMD</option>
          <option value="integrated">Integrated (no dedicated card)</option>
        </select>

        <label style={label}>RAM</label>
        <select name="ram" value={form.ram} onChange={handleChange} style={field}>
          <option value="8">8 GB</option>
          <option value="16">16 GB</option>
          <option value="32">32 GB</option>
          <option value="64">64 GB</option>
        </select>

        <label style={label}>Storage</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select name="storage" value={form.storage} onChange={handleChange} style={field}>
            <option value="256">256 GB</option>
            <option value="512">512 GB</option>
            <option value="1000">1 TB</option>
            <option value="2000">2 TB</option>
          </select>
          <select name="storageType" value={form.storageType} onChange={handleChange} style={field}>
            <option value="nvme">NVMe SSD</option>
            <option value="sata">SATA SSD</option>
            <option value="hdd">HDD</option>
          </select>
        </div>

        <label style={label}>Cabinet size</label>
        <select name="caseSize" value={form.caseSize} onChange={handleChange} style={field}>
          <option value="mini-itx">Compact (Mini-ITX)</option>
          <option value="micro-atx">Small (Micro-ATX)</option>
          <option value="mid-tower">Standard (Mid tower)</option>
          <option value="full-tower">Large (Full tower)</option>
        </select>

        <label style={{ display: "block", marginBottom: 8 }}>
          <input type="checkbox" name="rgb" checked={form.rgb} onChange={handleChange} /> RGB lighting
        </label>
        <label style={{ display: "block", marginBottom: 14 }}>
          <input type="checkbox" name="wifi" checked={form.wifi} onChange={handleChange} /> Built-in Wi-Fi / Bluetooth
        </label>

        <label style={label}>Other notes</label>
        <textarea
          name="notes"
          rows={4}
          placeholder="Games or software you use, monitor, existing parts, etc."
          value={form.notes}
          onChange={handleChange}
          style={field}
        />
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button type="submit" disabled={saving} style={{ width: "100%", padding: 10 }}>
          {saving ? "Saving..." : "Submit requirements"}
        </button>
      </form>
    </>
  );
}