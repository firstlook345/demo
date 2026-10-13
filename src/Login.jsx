import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login, signup, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await action();
      navigate("/");
    } catch (err) {
      setError(err.code || err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    run(() => (isSignup ? signup(email, password) : login(email, password)));
  }

  async function handleReset() {
    setError("");
    setMessage("");
    if (!email) return setError("Enter your email first.");
    try {
      await resetPassword(email);
      setMessage("Password reset email sent.");
    } catch (err) {
      setError(err.code || err.message);
    }
  }

  return (
    <div className="auth-page">
      <style>{`
        .auth-page {
          position: fixed;
          inset: 0;
          overflow-y: auto;
          display: flex;
          padding: 20px;
          background: #f3f4f6;
        }
        .auth-page * { box-sizing: border-box; }
        .auth-card {
          width: 100%;
          max-width: 400px;
          margin: auto;            /* centers on desktop, safe on short screens */
          padding: 36px 32px;
          text-align: left;
        }
        .auth-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .auth-primary:hover:not(:disabled) { background: #1d4ed8; }
        .auth-google:hover:not(:disabled) { background: #f9fafb; }
        .auth-link:hover:not(:disabled) { text-decoration: underline; }
        .auth-primary:disabled, .auth-google:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Tablets */
        @media (max-width: 768px) {
          .auth-card { max-width: 440px; }
        }
        /* Phones */
        @media (max-width: 480px) {
          .auth-page { padding: 12px; background: #ffffff; }
          .auth-card { padding: 24px 16px; box-shadow: none !important; }
          .auth-input { font-size: 16px !important; } /* stops iOS zoom on focus */
        }
      `}</style>

      <div className="auth-card" style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p style={styles.subtitle}>
            {isSignup
              ? "Sign up to start your PC build request"
              : "Log in to continue to your account"}
          </p>
        </div>

        {/* Alerts */}
        {error && <div style={styles.errorBox}>{error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        {/* Email / password form */}
        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="email">Email address</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            className="auth-input"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          {!isSignup && (
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <button
                type="button"
                className="auth-link"
                onClick={handleReset}
                style={styles.linkButton}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="auth-primary"
            disabled={busy}
            style={{ ...styles.primaryButton, marginTop: isSignup ? 8 : 0 }}
          >
            {busy ? "Please wait..." : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="auth-google"
          onClick={() => run(loginWithGoogle)}
          disabled={busy}
          style={styles.googleButton}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        {/* Toggle login / signup */}
        <p style={styles.toggleText}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setMessage("");
            }}
            style={{ ...styles.linkButton, fontWeight: 600 }}
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  header: { textAlign: "center", marginBottom: 24 },
  title: { margin: "0 0 6px", fontSize: 24, color: "#111827" },
  subtitle: { margin: 0, fontSize: 14, color: "#6b7280" },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "11px 12px",
    marginBottom: 16,
    fontSize: 15,
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
  },
  primaryButton: {
    width: "100%",
    padding: "12px 0",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  googleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "11px 0",
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine: { flex: 1, height: 1, background: "#e5e7eb" },
  dividerText: { fontSize: 13, color: "#9ca3af" },
  linkButton: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#2563eb",
    fontSize: 14,
    cursor: "pointer",
  },
  toggleText: {
    margin: "22px 0 0",
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  errorBox: {
    marginBottom: 16,
    padding: "10px 12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#b91c1c",
    fontSize: 14,
  },
  successBox: {
    marginBottom: 16,
    padding: "10px 12px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    color: "#15803d",
    fontSize: 14,
  },
};