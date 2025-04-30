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
import PrimeVideo from "./categorías/PrimeVideo"; // Página de Prime Video
import Vix from "./categorías/Vix"; // Página de Vix
import Canva from "./categorías/canva";
import ChatGPT from "./categorías/ChatGPT";
import Crunchyroll from "./categorías/Crunchyroll";
import RedesSociales from "./categorías/RedesSociales.jsx";
import AppleMusic from "./categorías/AppleMusic";
import AppleTv from "./categorías/AppleTv";
import IPTV from "./categorías/IPTV";
import FlujoTv from "./categorías/FlujoTv";
import VikiRakuten from "./categorías/VikiRakuten";
import Pornhub from "./categorías/Pornhub";
import Paramount from "./categorías/Paramount";
import Licencias from "./categorías/Licencias";
import Capcut from "./categorías/Capcut";
import Duolingo from "./categorías/Duolingo";
import Dgo from "./categorías/Dgo";
import LigaMax from "./categorías/LigaMax";
import MovistarPlay from "./categorías/MovistarPlay";
import Youtube from "./categorías/Youtube";
import Deezer from "./categorías/Deezer";
import Tidal from "./categorías/Tidal";
import Vpn from "./categorías/Vpn";
import WinTv from "./categorías/WinTv";
import BuscaPersonas from "./categorías/BuscaPersonas";
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
          <Route path="/primevideo" element={<PrimeVideo />} />
          <Route path="/vix" element={<Vix />} />
          <Route path="/canva" element={<Canva />} />
          <Route path="/chatgpt" element={<ChatGPT />} />
          <Route path="/crunchyroll" element={<Crunchyroll />} />
          <Route path="/redessociales" element={<RedesSociales />} />
          <Route path="/applemusic" element={<AppleMusic />} />
          <Route path="/appletv" element={<AppleTv />} />
          <Route path="/iptv" element={<IPTV />} />
          <Route path="/flujotv" element={<FlujoTv />} />
          <Route path="/vikirakuten" element={<VikiRakuten />} />
          <Route path="/pornhub" element={<Pornhub />} />
          <Route path="/paramount" element={<Paramount />} />
          <Route path="/licencias" element={<Licencias />} />
          <Route path="/capcut" element={<Capcut />} />
          <Route path="/duolingo" element={<Duolingo />} />
          <Route path="/dgo" element={<Dgo />} />
          <Route path="/ligamax" element={<LigaMax />} />
          <Route path="/movistarplay" element={<MovistarPlay />} />
          <Route path="/youtube" element={<Youtube />} />
          <Route path="/deezer" element={<Deezer />} />
          <Route path="/tidal" element={<Tidal />} />
          <Route path="/vpn" element={<Vpn />} />
          <Route path="/wintv" element={<WinTv />} />
          <Route path="/buscapersonas" element={<BuscaPersonas />} />
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
