import React, { useState, useEffect } from "react";
import { 
  FiSettings, 
  FiLogOut, 
  FiDollarSign, 
  FiUsers, 
  FiMenu, 
  FiLink, 
  FiHome,
  FiUser,
  FiMessageCircle,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiRefreshCw,
  FiClock,
  FiInfo,
  FiFileText,
  FiPhone,
  FiArrowRight,
  FiX,
  FiCheck
} from "react-icons/fi";
import { FaSearch } from 'react-icons/fa';
import { db, auth } from "../firebase";
import { 
  doc, 
  getDoc, 
  setDoc,
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardAffiliate = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [referredUsers, setReferredUsers] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Observar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        setEmail(user.email || "");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Cargar o crear datos del afiliado
  useEffect(() => {
    const fetchOrCreateAffiliateData = async () => {
      if (!userId) return;
      
      try {
        const affiliateRef = doc(db, "affiliates", userId);
        const affiliateDoc = await getDoc(affiliateRef);

        if (affiliateDoc.exists()) {
          // Si el documento existe, cargar los datos
          const affiliateData = affiliateDoc.data();
          setUserName(affiliateData.username || "Afiliado");
          setAffiliateCode(affiliateData.affiliateCode || "");
          setEarnings(Number(affiliateData.earnings) || 0);
        } else {
          // Si no existe, crear el documento con datos iniciales
          const newAffiliateCode = `AFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          
          await setDoc(affiliateRef, {
            username: "Nuevo Afiliado",
            email: email,
            affiliateCode: newAffiliateCode,
            earnings: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // Actualizar el estado local
          setUserName("Nuevo Afiliado");
          setAffiliateCode(newAffiliateCode);
          setEarnings(0);
        }
      } catch (error) {
        console.error("Error al manejar datos del afiliado:", error);
        setError("Error al cargar datos del afiliado");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateAffiliateData();
  }, [userId, email]);

  // Escuchar cambios en usuarios referidos recientes
  useEffect(() => {
    if (!affiliateCode) return;

    const referredQuery = query(
      collection(db, "users"), 
      where("referrerCode", "==", affiliateCode),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(referredQuery, (snapshot) => {
      const referredList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().createdAt?.toDate() || new Date()
      }));
      setRecentReferrals(referredList);
    });

    return () => unsubscribe();
  }, [affiliateCode]);

  // Escuchar cambios en todos los usuarios referidos
  useEffect(() => {
    if (!affiliateCode) return;

    const referredQuery = query(
      collection(db, "users"), 
      where("referrerCode", "==", affiliateCode)
    );
    
    const unsubscribe = onSnapshot(referredQuery, (snapshot) => {
      const referredList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().createdAt?.toDate() || new Date()
      }));
      setReferredUsers(referredList);
    });

    return () => unsubscribe();
  }, [affiliateCode]);

  // Copiar código de afiliado
  const copyToClipboard = () => {
    if (!affiliateCode) return;
    navigator.clipboard.writeText(affiliateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "No especificada";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError("Error al cerrar sesión");
    }
  };

  // Renderizar contenido según la página activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Recargar
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'inicio':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Bienvenido, <span className="text-cyan-400">{userName}</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Información de cuenta</h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-center">
                    <FiUser className="mr-2 text-cyan-400" />
                    <span>{userName}</span>
                  </p>
                  <p className="flex items-center">
                    <FiMessageCircle className="mr-2 text-cyan-400" />
                    <span>{email}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ganancias totales</h3>
                <p className="text-3xl font-bold text-white">S/ {earnings.toFixed(2)}</p>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Usuarios referidos</h3>
                <p className="text-3xl font-bold text-white">{referredUsers.length}</p>
              </div>
            </div>
            
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Tu código de afiliado</h3>
                <button
                  onClick={copyToClipboard}
                  disabled={!affiliateCode}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    affiliateCode 
                      ? "bg-cyan-900 text-cyan-400 hover:bg-cyan-800" 
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FiCopy size={16} />
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <p className="text-2xl font-bold text-center tracking-wider text-white">
                  {affiliateCode || "Generando código..."}
                </p>
              </div>
              
              <p className="text-gray-300 mb-4">
                Comparte este código con tus amigos para que se registren y ganes comisiones por sus compras.
              </p>
              
              <div className="bg-cyan-900 bg-opacity-30 p-4 rounded-lg border border-cyan-800">
                <h4 className="font-medium text-cyan-400 mb-2">Enlace de afiliado:</h4>
                <p className="text-sm bg-gray-800 p-2 rounded border border-gray-600 overflow-x-auto text-gray-300">
                  {affiliateCode 
                    ? `https://blackstreaming.com/registro?ref=${affiliateCode}`
                    : "Generando enlace..."}
                </p>
              </div>
            </div>
            
            <div className="mt-8 bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Referidos recientes</h3>
              
              {recentReferrals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha de registro</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700 divide-y divide-gray-600">
                      {recentReferrals.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-600 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{user.username || "Sin nombre"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(user.joinDate)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-400">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-400">No hay referidos recientes</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'referidos':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Todos tus referidos ({referredUsers.length})</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar referidos..."
                  className="px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            {referredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha de registro</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-600">
                    {referredUsers
                      .filter(user => 
                        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) || 
                        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((user, index) => (
                        <tr key={index} className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{user.username || "Sin nombre"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(user.joinDate)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-400">
                              Activo
                            </span>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No tienes referidos aún</h4>
                <p className="text-gray-400">Comparte tu código de afiliado para empezar a ganar comisiones</p>
              </div>
            )}
          </div>
        );

      case 'ganancias':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Reporte de ganancias</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias hoy</h4>
                <p className="text-3xl font-bold text-white">S/ 0.00</p>
                <p className="text-sm text-gray-400 mt-2">+0% desde ayer</p>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias esta semana</h4>
                <p className="text-3xl font-bold text-white">S/ 0.00</p>
                <p className="text-sm text-gray-400 mt-2">+0% desde la semana pasada</p>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias totales</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-2">+0% desde el mes pasado</p>
              </div>
            </div>
            
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-white mb-4">Historial de comisiones</h4>
              <div className="text-center py-12">
                <FiTrendingUp className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-400">Próximamente: Gráficos y reportes detallados</p>
              </div>
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Configuración de cuenta</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-gray-400 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Cambiar contraseña</label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              
              <button
                type="button"
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium mt-4 transition-colors"
              >
                Guardar cambios
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header móvil */}
      <header className="bg-gray-800 shadow-sm md:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-cyan-400">BlackStreaming</h1>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none text-gray-300 hover:text-white"
          >
            <FiMenu />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64 bg-gray-800 shadow-lg md:static`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-900 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-cyan-400">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-white">{userName}</p>
                <p className="text-sm text-gray-400 mt-1">Programa de Afiliados</p>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("inicio");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "inicio" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiHome className="mr-3" /> Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("referidos");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "referidos" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiUsers className="mr-3" /> Mis Referidos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("ganancias");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "ganancias" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiTrendingUp className="mr-3" /> Mis Ganancias
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("configuracion");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "configuracion" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiSettings className="mr-3" /> Configuración
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FiLogOut className="mr-2" /> Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64">
          {/* Overlay para móvil */}
          {menuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            ></div>
          )}
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardAffiliate;