import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Dashboard from "./Dashboard";
import PCRequirementsForm from "./PCRequirementsForm";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* User Dashboard */}
          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* PC Requirements */}
          <Route
            path="/requirements"
            element={
              <ProtectedRoute>
                <PCRequirementsForm />
              </ProtectedRoute>
            }
          />

          {/* "/" and any unknown URL go to the user dashboard */}
          <Route path="*" element={<Navigate to="/userdashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}