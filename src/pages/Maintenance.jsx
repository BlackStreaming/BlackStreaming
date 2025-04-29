import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMenu,
  FiTool,
  FiClock,
  FiUser,
  FiX,
  FiLogOut,
  FiFilm,
  FiMusic,
  FiTv,
  FiVideo,
  FiPlayCircle,
  FiBook,
  FiPenTool,
  FiMessageSquare,
  FiGlobe,
} from "react-icons/fi";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../images/logo.png";

const Maintenance = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generalTermsModal, setGeneralTermsModal] = useState(false);
  const [productsCount, setProductsCount] = useState({
    netflix: 0,
    spotify: 0,
    disney: 0,
    max: 0,
    primevideo: 0,
    vix: 0,
    crunchyroll: 0,
    canva: 0,
    chatgpt: 0,
    redessociales: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: currentUser.uid,
              name: userData.username || "Usuario",
              email: currentUser.email,
              orders: userData.orders || [],
              role: userData.role || "user",
            });
            setBalance(Number(userData.balance) || 0);
          } else {
            setError("Usuario no encontrado en la base de datos");
            console.error("Usuario no encontrado en la base de datos");
          }
        } catch (err) {
          setError("Error al cargar datos del usuario");
          console.error(err);
        }
      } else {
        setUser(null);
        setBalance(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load product counts for sidebar
  useEffect(() => {
    const categories = [
      "Netflix",
      "Spotify",
      "Disney",
      "Max",
      "Prime Video",
      "Vix",
      "Crunchyroll",
      "Canva",
      "ChatGPT",
      "Redes Sociales",
    ];

    const unsubscribes = categories.map((category) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, "");
      const q = query(
        collection(db, "products"),
        where("category", "==", category)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          setProductsCount((prev) => ({
            ...prev,
            [categoryKey]: snapshot.docs.length,
          }));
        },
        (err) => {
          console.error(`Error al cargar productos de ${category}:`, err);
        }
      );
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const goToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user?.role === "user") navigate("/dashboard/user");
    else if (user?.role === "affiliate") navigate("/dashboard/affiliate");
    else if (user?.role === "provider") navigate("/dashboard/provider");
    else if (user?.role === "admin") navigate("/dashboard/admin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200">
        <FiTool className="animate-spin text-5xl text-cyan-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 p-4">
        <FiTool className="text-5xl text-red-400 mb-4" />
        <p className="text-xl font-semibold text-white mb-2">Error</p>
        <p className="text-gray-300 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all shadow-lg"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all md:hidden"
            >
              <FiMenu size={24} />
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
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 rounded-full bg-gray-800/50 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 text-gray-400 hover:text-cyan-400 transition-all"
            >
              <FiSearch size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2 order-2 sm:order-3">
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-sm font-medium text-gray-300 hidden sm:flex items-center">
                  <FiUser className="mr-2 text-cyan-400" /> {user.name}
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
                    <FiUser className="text-cyan-400" size={20} />
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      navigate("/");
                    }}
                    className="flex items-center space-x-1 px-3 py-2 rounded-full bg-red-600/80 hover:bg-red-700 transition-all text-sm text-white"
                  >
                    <FiLogOut size={18} />
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
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-56 sm:w-64 bg-gray-900/90 backdrop-blur-sm text-white shadow-2xl transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 md:static md:z-40 md:translate-x-0 border-r border-gray-800/50`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 md:hidden">
              <span className="text-xl font-semibold text-cyan-400">
                BlackStreaming
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all"
              >
                <FiX size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                to="/netflix"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiFilm className="text-cyan-400" />
                  <span>Netflix</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.netflix}
                </span>
              </Link>
              <Link
                to="/spotify"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiMusic className="text-green-400" />
                  <span>Spotify</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.spotify}
                </span>
              </Link>
              <Link
                to="/disney"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiTv className="text-blue-400" />
                  <span>Disney+</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.disney}
                </span>
              </Link>
              <Link
                to="/max"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiVideo className="text-purple-400" />
                  <span>Max</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.max}
                </span>
              </Link>
              <Link
                to="/primevideo"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiPlayCircle className="text-blue-500" />
                  <span>Prime Video</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.primevideo}
                </span>
              </Link>
              <Link
                to="/vix"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiTv className="text-red-400" />
                  <span>Vix</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.vix}
                </span>
              </Link>
              <Link
                to="/crunchyroll"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiBook className="text-orange-400" />
                  <span>Crunchyroll</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.crunchyroll}
                </span>
              </Link>
              <Link
                to="/canva"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiPenTool className="text-teal-400" />
                  <span>Canva</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.canva}
                </span>
              </Link>
              <Link
                to="/chatgpt"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiMessageSquare className="text-gray-400" />
                  <span>ChatGPT</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.chatgpt}
                </span>
              </Link>
              <Link
                to="/redessociales"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiGlobe className="text-pink-400" />
                  <span>Redes Sociales</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.redessociales}
                </span>
              </Link>
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/30 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">
                      Saldo: S/ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 md:pt-4 md:ml-64 min-h-screen flex items-center justify-center`}
        >
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center p-6 bg-gray-800/50 rounded-full mb-6 border border-gray-700/50">
              <FiTool className="text-5xl text-cyan-400" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Estamos en Mantenimiento
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-md mx-auto">
              Estamos realizando mejoras para ofrecerte una mejor experiencia.
            </p>

            <div className="flex items-center justify-center space-x-2 text-gray-300 mb-8">
              <FiClock className="text-yellow-400" />
              <span>Volveremos pronto. Gracias por tu paciencia.</span>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg sm:text-xl font-medium mb-4 text-white">
                ¿Qué estamos haciendo?
              </h3>
              <ul className="text-left max-w-md mx-auto space-y-3 text-gray-300 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  Actualizando nuestros servidores para mayor velocidad
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  Implementando nuevas características
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  Mejorando la seguridad de la plataforma
                </li>
              </ul>
              <button
                onClick={() => setGeneralTermsModal(true)}
                className="mt-6 text-sm sm:text-base text-cyan-400 hover:text-cyan-300 transition-all underline underline-offset-4"
              >
                Ver Términos Generales
              </button>
            </div>
          </div>
        </main>

        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
      </div>

      {/* General Terms Modal */}
      {generalTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Términos y Condiciones Generales
                </h2>
                <button
                  onClick={() => setGeneralTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="text-gray-300">
                <div className="space-y-5">
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">
                      1. Proceso de Compra
                    </h3>
                    <p>
                      Al realizar una compra, el proveedor se contactará contigo
                      dentro de las próximas 24 horas hábiles para entregarte los
                      accesos a tu cuenta.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">2. Garantía</h3>
                    <p>
                      Todos los productos tienen una garantía de 7 días. Si tienes
                      problemas con tu cuenta durante este periodo, el proveedor
                      está obligado a resolverlos o reembolsarte.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">
                      3. Uso Responsable
                    </h3>
                    <p>
                      El cliente es responsable del uso que dé a la cuenta
                      adquirida. No nos hacemos responsables por suspensiones o
                      baneos por mal uso.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">4. Soporte</h3>
                    <p>
                      El soporte se realizará directamente con el proveedor
                      mediante el número de WhatsApp proporcionado.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">
                      5. Renovaciones
                    </h3>
                    <p>
                      Las renovaciones son manuales y deben solicitarse al
                      proveedor antes de que finalice el período contratado.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos
              reservados.
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

export default Maintenance;
