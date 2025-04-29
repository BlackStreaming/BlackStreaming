import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaColumns,
  FaSignOutAlt,
} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
import CanvaLogo from "../catalogo/Canva.png";
import ChatGPTlOGO from "../catalogo/ChatGPT.png";
import CrunchyrollLogo from "../catalogo/crunchyroll.png";
import RedesSocialesLogo from "../catalogo/redessociales.png";

const featuredContent = [
  { src: brooklyn99, title: "Brooklyn Nine-Nine" },
  { src: strangerThings, title: "Stranger Things" },
  { src: breakingBad, title: "Breaking Bad" },
  { src: naruto, title: "Naruto" },
  { src: alice, title: "Alice in Borderland" },
];

const platforms = [
  { name: "Netflix", logo: netflixLogo, route: "/netflix" },
  { name: "Spotify", logo: spotifyLogo, route: "/spotify" },
  { name: "Disney+", logo: disneyLogo, route: "/disney" },
  { name: "Max", logo: maxLogo, route: "/max" },
  { name: "Prime Video", logo: primeVideoLogo, route: "/primevideo" },
  { name: "Vix", logo: vixLogo, route: "/vix" },
  { name: "Canva", logo: CanvaLogo, route: "/Canva" },
  { name: "ChatGPT", logo: ChatGPTlOGO, route: "/ChatGPT" },
  { name: "Crunchyroll", logo: CrunchyrollLogo, route: "/crunchyroll" },
  { name: "Redes Sociales", logo: RedesSocialesLogo, route: "/redessociales" },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (auth.currentUser) {
        try {
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
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    loadUser();
  }, [auth.currentUser]);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const goToDashboard = () => {
    if (role === "user") navigate("/dashboard/user");
    else if (role === "affiliate") navigate("/dashboard/affiliate");
    else if (role === "provider") navigate("/dashboard/provider");
    else if (role === "admin") navigate("/dashboard/admin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all md:hidden"
            >
              <FaBars size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-10 w-auto" />
              <span className="text-xl font-semibold text-cyan-400 hidden sm:block">
                BlackStreaming
              </span>
            </Link>
          </div>

          <div className="flex items-center relative w-full sm:w-auto sm:max-w-xs md:max-w-md mt-3 sm:mt-0 order-3 sm:order-2 sm:mx-3">
            <input
              type="text"
              placeholder="Buscar películas, series..."
              className="w-full px-4 py-2 rounded-full bg-gray-800/50 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 text-gray-400 hover:text-cyan-400 transition-all"
            >
              <FaSearch size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2 order-2 sm:order-3">
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-sm font-medium text-gray-300 hidden sm:flex items-center">
                  👤 {user.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-200 bg-gray-800/50 px-3 py-1 rounded-full">
                    S/ {balance.toFixed(2)}
                  </span>
                  <button
                    onClick={goToDashboard}
                    className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                    title="Dashboard"
                  >
                    <FaColumns className="text-cyan-400" size={20} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-full bg-red-600/80 hover:bg-red-700 transition-all text-sm text-white"
                  >
                    <FaSignOutAlt size={18} />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm text-gray-200 hover:text-cyan-400 transition-all"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-all text-sm"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 w-56 sm:w-64 bg-gray-900/90 backdrop-blur-sm text-white shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out z-50 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4">
                <span className="text-xl font-semibold text-cyan-400">
                  BlackStreaming
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-2 p-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium">👤 {user.name}</span>
                      <span className="font-medium">S/ {balance.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={goToDashboard}
                      className="px-3 py-2 text-left rounded-xl hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                    >
                      <FaColumns className="text-cyan-400" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-left rounded-xl hover:bg-gray-700/50 transition-colors flex items-center space-x-2 text-red-400"
                    >
                      <FaSignOutAlt />
                      <span>Salir</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-3 py-2 text-left rounded-xl hover:bg-gray-700/50 transition-colors"
                    >
                      Ingresar
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-3 py-2 text-left rounded-xl bg-cyan-500 hover:bg-cyan-600 transition-colors"
                    >
                      Registrarse
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
      </header>

      <main className="flex-grow">
        {/* Carrusel */}
        <section className="py-6 px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Tus plataformas favoritas al instante
          </h1>
        </section>

        <section className="relative flex justify-center items-center space-x-4 mt-6 px-4 sm:px-6">
          <div className="hidden sm:block w-40 h-56 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={featuredContent[(currentIndex - 1 + featuredContent.length) % featuredContent.length].src}
              alt="Previous show"
              className="w-full h-full object-cover opacity-50 transition-all duration-500 scale-95"
            />
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-700/50">
            <img
              src={featuredContent[currentIndex].src}
              alt="Featured show"
              className="w-48 h-64 sm:w-64 sm:h-80 object-cover transition-all duration-700 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
            <h2 className="absolute bottom-0 w-full text-center text-base sm:text-lg font-bold text-white py-3 drop-shadow-lg">
              {featuredContent[currentIndex].title}
            </h2>
          </div>
          <div className="hidden sm:block w-40 h-56 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={featuredContent[(currentIndex + 1) % featuredContent.length].src}
              alt="Next show"
              className="w-full h-full object-cover opacity-50 transition-all duration-500 scale-95"
            />
          </div>
          <button
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredContent.length) % featuredContent.length)}
            className="absolute left-4 sm:left-6 text-2xl sm:text-3xl bg-gray-900/80 backdrop-blur-sm hover:bg-gray-700/80 px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all border border-gray-700/50"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length)}
            className="absolute right-4 sm:right-6 text-2xl sm:text-3xl bg-gray-900/80 backdrop-blur-sm hover:bg-gray-700/80 px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all border border-gray-700/50"
          >
            <FaChevronRight />
          </button>
        </section>

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-2 mt-4">
          {featuredContent.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? "bg-cyan-400" : "bg-gray-600"
              } transition-all duration-300`}
            ></div>
          ))}
        </div>

        {/* Platforms Section */}
        <section className="py-12 container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Plataformas de Streaming
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Acceso a todas tus plataformas favoritas en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 sm:gap-10">
            {platforms.map((platform, index) => (
              <Link
                to={platform.route}
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300 p-4 flex flex-col items-center shadow-xl border border-gray-700/50"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="font-medium text-center text-gray-200">
                  {platform.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        {!user && (
          <section className="py-12 bg-gradient-to-r from-gray-900/80 to-blue-950/80">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                ¿Listo para adquirir?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Únete a miles de usuarios satisfechos accediendo a todas tus plataformas favoritas en un solo lugar.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 font-medium text-white"
              >
                Regístrate - Gratis por tiempo limitado
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800/50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
              <span className="text-sm font-semibold text-cyan-400">
                BlackStreaming
              </span>
            </div>
            <div className="text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
            </div>
            <div className="text-sm text-gray-400 text-center">
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
