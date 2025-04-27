import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home"; // Página principal
import Login from "./pages/Login"; // Página de login
import Register from "./pages/register"; // Página de registro
import DashboardUser from "./pages/DashboardUser"; // Panel de usuario
import DashboardAffiliate from "./pages/DashboardAffiliate"; // Panel de afiliado
import DashboardProvider from "./pages/DashboardProvider"; // Panel de proveedor
import DashboardAdmin from "./pages/DashboardAdmin"; // Panel de administrador
import Netflix from "./categorías/Netflix"; // Página de Netflix
import Disney from "./categorías/Disney"; // Página de Disney
import Max from "./categorías/Max"; // Página de Max
import Spotify from "./categorías/Spotify"; // Página de Spotify
import PrimeVideo from "./categorías/PrimeVideo"; // Página de Prime video
import Vix from "./categorías/Vix"; // Página de Vix
import Canva from "./categorías/canva";
import ChatGPT from "./categorías/ChatGPT";
import Crunchyroll from "./categorías/crunchyroll";
import Redes from "./categorías/RedesSociales.jsx";
import Maintenance from "./pages/Maintenance"; // Nueva página de mantenimiento

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
          <Route path="/Canva" element={<Canva />} />
          <Route path="/ChatGPT" element={<ChatGPT />} />
          <Route path="/Crunchyroll" element={<Crunchyroll />} />
          <Route path="/RedesSociales" element={<Redes />} />
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