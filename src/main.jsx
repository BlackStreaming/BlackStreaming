import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Maintenance from "./pages/Maintenance"; // Nueva página de mantenimiento
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardAffiliate from "./pages/DashboardAffiliate";
import DashboardProvider from "./pages/DashboardProvider";
import DashboardAdmin from "./pages/DashboardAdmin";
import Netflix from "./categorías/Netflix";
import Disney from "./categorías/Disney";
import Max from "./categorías/Max";
import Spotify from "./categorías/Spotify";
import PrimeVideo from "./categorías/PrimeVideo";
import Vix from "./categorías/Vix";

const App = () => {
  const isMaintenance = false; // Cambiar a false para desactivar el mantenimiento

  return (
    <Routes>
      {isMaintenance ? (
        // Modo mantenimiento activado
        <>
          <Route path="*" element={<Maintenance />} />
          
          {/* Opcional: Rutas que siguen funcionando durante mantenimiento */}
          {/* <Route path="/admin-panel" element={<DashboardAdmin />} /> */}
        </>
      ) : (
        // Modo normal - sin mantenimiento
        <>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/user" element={<DashboardUser />} />
          <Route path="/dashboard/affiliate" element={<DashboardAffiliate />} />
          <Route path="/dashboard/provider" element={<DashboardProvider />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/netflix" element={<Netflix />} />
          <Route path="/disney" element={<Disney />} />
          <Route path="/max" element={<Max />} />
          <Route path="/spotify" element={<Spotify />} />
          <Route path="/primeVideo" element={<PrimeVideo />} />
          <Route path="/vix" element={<Vix />} />
        </>
      )}
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);