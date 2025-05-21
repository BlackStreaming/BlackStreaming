import React, { useState, useEffect, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiTool,
  FiClock,
  FiUser,
  FiLogOut,
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

const Maintenance = memo(() => {
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
            setError("Usuario no encontrado");
            console.error("Usuario no encontrado en la base de datos");
          }
        } catch (err) {
          setError("Error al cargar datos");
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

  // Load product counts (kept for potential future use)
  useEffect(() => {
    const categories = [
      { name: "Netflix", key: "netflix" },
      { name: "Spotify", key: "spotify" },
      { name: "Disney", key: "disney" },
      { name: "Max", key: "max" },
      { name: "Prime Video", key: "primevideo" },
      { name: "Vix", key: "vix" },
      { name: "Crunchyroll", key: "crunchyroll" },
      { name: "Canva", key: "canva" },
      { name: "ChatGPT", key: "chatgpt" },
      { name: "Redes Sociales", key: "redessociales" },
    ];

    const unsubscribes = categories.map(({ name, key }) => {
      const q = query(collection(db, "products"), where("category", "==", name));
      return onSnapshot(
        q,
        (snapshot) => {
          setProductsCount((prev) => ({ ...prev, [key]: snapshot.docs.length }));
        },
        (err) => console.error(`Error loading ${name}:`, err)
      );
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const goToDashboard = () => {
    if (!user) return navigate("/login");
    const rolePaths = {
      user: "/dashboard/user",
      affiliate: "/dashboard/affiliate",
      provider: "/dashboard/provider",
      admin: "/dashboard/admin",
    };
    navigate(rolePaths[user.role] || "/dashboard/user");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <FiTool className="animate-spin text-4xl text-cyan-500" />
        <span className="ml-2 text-white">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <FiTool className="text-5xl text-red-500 mb-4" />
        <p className="text-xl text-white mb-2">Error</p>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="BlackStreaming" className="h-8" />
              <span className="text-lg font-bold text-cyan-500 hidden sm:block">
                BlackStreaming
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full py-2 px-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-gray-300">
                  {user.name}
                </span>
                <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm">
                  S/ {balance.toFixed(2)}
                </span>
                <button
                  onClick={goToDashboard}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                  title="Dashboard"
                >
                  <FiUser className="text-cyan-500" size={20} />
                </button>
                <button
                  onClick={() => {
                    auth.signOut();
                    navigate("/");
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                >
                  <FiLogOut size={16} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-2 text-sm hover:text-cyan-500"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-sm"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-lg text-center">
          <div className="p-4 bg-gray-800 rounded-full inline-flex mb-6">
            <FiTool className="text-4xl text-cyan-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">En Mantenimiento</h1>
          <p className="text-gray-300 mb-6">
            Estamos mejorando nuestra plataforma para ti.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
            <FiClock className="text-yellow-500" />
            <span>Volveremos pronto.</span>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">¿Qué estamos haciendo?</h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Corrección de errores en el sistema de pedidos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Solución de fallos en el retiro de dinero
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Arreglo de errores al pasar del sistema al pedido
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Actualización del dashboard del proveedor
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Actualización del dashboard del usuario
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Refuerzo de la seguridad general del sitio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">•</span>
                Mejora en la visualización y diseño
              </li>
            </ul>
            <button
              onClick={() => setGeneralTermsModal(true)}
              className="mt-4 text-cyan-500 hover:text-cyan-400 underline"
            >
              Términos Generales
            </button>
          </div>
        </div>
      </main>

      {/* Terms Modal */}
      {generalTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Términos y Condiciones</h2>
                <button
                  onClick={() => setGeneralTermsModal(false)}
                  className="hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4 text-gray-300">
                {[
                  {
                    title: "Proceso de Compra",
                    text: "El proveedor te contactará en 24 horas hábiles para los accesos.",
                  },
                  {
                    title: "Garantía",
                    text: "7 días de garantía. El proveedor resolverá problemas o reembolsará.",
                  },
                  {
                    title: "Uso Responsable",
                    text: "No nos responsabilizamos por suspensiones por mal uso.",
                  },
                  {
                    title: "Soporte",
                    text: "Contacta al proveedor vía WhatsApp.",
                  },
                  {
                    title: "Renovaciones",
                    text: "Solicita renovaciones manuales antes del fin del período.",
                  },
                ].map(({ title, text }, index) => (
                  <div key={index} className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BlackStreaming" className="h-6" />
            <span className="text-sm font-semibold text-cyan-500">
              BlackStreaming
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-400">Desarrollado por Saiph</p>
        </div>
      </footer>
    </div>
  );
});

export default Maintenance;