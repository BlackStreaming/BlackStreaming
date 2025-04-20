import React, { useState, useEffect } from "react";
import { 
  FiSettings, 
  FiLogOut, 
  FiDollarSign, 
  FiShoppingCart, 
  FiMenu, 
  FiHome,
  FiMessageCircle,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiFileText,
  FiPhone
} from "react-icons/fi";
import { db, auth } from "../firebase";
import { 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardUser = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [topUps, setTopUps] = useState([]);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [activePage, setActivePage] = useState("Inicio");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para renovar pedido
  const handleRenewal = async (order) => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", userId);
      
      const newOrder = {
        ...order,
        startDate: serverTimestamp(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewedAt: serverTimestamp(),
        status: "active"
      };

      await updateDoc(userRef, {
        orders: [...orders, newOrder]
      });

      setOrders(prev => [...prev, newOrder]);
      alert("¡Pedido renovado exitosamente!");
    } catch (error) {
      console.error("Error al renovar el pedido:", error);
      setError("Error al renovar el pedido");
    } finally {
      setLoading(false);
    }
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

  // Efecto para autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Cargar datos del usuario
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.username || "Usuario");
          setEmail(userData.email || "No especificado");
          setBalance(Number(userData.balance) || 0);
          
          // Cargar pedidos
          if (userData.orders) {
            const formattedOrders = userData.orders.map(order => ({
              ...order,
              startDate: order.startDate?.toDate?.() || new Date(),
              endDate: order.endDate?.toDate?.() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }));
            setOrders(formattedOrders);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("Error al cargar datos del usuario");
      }
    };

    fetchUserData();
  }, [userId]);

  // Cargar recargas
  useEffect(() => {
    if (!userId) return;

    const fetchTopUps = async () => {
      try {
        const topUpsRef = collection(db, "pendingTopUps");
        const q = query(topUpsRef, where("userId", "==", userId));
        const topUpsSnapshot = await getDocs(q);
        
        const topUpsList = topUpsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().requestedAt?.toDate().toLocaleDateString() || "No especificada"
        }));

        setTopUps(topUpsList);
      } catch (error) {
        console.error("Error al obtener recargas:", error);
        setError("Error al cargar recargas");
      }
    };

    fetchTopUps();
  }, [userId]);

  // Solicitar recarga
  const handleTopUpRequest = async () => {
    try {
      if (!amount || isNaN(amount)) {
        alert("Ingrese un monto válido");
        return;
      }

      const amountNumber = parseFloat(amount);
      if (amountNumber <= 0) {
        alert("El monto debe ser mayor a 0");
        return;
      }

      await addDoc(collection(db, "pendingTopUps"), {
        userId,
        username: userName,
        amount: amountNumber,
        status: "pendiente",
        requestedAt: serverTimestamp()
      });

      setTopUps(prev => [...prev, {
        amount: amountNumber,
        status: "pendiente",
        date: new Date().toLocaleDateString()
      }]);

      setAmount("");
      alert("Solicitud de recarga enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar recarga:", error);
      alert("Error al enviar solicitud de recarga");
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Renderizar contenido según la página activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Recargar
          </button>
        </div>
      );
    }

    switch (activePage) {
      case "Inicio":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {userName}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Información de cuenta</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center">
                    <FiUser className="mr-2 text-indigo-500" />
                    <span>{userName}</span>
                  </p>
                  <p className="flex items-center">
                    <FiMessageCircle className="mr-2 text-indigo-500" />
                    <span>{email}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Saldo disponible</h3>
                <p className="text-3xl font-bold text-green-600">S/ {balance.toFixed(2)}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Pedidos activos</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'active').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Pedidos recientes</h3>
              {orders.slice(0, 3).map((order, index) => (
                <div key={index} className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{order.productName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'active' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Vence: {formatDate(order.endDate)}
                  </p>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-500 py-2">No tienes pedidos recientes</p>
              )}
            </div>
          </div>
        );

      case "Recargar":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recargar saldo</h3>
              
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej. 50.00"
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    amount ? "bg-indigo-600 hover:bg-indigo-700 text-white" : 
                    "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de recargas</h3>
              
              {topUps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topUps.map((topUp, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600">S/ {topUp.amount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              topUp.status === "aprobado" ? "bg-green-100 text-green-800" :
                              topUp.status === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {topUp.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600">{topUp.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">No hay recargas registradas</p>
                </div>
              )}
            </div>
          </div>
        );

      case "Pedidos":
          return (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Mis pedidos</h3>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order, index) => {
                    // Convertir price a número si no lo es
                    const price = typeof order.price === 'number' ? order.price : 
                                 order.price ? parseFloat(order.price) : 0;
                    
                    const statusIcon = {
                      'active': <FiCheckCircle className="text-green-500" />,
                      'pending': <FiClock className="text-yellow-500" />,
                      'expired': <FiAlertCircle className="text-red-500" />
                    }[order.status] || <FiClock className="text-gray-500" />;
      
                    // Generar mensaje para WhatsApp con toda la información
                    const whatsappMessage = encodeURIComponent(
                      `*Información del Pedido - ${order.productName || 'Sin nombre'}*\n\n` +
                      `*N° Pedido:* ${order.orderId || 'No especificado'}\n` +
                      `*Producto:* ${order.productName || 'No especificado'}\n` +
                      `*Precio:* S/ ${price.toFixed(2)}\n` +
                      `*Estado:* ${order.status || 'active'}\n` +
                      `*Fecha de Inicio:* ${formatDate(order.startDate)}\n` +
                      `*Fecha de Vencimiento:* ${formatDate(order.endDate)}\n\n` +
                      `*Detalles de la Cuenta:*\n` +
                      `📧 *Email:* ${order.account?.email || 'No especificado'}\n` +
                      `🔑 *Contraseña:* ${order.account?.password || 'No especificado'}\n` +
                      `👤 *Perfil:* ${order.account?.profile || 'No especificado'}\n\n` +
                      `*Información del Cliente:*\n` +
                      `👤 *Nombre:* ${order.client?.name || 'No especificado'}\n` +
                      `📱 *Teléfono:* ${order.client?.phone || 'No especificado'}\n` +
                      `📧 *Email:* ${order.client?.email || 'No especificado'}\n\n` +
                      `*Mensaje adicional:* Por favor indíqueme cómo puedo resolver mi consulta sobre este pedido.`
                    );
      
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {statusIcon}
                            <div>
                              <h4 className="font-semibold text-gray-800">{order.productName || "Producto sin nombre"}</h4>
                              {order.orderId && (
                                <p className="text-xs text-gray-500">N° Pedido: {order.orderId}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">S/ {price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(order.startDate)} - {formatDate(order.endDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            {/* Sección de Detalles de la Cuenta */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <FiUser className="mr-2" /> Detalles de la Cuenta
                              </h5>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium text-gray-600">Email:</span> 
                                  <span className="block text-gray-800">{order.account?.email || 'No especificado'}</span>
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Contraseña:</span> 
                                  <span className="block text-gray-800">{order.account?.password || 'No especificado'}</span>
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Perfil:</span> 
                                  <span className="block text-gray-800">{order.account?.profile || 'No especificado'}</span>
                                </p>
                              </div>
                            </div>
      
                            {/* Sección de Información del Pedido */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h5 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                                <FiFileText className="mr-2" /> Información del Pedido
                              </h5>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium text-blue-600">Proveedor:</span> 
                                  <span className="block text-blue-800">{order.provider || 'No especificado'}</span>
                                </p>
                                <p>
                                  <span className="font-medium text-blue-600">Estado:</span> 
                                  <span className={`block px-2 py-1 text-xs rounded-full ${
                                    order.status === 'active' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status || 'active'}
                                  </span>
                                </p>
                                <p>
                                  <span className="font-medium text-blue-600">Método de Pago:</span> 
                                  <span className="block text-blue-800">{order.paymentMethod || 'No especificado'}</span>
                                </p>
                              </div>
                            </div>
      
                            {/* Sección de Información del Cliente */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <h5 className="text-sm font-medium text-purple-700 mb-3 flex items-center">
                                <FiUser className="mr-2" /> Información del Cliente
                              </h5>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium text-purple-600">Nombre:</span> 
                                  <span className="block text-purple-800">{order.client?.name || 'No especificado'}</span>
                                </p>
                                <p>
                                  <span className="font-medium text-purple-600">Teléfono:</span> 
                                  <span className="block text-purple-800">{order.client?.phone || 'No especificado'}</span>
                                </p>
                                <p>
                                  <span className="font-medium text-purple-600">Email:</span> 
                                  <span className="block text-purple-800">{order.client?.email || 'No especificado'}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={`https://wa.me/${order.providerWhatsapp || '51999999999'}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                              <FiMessageCircle size={18} /> Contactar por WhatsApp
                            </a>
                            
                            <button
                              onClick={() => handleRenewal(order)}
                              disabled={loading}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-indigo-400"
                            >
                              <FiRefreshCw size={18} /> Renovar Pedido
                            </button>
      
                            {order.client?.phone && (
                              <a
                                href={`tel:${order.client.phone}`}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                              >
                                <FiPhone size={18} /> Llamar al Cliente
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-600">No tienes pedidos registrados</h4>
                  <p className="text-gray-500">Realiza tu primer pedido en nuestra tienda</p>
                </div>
              )}
            </div>
          );

      case "configuracion":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Configuración de cuenta</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Cambiar contraseña</label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button
                type="button"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium mt-4"
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header móvil */}
      <header className="bg-white shadow-sm md:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">BlackStreaming</h1>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none text-gray-700"
          >
            <FiMenu />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64 bg-white shadow-lg md:static`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-gray-800">{userName}</p>
                <p className="text-2xl font-bold mt-2 bg-indigo-100 text-indigo-700 py-1 px-3 rounded-lg inline-block">
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActivePage("Inicio");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activePage === "Inicio" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiHome className="mr-3" /> Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActivePage("Recargar");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activePage === "Recargar" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiDollarSign className="mr-3" /> Recargar saldo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActivePage("Pedidos");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activePage === "Pedidos" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiShoppingCart className="mr-3" /> Mis pedidos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActivePage("configuracion");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activePage === "configuracion" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiSettings className="mr-3" /> Configuración
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2"
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

export default DashboardUser;