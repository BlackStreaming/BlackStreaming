import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardProvider from "./pages/DashboardProvider";
import DashboardAffiliate from "./pages/DashboardAffiliate";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute"; // Importa el componente de rutas protegidas
import { auth, db } from "./firebase"; // Firebase configuración
import { doc, getDoc } from "firebase/firestore";

function App() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "user");
          }
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
        }
      }
    };

    checkUserRole();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta protegida del Dashboard con detección automática del rol */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {role === "admin" ? <DashboardAdmin /> : 
             role === "provider" ? <DashboardProvider /> : 
             role === "affiliate" ? <DashboardAffiliate /> : 
             <DashboardUser />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;