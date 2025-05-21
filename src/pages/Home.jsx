import React, { useState, useEffect, createContext, useContext } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaColumns,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaBell,
  FaSignInAlt,
  FaBroadcastTower,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

// Assets
import logo from "../images/logo.png";
import brooklyn99 from "../images/brooklyn99.png";
import strangerThings from "../images/stranger-things.png";
import breakingBad from "../images/breaking-bad.png";
import naruto from "../images/naruto.png";
import alice from "../images/alice.png";

// Platform logos
import netflixLogo from "../catalogo/netflix.png";
import spotifyLogo from "../catalogo/spotify.png";
import disneyLogo from "../catalogo/disney.png";
import maxLogo from "../catalogo/max.png";
import primeVideoLogo from "../catalogo/prime-video.png";
import vixLogo from "../catalogo/vix.png";
import canvaLogo from "../catalogo/Canva.png";
import chatGPTLogo from "../catalogo/ChatGPT.png";
import crunchyrollLogo from "../catalogo/crunchyroll.png";
import redesSocialesLogo from "../catalogo/redessociales.png";
import dgoLogo from "../catalogo/dgo.png";
import ligaMaxLogo from "../catalogo/ligamax.png";
import movistarPlayLogo from "../catalogo/movistarplay.png";
import youtubeLogo from "../catalogo/youtube.png";
import deezerLogo from "../catalogo/deezer.png";
import tidalLogo from "../catalogo/tidal.png";
import vpnLogo from "../catalogo/vpn.png";
import winTvLogo from "../catalogo/wintv.png";
import appleMusicLogo from "../catalogo/applemusic.png";
import appleTvLogo from "../catalogo/appletv.png";
import iptvLogo from "../catalogo/iptv.png";
import flujoTvLogo from "../catalogo/flujotv.png";
import vikiRakutenLogo from "../catalogo/vikirakuten.png";
import pornhubLogo from "../catalogo/pornhub.png";
import paramountLogo from "../catalogo/paramount.png";
import licenciasLogo from "../catalogo/licencias.png";
import capcutLogo from "../catalogo/capcut.png";
import duolingoLogo from "../catalogo/duolingo.png";
import buscaPersonasLogo from "../catalogo/buscapersonas.png";

// Theme Context
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className={`min-h-screen font-inter transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-gray-100"
            : "bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 text-gray-900"
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Featured content for carousel
const featuredContent = [
  { src: brooklyn99, title: "Brooklyn Nine-Nine", description: "Comedia policial hilarante" },
  { src: strangerThings, title: "Stranger Things", description: "Misterio y nostalgia ochentera" },
  { src: breakingBad, title: "Breaking Bad", description: "A chemistry teacher's descent into the world of crime" },
  { src: naruto, title: "Naruto", description: "Aventuras ninja épicas" },
  { src: alice, title: "Alice in Borderland", description: "Juego de supervivencia intenso" },
];

// Platform data
const platforms = [
  { name: "Netflix", logo: netflixLogo, route: "/netflix", color: "#E50914" },
  { name: "Spotify", logo: spotifyLogo, route: "/spotify", color: "#1DB954" },
  { name: "Disney+", logo: disneyLogo, route: "/disney", color: "#1C4ED8" },
  { name: "Max", logo: maxLogo, route: "/max", color: "#B5179E" },
  { name: "Prime Video", logo: primeVideoLogo, route: "/primevideo", color: "#00A8E1" },
  { name: "Vix", logo: vixLogo, route: "/vix", color: "#FF5733" },
  { name: "Canva", logo: canvaLogo, route: "/canva", color: "#00C4B4" },
  { name: "ChatGPT", logo: chatGPTLogo, route: "/chatgpt", color: "#10A37F" },
  { name: "Crunchyroll", logo: crunchyrollLogo, route: "/crunchyroll", color: "#F47521" },
  { name: "Redes Sociales", logo: redesSocialesLogo, route: "/redessociales", color: "#3B5998" },
  { name: "Dgo", logo: dgoLogo, route: "/dgo", color: "#4CAF50" },
  { name: "Liga Max", logo: ligaMaxLogo, route: "/ligamax", color: "#FFD700" },
  { name: "Movistar Play", logo: movistarPlayLogo, route: "/movistarplay", color: "#00ADEF" },
  { name: "Youtube", logo: youtubeLogo, route: "/youtube", color: "#FF0000" },
  { name: "Deezer", logo: deezerLogo, route: "/deezer", color: "#FEAA2D" },
  { name: "Tidal", logo: tidalLogo, route: "/tidal", color: "#00C7B7" },
  { name: "Vpn", logo: vpnLogo, route: "/vpn", color: "#4B0082" },
  { name: "Win Tv", logo: winTvLogo, route: "/wintv", color: "#4682B4" },
  { name: "Apple Music", logo: appleMusicLogo, route: "/applemusic", color: "#FA2C43" },
  { name: "Apple Tv", logo: appleTvLogo, route: "/appletv", color: "#A3AAAE" },
  { name: "Iptv", logo: iptvLogo, route: "/iptv", color: "#8B008B" },
  { name: "Flujo Tv", logo: flujoTvLogo, route: "/flujotv", color: "#20B2AA" },
  { name: "Viki Rakuten", logo: vikiRakutenLogo, route: "/vikirakuten", color: "#D81B60" },
  { name: "Pornhub", logo: pornhubLogo, route: "/pornhub", color: "#FFA500" },
  { name: "Paramount", logo: paramountLogo, route: "/paramount", color: "#0064D2" },
  { name: "Licencias", logo: licenciasLogo, route: "/licencias", color: "#708090" },
  { name: "Capcut", logo: capcutLogo, route: "/capcut", color: "#00CED1" },
  { name: "Duolingo", logo: duolingoLogo, route: "/duolingo", color: "#58CC02" },
  { name: "Busca Personas", logo: buscaPersonasLogo, route: "/buscapersonas", color: "#6A5ACD" },
];

// Notification Modal Component
const NotificationModal = ({ isOpen, onClose, message }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FaBell className="text-blue-500 dark:text-cyan-400 text-2xl" />
            <h3 className="text-xl font-bold dark:text-white text-gray-900">Notificación</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-blue-600 dark:bg-cyan-600 text-white hover:bg-blue-700 dark:hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [liveMode, setLiveMode] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load user data and fetch admin notification on login
  useEffect(() => {
    const loadUserAndNotification = async () => {
      if (auth.currentUser) {
        try {
          // Fetch user data
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", auth.currentUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUser({
              name: userDoc.username || "Usuario",
              email: auth.currentUser.email,
            });
            setBalance(userDoc.balance || 0);
            setRole(userDoc.role || "user");
          }

          // Fetch admin notification
          const notificationDoc = await getDoc(doc(db, "notifications", "adminMessage"));
          if (notificationDoc.exists()) {
            const notificationData = notificationDoc.data();
            setNotification({
              isOpen: true,
              message: notificationData.message || "Mensaje del administrador no disponible.",
            });
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
          setNotification({
            isOpen: true,
            message: "Hubo un error al cargar los datos. Por favor, intenta de nuevo.",
          });
        }
      }
    };

    loadUserAndNotification();
  }, []);

  // Function to fetch and show admin notification
  const showAdminNotification = async () => {
    try {
      const notificationDoc = await getDoc(doc(db, "notifications", "adminMessage"));
      if (notificationDoc.exists()) {
        const notificationData = notificationDoc.data();
        setNotification({
          isOpen: true,
          message: notificationData.message || "Mensaje del administrador no disponible.",
        });
      } else {
        setNotification({
          isOpen: true,
          message: "No hay notificaciones del administrador en este momento.",
        });
      }
    } catch (error) {
      console.error("Error al cargar notificación:", error);
      setNotification({
        isOpen: true,
        message: "Error al cargar la notificación. Por favor, intenta de nuevo.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setNotification({
        isOpen: true,
        message: "Error al cerrar sesión. Por favor, intenta de nuevo.",
      });
    }
  };

  const goToDashboard = () => {
    const routes = {
      user: "/dashboard/user",
      affiliate: "/dashboard/affiliate",
      provider: "/dashboard/provider",
      admin: "/dashboard/admin",
    };
    navigate(routes[role] || "/dashboard/user");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("name", ">=", searchQuery.toLowerCase()),
        where("name", "<=", searchQuery.toLowerCase() + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setNotification({
        isOpen: true,
        message: "Error al realizar la búsqueda. Por favor, intenta de nuevo.",
      });
      setSearchResults([]);
    }
  };

  const toggleLiveMode = () => {
    setLiveMode((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        message={notification.message}
      />

      {/* Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b dark:border-gray-800 border-gray-200 shadow-lg ${
          theme === "dark" ? "bg-gray-900/80" : "bg-white/80"
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={logo}
                alt="BlackStreaming"
                className="h-10 w-auto"
              />
              <span
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-cyan-300" : "text-blue-600"
                }`}
              >
                BlackStreaming
              </span>
            </Link>
          </div>

          {/* Search Bar and Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:flex-1 gap-2">
            {/* Search Bar */}
            <motion.div
              className="flex items-center relative w-full lg:max-w-lg mx-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full py-3 px-5 pr-12 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:outline-none shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleSearch}
                className="absolute right-3 dark:text-cyan-400 text-blue-600"
                aria-label="Buscar"
              >
                <FaSearch size={20} />
              </motion.button>
            </motion.div>

            {/* User Info / Buttons */}
            <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-full dark:text-cyan-300 text-blue-600 dark:hover:bg-gray-800 hover:bg-gray-100"
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? <FaSun size={22} /> : <FaMoon size={22} />}
              </motion.button>
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={showAdminNotification}
                    className="p-2 rounded-full dark:bg-gray-800 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200"
                    aria-label="Ver notificaciones"
                  >
                    <FaBell className="dark:text-cyan-400 text-blue-600" size={22} />
                  </motion.button>
                  <motion.span
                    className="text-base font-medium dark:text-cyan-300 text-blue-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {user.name}
                  </motion.span>
                  <motion.span
                    className="text-base font-medium dark:bg-gray-800 bg-gray-100 dark:text-cyan-200 text-blue-800 px-4 py-1.5 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    S/ {balance.toFixed(2)}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToDashboard}
                    className="p-2 rounded-full dark:bg-gray-800 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200"
                    aria-label="Panel de control"
                  >
                    <FaColumns className="dark:text-cyan-400 text-blue-600" size={22} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLiveMode}
                    className={`p-2 rounded-full ${
                      liveMode
                        ? "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
                        : "dark:bg-gray-800 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200"
                    }`}
                    aria-label={liveMode ? "Desactivar modo live" : "Activar modo live"}
                  >
                    <FaBroadcastTower
                      className={liveMode ? "text-white" : "dark:text-cyan-400 text-blue-600"}
                      size={22}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md hover:from-red-700 hover:to-red-800 transition-all duration-300"
                  >
                    <FaSignOutAlt size={18} />
                    <span>Salir</span>
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center space-x-3 flex-wrap justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/login")}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold text-white shadow-md transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    }`}
                    aria-label="Ingresar"
                  >
                    <FaSignInAlt size={18} />
                    <span>Ingresar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/register")}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold text-white shadow-md transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        : "bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500"
                    }`}
                    aria-label="Registrarse"
                  >
                    <span>Registrarse</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow pt-24">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 px-6 container mx-auto"
          >
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Resultados de búsqueda
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  className={`p-6 rounded-lg shadow-md border-2 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                      : "bg-gradient-to-br from-white to-gray-100 border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      theme === "dark" ? "text-cyan-300" : "text-blue-600"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`text-base line-clamp-2 mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {product.description}
                  </p>
                  <p
                    className={`text-base font-medium mb-1 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Plataforma: {product.platform}
                  </p>
                  <p
                    className={`text-base font-bold ${
                      theme === "dark" ? "text-cyan-400" : "text-blue-700"
                    }`}
                  >
                    Precio: S/ {product.price?.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 px-6 container mx-auto text-center"
          >
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              No se encontraron productos para "{searchQuery}".
            </p>
          </motion.section>
        )}

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-8 px-6 text-center"
        >
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } bg-clip-text bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 from-blue-600 to-indigo-600`}
          >
            Tus plataformas favoritas al instante
          </h1>
          <p
            className={`mt-4 text-lg sm:text-xl ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            } max-w-3xl mx-auto`}
          >
            Accede a todo tu entretenimiento y herramientas con BlackStreaming.
          </p>
        </motion.section>

        {/* Carousel Section */}
        <section className="relative py-6 px-6 sm:px-8">
          <motion.div
            className="flex justify-center items-center space-x-4 perspective-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="hidden lg:block w-48 h-64 rounded-2xl overflow-hidden shadow-xl transform -rotate-y-15"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={featuredContent[(currentIndex - 1 + featuredContent.length) % featuredContent.length].src}
                alt="Programa anterior"
                className="w-full h-full object-cover scale-110"
              />
            </motion.div>
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl dark:border-cyan-500/20 border-blue-200/20 border"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <img
                src={featuredContent[currentIndex].src}
                alt="Programa destacado"
                className="w-72 h-96 sm:w-96 sm:h-[28rem] object-cover"
              />
              <div
                className={`absolute inset-0 ${
                  theme === "dark"
                    ? "bg-gradient-to-t from-gray-900/80 to-transparent"
                    : "bg-gradient-to-t from-gray-900/50 to-transparent"
                }`}
              />
              <motion.div
                className="absolute bottom-0 w-full p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-100"
                  } drop-shadow-lg`}
                >
                  {featuredContent[currentIndex].title}
                </h2>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-200"
                  }`}
                >
                  {featuredContent[currentIndex].description}
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              className="hidden lg:block w-48 h-64 rounded-2xl overflow-hidden shadow-xl transform rotate-y-15"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={featuredContent[(currentIndex + 1) % featuredContent.length].src}
                alt="Próximo programa"
                className="w-full h-full object-cover scale-110"
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setCurrentIndex((prevIndex) =>
                  (prevIndex - 1 + featuredContent.length) % featuredContent.length
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 dark:bg-gray-900/60 bg-white/60 dark:hover:bg-cyan-500/60 hover:bg-blue-200/60 dark:border-cyan-500/20 border-blue-200/20 backdrop-blur-md p-3 rounded-full border"
              aria-label="Programa anterior"
            >
              <FaChevronLeft className="dark:text-cyan-300 text-blue-600 text-xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 dark:bg-gray-900/60 bg-white/60 dark:hover:bg-cyan-500/60 hover:bg-blue-200/60 dark:border-cyan-500/20 border-blue-200/20 backdrop-blur-md p-3 rounded-full border"
              aria-label="Próximo programa"
            >
              <FaChevronRight className="dark:text-cyan-300 text-blue-600 text-xl" />
            </motion.button>
          </motion.div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {featuredContent.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "dark:bg-cyan-400 bg-blue-600"
                    : "dark:bg-gray-600 bg-gray-300"
                }`}
                aria-label={`Ir a ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Platforms Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-16 container mx-auto px-6"
        >
          <div className="mb-10 text-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl md:text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              Plataformas de Streaming
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              } max-w-2xl mx-auto`}
            >
              Acceso a todas tus plataformas favoritas en un solo lugar.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {platforms.map((platform) => (
              <motion.div
                key={platform.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                className="w-full h-32"
              >
                <Link
                  to={platform.route}
                  className={`group relative flex items-center justify-center h-full rounded-lg shadow-lg transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-gray-800 to-gray-900"
                      : "bg-gradient-to-br from-white to-gray-100"
                  } border-2`}
                  style={{
                    borderImage: `linear-gradient(to right, ${platform.color}, transparent) 1`,
                  }}
                  aria-label={`Ir a ${platform.name}`}
                >
                  <div className="flex items-center space-x-4 p-4">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={platform.logo}
                      alt={platform.name}
                      className="w-20 h-20 object-contain"
                      style={{ transform: liveMode ? "scaleX(-1)" : "scaleX(1)" }}
                    />
                    <span
                      className={`font-semibold text-center text-base ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {platform.name}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ backgroundColor: platform.color }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        {!user && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="py-16 dark:bg-gradient-to-r dark:from-gray-900/80 dark:to-blue-950/80 bg-gradient-to-r from-blue-50/80 to-gray-100/80"
          >
            <div className="container mx-auto px-6 text-center">
              <motion.h2
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-2xl md:text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                ¿Listo para adquirir?
              </motion.h2>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                } max-w-2xl mx-auto mb-6`}
              >
                Únete a miles de usuarios satisfechos accediendo a todas tus plataformas favoritas en un solo lugar.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-base font-semibold text-white shadow-md transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    : "bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500"
                }`}
              >
                <span>Regístrate - Gratis por tiempo limitado</span>
              </motion.button>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`dark:bg-gray-900/80 bg-white/80 dark:border-gray-800 border-gray-200 backdrop-blur-md border-t py-12`}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center space-y-6 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="BlackStreaming" className="h-10 w-auto" />
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-cyan-300" : "text-blue-600"
                }`}
              >
                BlackStreaming
              </span>
            </div>
            <div
              className={`text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } text-center`}
            >
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
            </div>
            <div
              className={`text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } text-center`}
            >
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap Home with ThemeProvider
const HomeWithTheme = () => (
  <ThemeProvider>
    <Home />
  </ThemeProvider>
);

export default HomeWithTheme;