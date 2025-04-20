import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home"; // Página principal
import Login from "./pages/Login"; // Página de login
import Register from "./pages/Register"; // Página de registro
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Ruta para la página principal */}
        <Route path="/" element={<Home />} />

        {/* Ruta para la página de inicio de sesión */}
        <Route path="/login" element={<Login />} />

        {/* Ruta para la página de registro */}
        <Route path="/register" element={<Register />} />

        {/* Rutas para cada dashboard según el rol */}
        <Route path="/dashboard/user" element={<DashboardUser />} />
        <Route path="/dashboard/affiliate" element={<DashboardAffiliate />} />
        <Route path="/dashboard/provider" element={<DashboardProvider />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />

        {/* Ruta para la página de Netflix */}
        <Route path="/netflix" element={<Netflix />} />
        <Route path="/disney" element={<Disney />} />
        <Route path="/max" element={<Max />} />
        <Route path="/spotify" element={<Spotify />} />
        <Route path="/primeVideo" element={<PrimeVideo />} />
        <Route path="/vix" element={<Vix />} />
      </Routes>
    </Router>
  </React.StrictMode>
);