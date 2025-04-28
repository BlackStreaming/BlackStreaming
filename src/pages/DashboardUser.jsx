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
  FiPhone,
  FiX
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
  serverTimestamp,
  onSnapshot
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
  const [activePage, setActivePage] = useState("inicio");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ show: false, message: "", title: "" });
  const navigate = useNavigate();

  // Function to show modal
  const showModal = (title, message) => {
    setModal({ show: true, title, message });
  };

  // Function to close modal
  const closeModal = () => {
    setModal({ show: false, message: "", title: "" });
  };

  // Función para renovar pedido
  const handleRenewal = async (order) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar saldo suficiente
      const price = parseFloat(order.price) || 0;
      if (balance < price) {
        setError("Saldo insuficiente para renovar el pedido. Por favor, recarga tu saldo.");
        return;
      }

      // Crear un nuevo pedido en la colección sales
      const newOrder = {
        customerId: userId,
        customerName: order.client?.customerName || "Cliente desconocido",
        customerEmail: order.client?.email || email,
        phoneNumber: order.client?.phone || "No especificado",
        productName: order.productName || "Producto sin nombre",
        type: order.category || "netflix",
        price: price,
        accountDetails: {
          email: order.account?.email || "No especificado",
          password: order.account?.password || "No especificado",
          profile: order.account?.profile || "No especificado",
        },
        provider: order.provider || "Proveedor desconocido",
        providerId: order.providerId || "",
        providerPhone: order.providerPhone || order.providerWhatsapp || "51999999999",
        status: "completed",
        createdAt: serverTimestamp(),
        saleDate: serverTimestamp(),
        startDate: serverTimestamp(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewedAt: serverTimestamp(),
      };

      // Guardar el nuevo pedido en la colección sales
      const saleRef = await addDoc(collection(db, "sales"), newOrder);

      // Actualizar el saldo del usuario
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: balance - price,
      });

      // Actualizar el estado local
      setBalance(prev => prev - price);
      setOrders(prev => [...prev, {
        ...newOrder,
        id: saleRef.id,
        saleDate: new Date(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        account: newOrder.accountDetails,
        client: {
          customerName: newOrder.customerName,
          email: newOrder.customerEmail,
          phone: newOrder.phoneNumber,
        },
        orderId: `BS-${saleRef.id.slice(0, 8).toUpperCase()}`,
      }]);

      showModal("Éxito", "¡Pedido renovado exitosamente!");
    } catch (error) {
      console.error("Error al renovar el pedido:", error);
      setError("Error al renovar el pedido: " + error.message);
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
        setEmail(user.email || "No especificado");
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
        const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.username || "Usuario");
            setEmail(userData.email || "No especificado");
            setBalance(Number(userData.balance) || 0);
          } else {
            setError("Usuario no encontrado");
          }
        }, (error) => {
          console.error("Error al obtener datos del usuario:", error);
          setError("Error al cargar datos del usuario");
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("Error al cargar datos del usuario");
      }
    };

    fetchUserData();
  }, [userId]);

  // Cargar pedidos desde la colección sales
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = () => {
      const q = query(
        collection(db, "sales"),
        where("customerId", "==", userId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const formattedOrders = snapshot.docs.map(doc => {
          const data = doc.data();
          const saleDate = data.saleDate?.toDate?.() || data.createdAt?.toDate?.() || new Date();
          const startDate = data.startDate?.toDate?.() || data.createdAt?.toDate?.() || new Date();
          const endDate = data.endDate
            ? new Date(data.endDate)
            : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          return {
            id: doc.id,
            productName: data.productName || "Producto sin nombre",
            category: data.type || "netflix",
            price: parseFloat(data.price) || 0,
            provider: data.provider || "No especificado",
            providerId: data.providerId || "",
            providerPhone: data.providerPhone || data.providerWhatsapp || "51999999999",
            providerWhatsapp: data.providerPhone || data.providerWhatsapp || "51999999999",
            status: data.status || "completed",
            saleDate: saleDate,
            startDate: startDate,
            endDate: endDate,
            account: {
              email: data.accountDetails?.email || "No especificado",
              password: data.accountDetails?.password || "No especificado",
              profile: data.accountDetails?.profile || "No especificado",
            },
            client: {
              customerName: data.customerName || "Cliente desconocido",
              email: data.customerEmail || "No especificado",
              phone: data.phoneNumber || "No especificado",
            },
            paymentMethod: "BlackStreaming",
            orderId: `BS-${doc.id.slice(0, 8).toUpperCase()}`,
          };
        });
        setOrders(formattedOrders);
        setLoading(false);
      }, (error) => {
        console.error("Error al obtener pedidos:", error);
        setError("Error al cargar pedidos");
        setLoading(false);
      });

      return unsubscribe;
    };

    fetchOrders();
  }, [userId]);

  // Cargar recargas
  useEffect(() => {
    if (!userId) return;

    const fetchTopUps = () => {
      const q = query(
        collection(db, "pendingTopUps"),
        where("userId", "==", userId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const topUpsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().requestedAt?.toDate?.() || new Date(),
          amount: parseFloat(doc.data().amount) || 0,
        }));
        setTopUps(topUpsList);
      }, (error) => {
        console.error("Error al obtener recargas:", error);
        setError("Error al cargar recargas");
      });

      return unsubscribe;
    };

    fetchTopUps();
  }, [userId]);

  // Solicitar recarga
  const handleTopUpRequest = async () => {
    try {
      if (!amount || isNaN(amount)) {
        setError("Ingrese un monto válido");
        return;
      }

      const amountNumber = parseFloat(amount);
      if (amountNumber < 10) {
        setError("El monto mínimo de recarga es S/ 10.00");
        return;
      }

      await addDoc(collection(db, "pendingTopUps"), {
        userId,
        username: userName,
        amount: amountNumber,
        status: "pendiente",
        requestedAt: serverTimestamp(),
      });

      setAmount("");
      showModal("Éxito", "Solicitud de recarga enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar recarga:", error);
      setError("Error al enviar solicitud de recarga");
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "No especificada";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "Fecha inválida";
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Fecha inválida";
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
            onClick={() => setError(null)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Aceptar
          </button>
        </div>
      );
    }

    switch (activePage) {
      case "inicio":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              Bienvenido, <span className="text-cyan-400">{userName}</span>
            </h2>
            
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
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Pedidos activos</h3>
                <p className="text-3xl font-bold text-white">
                  {orders.filter(o => {
                    const endDate = new Date(o.endDate);
                    return endDate > new Date() && o.status === "completed";
                  }).length}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-3">Pedidos recientes</h3>
              {orders.slice(0, 3).map((order, index) => {
                const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                const isOnDemand = order.status === "pending";
                return (
                  <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-white">{order.productName}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isOnDemand ? "bg-yellow-900 text-yellow-400" :
                        isActive ? "bg-green-900 text-green-400" :
                        "bg-red-900 text-red-400"
                      }`}>
                        {isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Vence: {formatDate(order.endDate)}
                    </p>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <p className="text-gray-400 py-2">No tienes pedidos recientes</p>
              )}
              {orders.length > 3 && (
                <button
                  onClick={() => setActivePage("pedidos")}
                  className="w-full mt-3 text-center text-cyan-400 hover:underline text-sm"
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          </div>
        );

      case "recargar":
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
                    placeholder="Mínimo S/ 10.00"
                    min="10"
                    step="0.01"
                  />
                </div>
                
                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount || parseFloat(amount) < 10}
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    amount && parseFloat(amount) >= 10
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>
              </div>

              {/* Instrucciones de método de pago */}
              <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600 max-w-md mx-auto">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <FiDollarSign className="mr-2" /> ¿Cómo realizar tu recarga?
                </h4>
                <p className="text-gray-300 mb-2">
                  Realiza tu pago mediante <span className="font-semibold text-white">Yape</span> al número:
                </p>
                <p className="text-xl font-bold text-white mb-2">📱 940505969</p>
                <p className="text-gray-300 mb-3">
                  Una vez realizado el pago, por favor contáctanos vía WhatsApp al mismo número para confirmar tu recarga.
                </p>
                <a
                  href="https://wa.me/51940505969?text=Hola%2C%20he%20realizado%20una%20recarga%20a%20trav%C3%A9s%20de%20Yape.%20Por%20favor%2C%20confirma%20mi%20pago."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FiMessageCircle className="mr-2" /> Confirmar por WhatsApp
                </a>
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
                          <td className="px-4 py-4 whitespace-nowrap text-white">S/ {topUp.amount.toFixed(2)}</td>
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

      case "pedidos":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Mis pedidos</h3>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const price = parseFloat(order.price) || 0;
                  const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                  const isOnDemand = order.status === "pending";
                  
                  const statusIcon = isOnDemand
                    ? <FiClock className="text-yellow-400" />
                    : isActive
                    ? <FiCheckCircle className="text-green-400" />
                    : <FiAlertCircle className="text-red-400" />;

                  const whatsappProviderMessage = encodeURIComponent(
                    `*Consulta sobre Pedido - ${order.productName || 'Sin nombre'}*\n\n` +
                    `*N° Pedido:* ${order.orderId || 'No especificado'}\n` +
                    `*Producto:* ${order.productName || 'No especificado'}\n` +
                    `*Precio:* S/ ${price.toFixed(2)}\n` +
                    `*Estado:* ${isOnDemand ? 'A pedido' : isActive ? 'Activo' : 'Expirado'}\n` +
                    `*Fecha de Inicio:* ${formatDate(order.startDate)}\n` +
                    `*Fecha de Vencimiento:* ${formatDate(order.endDate)}\n\n` +
                    (isOnDemand
                      ? `Hola, he comprado un producto a pedido (${order.productName}). ¿En cuántos días estará listo? Por favor, indíqueme los detalles para coordinar.`
                      : `Por favor indíqueme cómo puedo resolver mi consulta sobre este pedido.`)
                  );

                  const whatsappClientMessage = encodeURIComponent(
                    `Hola ${order.client?.customerName || 'Cliente'},\n\n` +
                    `*Aquí tienes la información de tu pedido en BlackStreaming:*\n` +
                    `*Producto:* ${order.productName || 'Sin nombre'}\n` +
                    `*N° Pedido:* ${order.orderId || 'No especificado'}\n` +
                    `*Precio:* S/ ${price.toFixed(2)}\n` +
                    `*Estado:* ${isOnDemand ? 'A pedido' : isActive ? 'Activo' : 'Expirado'}\n` +
                    `*Fecha de Inicio:* ${formatDate(order.startDate)}\n` +
                    `*Fecha de Vencimiento:* ${formatDate(order.endDate)}\n\n` +
                    (isOnDemand
                      ? `*Nota:* Este pedido está "A pedido". El proveedor se contactará contigo para coordinar los detalles.\n\n`
                      : `*Detalles de la Cuenta:*\n` +
                        `📧 *Email:* ${order.account?.email || 'No especificado'}\n` +
                        `🔑 *Contraseña:* ${order.account?.password || 'No especificado'}\n` +
                        `👤 *Perfil:* ${order.account?.profile || 'No especificado'}\n\n`) +
                    `Si tienes alguna duda o necesitas soporte, no dudes en contactarnos. ¡Gracias por elegir BlackStreaming!`
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
                              {isOnDemand ? (
                                <p className="text-gray-400">
                                  Este pedido está "A pedido". El proveedor se contactará contigo para proporcionarte los detalles.
                                </p>
                              ) : (
                                <>
                                  <p>
                                    <span className="font-medium text-gray-400">Email:</span> 
                                    <span className="block text-white break-all">{order.account?.email || 'No especificado'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Contraseña:</span> 
                                    <span className="block text-white break-all">{order.account?.password || 'No especificado'}</span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Perfil:</span> 
                                    <span className="block text-white">{order.account?.profile || 'No especificado'}</span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Sección de Información del Pedido y Proveedor */}
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
                                <span className="font-medium text-gray-400">Teléfono del Proveedor:</span> 
                                <span className="block text-white">{order.providerPhone || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Estado:</span> 
                                <span className={`block px-2 py-1 text-xs rounded-full ${
                                  isOnDemand ? 'bg-yellow-900 text-yellow-400' :
                                  isActive ? 'bg-green-900 text-green-400' :
                                  'bg-red-900 text-red-400'
                                }`}>
                                  {isOnDemand ? 'A pedido' : isActive ? 'Activo' : 'Expirado'}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Método de Pago:</span> 
                                <span className="block text-white">BlackStreaming</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Fecha de inicio:</span> 
                                <span className="block text-white">{formatDate(order.startDate)}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Fecha de vencimiento:</span> 
                                <span className="block text-white">{formatDate(order.endDate)}</span>
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
                                <span className="block text-white">{order.client?.customerName || 'No especificado'}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Teléfono:</span> 
                                <span className="block text-white">{order.client?.phone || 'No especificado'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a
                            href={`https://wa.me/${order.providerPhone}?text=${whatsappProviderMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <FiMessageCircle size={18} /> Contactar Proveedor
                          </a>
                          
                          <button
                            onClick={() => handleRenewal(order)}
                            disabled={loading}
                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                              loading 
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                                : "bg-cyan-600 hover:bg-cyan-700 text-white"
                            }`}
                          >
                            <FiRefreshCw size={18} /> Renovar Pedido
                          </button>

                          {order.client?.phone && (
                            <a
                              href={`https://wa.me/${order.client.phone}?text=${whatsappClientMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              <FiMessageCircle size={18} /> Contactar Cliente por WhatsApp
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

      case "configuracion":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Configuración de cuenta</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const userRef = doc(db, "users", userId);
                await setDoc(userRef, {
                  username: userName,
                  email: email,
                }, { merge: true });
                showModal("Éxito", "Configuración actualizada correctamente");
              } catch (error) {
                setError("Error al actualizar la configuración");
                console.error("Error updating settings:", error);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Cambiar contraseña</label>
                <input
                  type="password"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  disabled
                />
                <p className="text-sm text-gray-400 mt-1">Cambio de contraseña no disponible en esta versión.</p>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium mt-4"
              >
                Guardar cambios
              </button>
            </form>
            
            <div className="mt-8 border-t border-gray-700 pt-6">
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
              onClick={() => setActivePage('inicio')}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Volver al inicio
            </button>
          </div>
        );
    }
  };

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
              onClick={() => { setActivePage('inicio'); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'inicio' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FiHome /> <span>Inicio</span>
            </button>
            
            <button
              onClick={() => { setActivePage('recargar'); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'recargar' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FiDollarSign /> <span>Recargar saldo</span>
            </button>
            
            <button
              onClick={() => { setActivePage('pedidos'); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'pedidos' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <FiShoppingCart /> <span>Mis pedidos</span>
            </button>
            
            <button
              onClick={() => { setActivePage('configuracion'); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'configuracion' ? 'bg-cyan-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
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
      
      {/* Modal for Alerts */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{modal.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
              <p className="text-gray-300 mb-6">{modal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default DashboardUser;
