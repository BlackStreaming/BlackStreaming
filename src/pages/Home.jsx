import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaColumns,
  FaSignOutAlt,
} from "react-icons/fa";
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BlackStreaming
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center relative w-1/3"
          >
            <input
              type="text"
              placeholder="Search movies, series..."
              className="w-full px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              <FaSearch />
            </button>
          </form>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FaBars size={20} />
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm font-medium">👤 {user.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">S/{balance.toFixed(2)}</span>
                  <button
                    onClick={goToDashboard}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    title="Dashboard"
                  >
                    <FaColumns className="text-cyan-400" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm"
                  >
                    <FaSignOutAlt size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-sm hover:text-cyan-400 transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition-opacity text-sm"
                >
                  Registerarse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search - Shows when menu is open */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies, series..."
                className="w-full px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
              >
                <FaSearch />
              </button>
            </form>

            {/* Mobile Menu Links */}
            <div className="mt-3 flex flex-col space-y-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="font-medium">👤 {user.name}</span>
                    <span className="font-medium">S/{balance.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={goToDashboard}
                    className="px-3 py-2 text-left rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <FaColumns />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-left rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-red-400"
                  >
                    <FaSignOutAlt />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-2 text-left rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-3 py-2 text-left rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition-opacity"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Carrusel Original */}
        <section className="py-6 px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Tus palataformas favoritas al instante
          </h1>
        </section>

        <section className="relative flex justify-center items-center space-x-4 mt-6 px-4 sm:px-6">
          <img
            src={featuredContent[(currentIndex - 1 + featuredContent.length) % featuredContent.length].src}
            alt="Previous show"
            className="hidden sm:block w-40 h-56 opacity-50 rounded-xl transition-all duration-500 scale-95"
          />
          <div className="relative">
            <img
              src={featuredContent[currentIndex].src}
              alt="Featured show"
              className="w-48 h-64 sm:w-64 sm:h-80 rounded-xl shadow-lg transition-all duration-700 border-4 border-purple-400 scale-105"
            />
            <h2 className="absolute bottom-0 w-full text-center text-base sm:text-lg font-bold bg-black bg-opacity-50 py-2">
              {featuredContent[currentIndex].title}
            </h2>
          </div>
          <img
            src={featuredContent[(currentIndex + 1) % featuredContent.length].src}
            alt="Next show"
            className="hidden sm:block w-40 h-56 opacity-50 rounded-xl transition-all duration-500 scale-95"
          />
          <button
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredContent.length) % featuredContent.length)}
            className="absolute left-4 sm:left-6 text-2xl sm:text-3xl bg-gray-900 hover:bg-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length)}
            className="absolute right-4 sm:right-6 text-2xl sm:text-3xl bg-gray-900 hover:bg-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all"
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
                index === currentIndex ? "bg-cyan-500" : "bg-gray-500"
              } transition-all`}
            ></div>
          ))}
        </div>

        {/* Platforms Section */}
        <section className="py-12 container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Plataformas de Streaming</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Acceso a todas tus plataformas favoritas en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {platforms.map((platform, index) => (
              <Link
                to={platform.route}
                key={index}
                className="group relative overflow-hidden rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors p-4 flex flex-col items-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="font-medium text-center">{platform.name}</span>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400 rounded-xl transition-all pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        {!user && (
          <section className="py-12 bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Listo para adquirir?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                Join thousands of satisfied users accessing all their favorite platforms
                in one place.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition-opacity font-medium"
              >
                Registrate - Gratis por tiempo limitado
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src={logo} alt="BlackStreaming" className="h-6 w-auto" />
              <span className="text-sm font-medium">BlackStreaming</span>
            </div>
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} BlackStreaming. Todos los Derechos Reservados.
            </div>
            <div className="text-sm text-gray-400">
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
