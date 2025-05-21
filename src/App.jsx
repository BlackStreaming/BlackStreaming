import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext"; // Importar el AuthProvider que creamos
import { ThemeProvider } from "./pages/Home"; // Asegúrate de que ThemeProvider esté disponible
import ProtectedRoute from "./pages/ProtectedRoute"; // Asegúrate de que esté en la carpeta pages
import HomeWithTheme from "./pages/Home";
import LoginWithTheme from "./pages/Login";
import RegisterWithTheme from "./pages/register"; // Asegúrate de que Register también use ThemeProvider
import DashboardUser from "./pages/DashboardUser";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardAffiliate from "./pages/DashboardAffiliate";
import DashboardProvider from "./pages/DashboardProvider";
import NotFound from "./pages/NotFound"; // Asegúrate de que NotFound también use ThemeProvider si es necesario

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Rutas públicas (no requieren autenticación) */}
            <Route path="/login" element={<LoginWithTheme />} />
            <Route path="/register" element={<RegisterWithTheme />} />

            {/* Rutas protegidas (requieren autenticación) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeWithTheme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/affiliate"
              element={
                <ProtectedRoute>
                  <DashboardAffiliate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/provider"
              element={
                <ProtectedRoute>
                  <DashboardProvider />
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto para 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;