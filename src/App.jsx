import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/register";
import DashboardUser from "./pages/DashboardUser";
import DashboardProvider from "./pages/DashboardProvider";
import DashboardAffiliate from "./pages/DashboardAffiliate";
import DashboardAdmin from "./pages/DashboardAdmin";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Componente para manejar la lógica de navegación y rol
const AppContent = () => {
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Componente principal que envuelve todo en BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
