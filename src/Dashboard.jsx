import { useAuth } from "./AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Dashboard</h2>
      <p>Signed in as {user.displayName || user.email}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}