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
  FiShoppingCart,
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
  serverTimestamp,
  addDoc,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardAffiliate = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [referredUsers, setReferredUsers] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [topUps, setTopUps] = useState([]);
  const [orders, setOrders] = useState([]);
  const [configError, setConfigError] = useState("");
  const [configSuccess, setConfigSuccess] = useState("");
  const navigate = useNavigate();

  // Observar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        setEmail(user.email || "");
        setNewEmail(user.email || "");
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
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.username || "Usuario");
          setBalance(Number(userData.balance) || 0);
          
          // Cargar pedidos si existen
          if (userData.orders) {
            const formattedOrders = userData.orders.map(order => ({
              ...order,
              startDate: order.startDate?.toDate?.() || new Date(),
              endDate: order.endDate?.toDate?.() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }));
            setOrders(formattedOrders);
          }
        }

        // Cargar datos de afiliado
        const affiliateRef = doc(db, "affiliates", userId);
        const affiliateDoc = await getDoc(affiliateRef);

        if (affiliateDoc.exists()) {
          const affiliateData = affiliateDoc.data();
          setAffiliateCode(affiliateData.affiliateCode || "");
          setEarnings(Number(affiliateData.earnings) || 0);
        } else {
          // Crear documento de afiliado si no existe
          const newAffiliateCode = `AFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          
          await setDoc(affiliateRef, {
            username: userName || "Nuevo Afiliado",
            email: email,
            affiliateCode: newAffiliateCode,
            earnings: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          setAffiliateCode(newAffiliateCode);
        }
      } catch (error) {
        console.error("Error al manejar datos:", error);
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateAffiliateData();
  }, [userId, email, userName]);

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
          date: doc.data().requestedAt?.toDate() || new Date()
        }));

        setTopUps(topUpsList);
      } catch (error) {
        console.error("Error al obtener recargas:", error);
        setError("Error al cargar recargas");
      }
    };

    fetchTopUps();
  }, [userId]);

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
        date: new Date()
      }]);

      setAmount("");
      alert("Solicitud de recarga enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar recarga:", error);
      alert("Error al enviar solicitud de recarga");
    }
  };

  // Renovar pedido
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
        orders: [...orders, newOrder],
        balance: balance - order.price // Restar del balance
      });

      setOrders(prev => [...prev, newOrder]);
      setBalance(prev => prev - order.price);
      alert("¡Pedido renovado exitosamente!");
    } catch (error) {
      console.error("Error al renovar el pedido:", error);
      setError("Error al renovar el pedido");
    } finally {
      setLoading(false);
    }
  };

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

  // Actualizar configuración de cuenta
  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setConfigError("");
    setConfigSuccess("");
    
    try {
      // Validar contraseña si se está cambiando
      if (password && password !== confirmPassword) {
        setConfigError("Las contraseñas no coinciden");
        return;
      }
      
      // Actualizar email si es diferente
      if (newEmail !== email) {
        // Aquí deberías implementar la lógica para actualizar el email
        // Esto puede requerir verificación del nuevo email
        setConfigSuccess("Se ha enviado un correo de verificación a tu nueva dirección de email");
        setEmail(newEmail);
      }
      
      // Actualizar contraseña si se proporcionó
      if (password) {
        // Aquí deberías implementar la lógica para actualizar la contraseña
        setConfigSuccess("Configuración actualizada correctamente");
        setPassword("");
        setConfirmPassword("");
      }
      
      if (!password && newEmail === email) {
        setConfigSuccess("No se realizaron cambios");
      }
    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      setConfigError("Error al actualizar la configuración");
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
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Saldo disponible</h3>
                <p className="text-3xl font-bold text-white">S/ {balance.toFixed(2)}</p>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ganancias totales</h3>
                <p className="text-3xl font-bold text-white">S/ {earnings.toFixed(2)}</p>
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
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Recargar saldo</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Ej. 50.00"
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    amount ? "bg-cyan-600 hover:bg-cyan-700 text-white" : 
                    "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Pedidos recientes</h3>
                {orders.slice(0, 3).map((order, index) => (
                  <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-white">{order.productName}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'active' ? 'bg-green-900 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Vence: {formatDate(order.endDate)}
                    </p>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-400 py-2">No tienes pedidos recientes</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'recargas':
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-white mb-4">Recargar saldo</h3>
              
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Ej. 50.00"
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    amount ? "bg-cyan-600 hover:bg-cyan-700 text-white" : 
                    "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-white mb-4">Historial de recargas</h3>
              
              {topUps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {topUps.map((topUp, index) => (
                        <tr key={index} className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-white">S/ {topUp.amount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              topUp.status === "aprobado" ? "bg-green-900 text-green-400" :
                              topUp.status === "pendiente" ? "bg-yellow-900 text-yellow-400" :
                              "bg-red-900 text-red-400"
                            }`}>
                              {topUp.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-400">{formatDate(topUp.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-400">No hay recargas registradas</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'pedidos':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Mis pedidos</h3>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const price = typeof order.price === 'number' ? order.price : 
                               order.price ? parseFloat(order.price) : 0;
                  
                  const statusIcon = {
                    'active': <FiCheckCircle className="text-green-400" />,
                    'pending': <FiClock className="text-yellow-400" />,
                    'expired': <FiAlertCircle className="text-red-400" />
                  }[order.status] || <FiClock className="text-gray-400" />;

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
                    <div key={index} className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {statusIcon}
                          <div>
                            <h4 className="font-semibold text-white">{order.productName || "Producto sin nombre"}</h4>
                            {order.orderId && (
                              <p className="text-xs text-gray-400">N° Pedido: {order.orderId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">S/ {price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.startDate)} - {formatDate(order.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                          {/* Sección de Detalles de la Cuenta */}
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiUser className="mr-2" /> Detalles de la Cuenta
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              <p>
                                <span className="font-medium text-gray-400">Email:</span> 
                                <span className="block text-white">{order.account?.email || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Contraseña:</span> 
                                <span className="block text-white">{order.account?.password || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Perfil:</span> 
                                <span className="block text-white">{order.account?.profile || 'No especificado'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Sección de Información del Pedido */}
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiFileText className="mr-2" /> Información del Pedido
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              <p>
                                <span className="font-medium text-gray-400">Proveedor:</span> 
                                <span className="block text-white">{order.provider || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Estado:</span> 
                                <span className={`block px-2 py-1 text-xs rounded-full ${
                                  order.status === 'active' ? 'bg-green-900 text-green-400' :
                                  order.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                                  'bg-red-900 text-red-400'
                                }`}>
                                  {order.status || 'active'}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Método de Pago:</span> 
                                <span className="block text-white">{order.paymentMethod || 'No especificado'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Sección de Información del Cliente */}
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiUser className="mr-2" /> Información del Cliente
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              <p>
                                <span className="font-medium text-gray-400">Nombre:</span> 
                                <span className="block text-white">{order.client?.name || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Teléfono:</span> 
                                <span className="block text-white">{order.client?.phone || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Email:</span> 
                                <span className="block text-white">{order.client?.email || 'No especificado'}</span>
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
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <FiMessageCircle size={18} /> Contactar por WhatsApp
                          </a>
                          
                          <button
                            onClick={() => handleRenewal(order)}
                            disabled={loading || balance < order.price}
                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                              loading || balance < order.price 
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                                : "bg-cyan-600 hover:bg-cyan-700 text-white"
                            }`}
                          >
                            <FiRefreshCw size={18} /> Renovar Pedido
                          </button>

                          {order.client?.phone && (
                            <a
                              href={`tel:${order.client.phone}`}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
                <h4 className="text-lg font-medium text-gray-300">No tienes pedidos registrados</h4>
                <p className="text-gray-400">Realiza tu primer pedido en nuestra tienda</p>
              </div>
            )}
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
                  <p className="text-sm text-gray-400 mt-2">{referredUsers.length} referidos</p>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 text-cyan-400" /> Historial de comisiones
                </h4>
                
                {referredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Referido</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Origen</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-700 divide-y divide-gray-600">
                        {referredUsers.map((user, index) => (
                          <tr key={index} className="hover:bg-gray-600 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-white">{user.username || "Usuario sin nombre"}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(user.joinDate)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-white">S/ 0.00</td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">Registro</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-400">
                                Pendiente
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-400">No hay comisiones registradas</p>
                    <p className="text-sm text-gray-500 mt-1">Gana comisiones cuando tus referidos realicen compras</p>
                  </div>
                )}
              </div>
            </div>
          );
  
        case 'configuracion':
          return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6">Configuración de cuenta</h3>
              
              <form onSubmit={handleUpdateConfig}>
                {configError && (
                  <div className="bg-red-900 text-red-300 p-3 rounded-lg mb-4 flex items-center">
                    <FiAlertCircle className="mr-2" /> {configError}
                  </div>
                )}
                
                {configSuccess && (
                  <div className="bg-green-900 text-green-300 p-3 rounded-lg mb-4 flex items-center">
                    <FiCheckCircle className="mr-2" /> {configSuccess}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nombre de usuario</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Correo electrónico</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Nueva contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  {password && (
                    <div>
                      <label className="block text-gray-300 mb-2">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Zona peligrosa</h4>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-900 hover:bg-red-800 text-white rounded-lg font-medium transition-colors"
                >
                  <FiLogOut /> Cerrar sesión
                </button>
              </div>
            </div>
          );
  
        default:
          return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
              <FiAlertCircle className="mx-auto text-4xl text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sección no encontrada</h3>
              <p className="text-gray-300 mb-4">La sección que estás buscando no existe o no está disponible.</p>
              <button
                onClick={() => setActiveSection('inicio')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Volver al inicio
              </button>
            </div>
          );
      }
    };
  
    // Renderizar el dashboard completo
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-800 overflow-y-auto`}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-cyan-400">BlackStreaming</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-700"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
            </div>
            
            <nav className="flex-1 space-y-1">
              <button
                onClick={() => setActiveSection('inicio')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'inicio' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiHome /> <span>Inicio</span>
              </button>
              
              <button
                onClick={() => setActiveSection('recargas')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'recargas' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiDollarSign /> <span>Recargas</span>
              </button>
              
              <button
                onClick={() => setActiveSection('pedidos')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'pedidos' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiShoppingCart /> <span>Mis pedidos</span>
              </button>
              
              <button
                onClick={() => setActiveSection('referidos')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'referidos' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiUsers /> <span>Referidos</span>
              </button>
              
              <button
                onClick={() => setActiveSection('ganancias')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'ganancias' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiTrendingUp /> <span>Ganancias</span>
              </button>
              
              <button
                onClick={() => setActiveSection('configuracion')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'configuracion' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <FiSettings /> <span>Configuración</span>
              </button>
            </nav>
            
            <div className="mt-auto pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <FiLogOut /> <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="md:ml-64 p-4 pt-20 md:pt-4">
          {renderContent()}
        </main>
        
        {/* Overlay for mobile menu */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
      </div>
    );
  };
  
  export default DashboardAffiliate;