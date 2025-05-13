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
  FiFileText,
  FiPhone,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
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
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DashboardAffiliate = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
  const [products, setProducts] = useState({});
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

  // Observar cambios de autenticación
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

  // Fetch products to get terms and conditions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(collection(db, "products"));
        const querySnapshot = await getDocs(productsQuery);
        const productsData = {};
        querySnapshot.forEach((doc) => {
          productsData[doc.id] = doc.data();
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al cargar productos");
      }
    };
    fetchProducts();
  }, []);

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
          const newAffiliateCode = `AFF-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`;

          await setDoc(affiliateRef, {
            username: userName || "Nuevo Afiliado",
            email: email,
            affiliateCode: newAffiliateCode,
            earnings: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
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

  // Escuchar recargas y actualizar saldo cuando se aprueban
  useEffect(() => {
  if (!userId) return;

  const topUpsRef = collection(db, "pendingTopUps");
  const q = query(topUpsRef, where("userId", "==", userId));

  // Conjunto para rastrear recargas en procesamiento
  const processingTopUps = new Set();

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const topUpsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().requestedAt?.toDate() || new Date(),
        amount: parseFloat(doc.data().amount) || 0,
      }));
      setTopUps(topUpsList);

      // Procesar recargas aprobadas
      for (const topUp of topUpsList) {
        if (topUp.status === "aprobado" && !topUp.processed && !processingTopUps.has(topUp.id)) {
          processingTopUps.add(topUp.id); // Marcar como en procesamiento

          try {
            await runTransaction(db, async (transaction) => {
              const topUpRef = doc(db, "pendingTopUps", topUp.id);
              const userRef = doc(db, "users", userId);

              // Obtener el estado actual de la recarga
              const topUpDoc = await transaction.get(topUpRef);
              if (!topUpDoc.exists()) {
                throw new Error("La recarga no existe");
              }

              const topUpData = topUpDoc.data();
              if (topUpData.processed || topUpData.status !== "aprobado") {
                return; // Ya procesada o no aprobada, salir
              }

              // Obtener el saldo actual del usuario
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists()) {
                throw new Error("El usuario no existe");
              }

              const currentBalance = Number(userDoc.data().balance) || 0;
              const newBalance = currentBalance + Number(topUp.amount || 0);

              // Actualizar el saldo del usuario
              transaction.update(userRef, {
                balance: newBalance,
                updatedAt: serverTimestamp(),
              });

              // Marcar la recarga como procesada
              transaction.update(topUpRef, {
                processed: true,
                updatedAt: serverTimestamp(),
              });
            });

            setBalance((prev) => prev + Number(topUp.amount || 0));
          } catch (error) {
            console.error("Error al procesar recarga:", error);
            setError("Error al actualizar saldo tras aprobación de recarga");
          } finally {
            processingTopUps.delete(topUp.id); // Liberar el ID
          }
        }
      }
    },
    (error) => {
      console.error("Error al escuchar recargas:", error);
      setError("Error al cargar recargas");
    }
  );

  return () => unsubscribe();
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
      const referredList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().createdAt?.toDate() || new Date(),
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
      const referredList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().createdAt?.toDate() || new Date(),
      }));
      setReferredUsers(referredList);
    });

    return () => unsubscribe();
  }, [affiliateCode]);

  // Cargar pedidos desde la colección sales con contador de días
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = () => {
      const q = query(collection(db, "sales"), where("customerId", "==", userId));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            setOrders([]);
            setLoading(false);
            return;
          }

          const formattedOrders = snapshot.docs.map((saleDoc) => {
            const data = saleDoc.data();
            const saleDateRaw = data.saleDate?.toDate?.() || data.createdAt?.toDate?.() || new Date();
            const saleDate = saleDateRaw;

            let startDateRaw = data.startDate?.toDate?.();
            let startDate = startDateRaw || saleDate;
            let shouldUpdateFirestore = false;

            if (!startDateRaw) {
              shouldUpdateFirestore = true;
            }

            const durationDays = data.durationDays || 30;
            let endDate;

            if (data.endDate) {
              endDate = new Date(data.endDate);
            } else {
              endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
              shouldUpdateFirestore = true;
            }

            if (shouldUpdateFirestore) {
              updateDoc(doc(db, "sales", saleDoc.id), {
                startDate: startDateRaw || Timestamp.fromDate(saleDate),
                endDate: endDate.toISOString(),
                durationDays: durationDays,
              }).catch((error) => {
                console.error("Error al actualizar startDate/endDate en Firestore:", error);
              });
            }

            const now = new Date();
            const totalDurationMs = endDate.getTime() - startDate.getTime();
            const elapsedMs = now.getTime() - startDate.getTime();
            const remainingMs = endDate.getTime() - now.getTime();

            const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
            const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
            const timeElapsedPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 100;

            const productTerms = products[data.providerId]?.terms || "No se especificaron términos y condiciones.";

            return {
              id: saleDoc.id,
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
              durationDays: durationDays,
              daysRemaining: daysRemaining,
              totalDays: totalDays,
              timeElapsedPercentage: timeElapsedPercentage,
              account: {
                email: data.accountDetails?.email || "No especificado",
                password: data.accountDetails?.password || "No especificado",
                profile: data.accountDetails?.profile || "No especificado",
                pin: data.accountDetails?.pin || "No especificado",
              },
              client: {
                name: data.customerName || "Cliente desconocido",
                email: data.customerEmail || "No especificado",
                phone: data.phoneNumber || "No especificado",
              },
              paymentMethod: "BlackStreaming",
              orderId: `BS-${saleDoc.id.slice(0, 8).toUpperCase()}`,
              termsAndConditions: productTerms,
              renewable: data.renewable !== undefined ? data.renewable : true,
            };
          });

          setOrders(formattedOrders);
          setLoading(false);
        },
        (error) => {
          console.error("Error al obtener pedidos:", error);
          setError("Error al cargar pedidos: " + error.message);
          setLoading(false);
        }
      );

      const interval = setInterval(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            const now = new Date();
            const totalDurationMs = new Date(order.endDate).getTime() - new Date(order.startDate).getTime();
            const elapsedMs = now.getTime() - new Date(order.startDate).getTime();
            const remainingMs = new Date(order.endDate).getTime() - now.getTime();

            const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
            const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
            const timeElapsedPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 100;

            return { ...order, daysRemaining, totalDays, timeElapsedPercentage };
          })
        );
      }, 60000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    };

    fetchOrders();
  }, [userId, products]);

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
        processed: false,
      });

      setAmount("");
      showModal("Éxito", "Solicitud de recarga enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar recarga:", error);
      setError("Error al enviar solicitud de recarga");
    }
  };

  // Renovar pedido
  const handleRenewal = async (order) => {
    try {
      setLoading(true);
      setError(null);

      const price = parseFloat(order.price) || 0;
      if (balance < price) {
        setError("Saldo insuficiente para renovar el pedido. Por favor, recarga tu saldo.");
        return;
      }

      const durationDays = parseInt(order.durationDays) || 30;
      const nowTimestamp = Timestamp.now();
      const nowDate = nowTimestamp.toDate();
      const endDate = new Date(nowDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const endDateISOString = endDate.toISOString();

      const newOrder = {
        customerId: userId,
        customerName: order.client?.name || "Cliente desconocido",
        customerEmail: order.client?.email || email,
        phoneNumber: order.client?.phone || "No especificado",
        productName: order.productName || "Producto sin nombre",
        type: order.category || "netflix",
        price: price,
        accountDetails: {
          email: order.account?.email || "No especificado",
          password: order.account?.password || "No especificado",
          profile: order.account?.profile || "No especificado",
          pin: order.account?.pin || "No especificado",
        },
        provider: order.provider || "Proveedor desconocido",
        providerId: order.providerId || "",
        providerPhone: order.providerPhone || order.providerWhatsapp || "51999999999",
        status: "completed",
        createdAt: nowTimestamp,
        saleDate: nowTimestamp,
        startDate: nowTimestamp,
        endDate: endDateISOString,
        durationDays: durationDays,
        renewedAt: nowTimestamp,
        renewable: order.renewable !== undefined ? order.renewable : true,
      };

      const saleRef = await addDoc(collection(db, "sales"), newOrder);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: balance - price,
      });

      setBalance((prev) => prev - price);
      setOrders((prev) => [
        ...prev,
        {
          ...newOrder,
          id: saleRef.id,
          saleDate: nowDate,
          startDate: nowDate,
          endDate: endDate,
          account: newOrder.accountDetails,
          client: {
            name: newOrder.customerName,
            email: newOrder.customerEmail,
            phone: newOrder.phoneNumber,
          },
          orderId: `BS-${saleRef.id.slice(0, 8).toUpperCase()}`,
          renewable: newOrder.renewable,
          daysRemaining: durationDays,
          totalDays: durationDays,
          timeElapsedPercentage: 0,
          termsAndConditions: products[newOrder.providerId]?.terms || "No se especificaron términos y condiciones.",
        },
      ]);

      showModal("Éxito", "¡Pedido renovado exitosamente!");
    } catch (error) {
      console.error("Error al renovar el pedido:", error);
      setError("Error al renovar el pedido: " + error.message);
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

  // Formatear fecha con manejo de valores nulos
  const formatDate = (date) => {
    if (!date) return "No especificada";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "Fecha inválida";
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Fecha inválida";
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

  // Actualizar contraseña
  const handleUpdatePassword = async () => {
    try {
      if (!newPassword) {
        setError("Por favor, ingrese una nueva contraseña");
        return;
      }
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setNewPassword("");
        showModal("Éxito", "Contraseña actualizada correctamente");
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      setError("Error al actualizar la contraseña: " + error.message);
    }
  };

  // Renderizar contenido según la página activa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center max-w-2xl mx-auto border border-gray-700/50">
          <FiAlertCircle className="mx-auto text-4xl text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
          >
            Aceptar
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Bienvenido, <span className="text-cyan-400">{userName}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
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

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Saldo disponible</h3>
                <p className="text-3xl font-bold text-white">S/ {balance.toFixed(2)}</p>
              </div>

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ganancias totales</h3>
                <p className="text-3xl font-bold text-white">S/ {earnings.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Tu código de afiliado</h3>
                <button
                  onClick={copyToClipboard}
                  disabled={!affiliateCode}
                  className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all duration-300 ${
                    affiliateCode
                      ? "bg-cyan-900/80 text-cyan-400 hover:bg-cyan-800/80"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FiCopy size={16} />
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl mb-6 border border-gray-600/50">
                <p className="text-2xl font-bold text-center tracking-wider text-white">
                  {affiliateCode || "Generando código..."}
                </p>
              </div>

              <p className="text-gray-300 mb-4">
                Comparte este código con tus amigos para que se registren y ganes comisiones por sus compras.
              </p>

              <div className="bg-cyan-900/30 p-4 rounded-xl border border-cyan-800/50">
                <h4 className="font-medium text-cyan-400 mb-2">Enlace de afiliado:</h4>
                <p className="text-sm bg-gray-800/50 p-2 rounded-xl border border-gray-600/50 overflow-x-auto text-gray-300">
                  {affiliateCode
                    ? `https://blackkstreaming.com/registro?ref=${affiliateCode}`
                    : "Generando enlace..."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Recargar saldo</h3>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                    placeholder="Mínimo S/ 10.00"
                    min="10"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount || parseFloat(amount) < 10}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    amount && parseFloat(amount) >= 10
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>
              </div>

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Pedidos recientes</h3>
                {orders.slice(0, 3).map((order, index) => {
                  const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                  const isOnDemand = order.status === "pending";
                  return (
                    <div
                      key={index}
                      className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{order.productName}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            isOnDemand
                              ? "bg-yellow-900/80 text-yellow-400"
                              : isActive
                              ? "bg-green-900/80 text-green-400"
                              : "bg-red-900/80 text-red-400"
                          }`}
                        >
                          {isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Vence: {formatDate(order.endDate)}</p>
                    </div>
                  );
                })}
                {orders.length === 0 && <p className="text-gray-400 py-2">No tienes pedidos recientes</p>}
                {orders.length > 3 && (
                  <button
                    onClick={() => setActiveSection("pedidos")}
                    className="w-full mt-3 text-center text-cyan-400 hover:underline text-sm"
                  >
                    Ver todos los pedidos
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case "recargas":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Recargar saldo</h3>

              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                    placeholder="Mínimo S/ 10.00"
                    min="10"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={handleTopUpRequest}
                  disabled={!amount || parseFloat(amount) < 10}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    amount && parseFloat(amount) >= 10
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Solicitar recarga
                </button>

                <div className="mt-6 bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
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
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300"
                  >
                    <FiMessageCircle className="mr-2" /> Confirmar por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Historial de recargas</h3>

              {topUps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600/50">
                    <thead className="bg-gray-700/50 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                      {topUps.map((topUp, index) => {
                        const whatsappMessage = encodeURIComponent(
                          `Hola, he pedido una recarga de S/ ${topUp.amount?.toFixed(2) || "0.00"} con el nombre ${
                            userName
                          }. Adjunto la captura de mi pago, por favor.`
                        );
                        return (
                          <tr key={index} className="hover:bg-gray-700/50 transition-all duration-300">
                            <td className="px-4 py-4 whitespace-nowrap text-white">
                              S/ {topUp.amount?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  topUp.status === "aprobado"
                                    ? "bg-green-900/80 text-green-400"
                                    : topUp.status === "pendiente"
                                    ? "bg-yellow-900/80 text-yellow-400"
                                    : "bg-red-900/80 text-red-400"
                                }`}
                              >
                                {topUp.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-400">{formatDate(topUp.date)}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {topUp.status === "pendiente" ? (
                                <a
                                  href={`https://wa.me/51940505969?text=${whatsappMessage}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 text-sm"
                                >
                                  <FiMessageCircle className="mr-2" /> Enviar captura
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Mis pedidos</h3>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, index) => {
                  const price = parseFloat(order.price) || 0;
                  const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                  const isOnDemand = order.status === "pending";
                  const daysRemaining = order.daysRemaining || 0;
                  const timeElapsedPercentage = order.timeElapsedPercentage || 0;

                  let countdownColor = "text-green-400";
                  if (timeElapsedPercentage > 70 && timeElapsedPercentage <= 90) {
                    countdownColor = "text-yellow-400";
                  } else if (timeElapsedPercentage > 90) {
                    countdownColor = "text-red-400";
                  }

                  const statusIcon = isOnDemand ? (
                    <FiClock className="text-yellow-400" />
                  ) : isActive ? (
                    <FiCheckCircle className="text-green-400" />
                  ) : (
                    <FiAlertCircle className="text-red-400" />
                  );

                  const whatsappProviderMessage = encodeURIComponent(
                    `*Consulta sobre Pedido - ${order.productName || "Sin nombre"}*\n\n` +
                      `*N° Pedido:* ${order.orderId || "No especificado"}\n` +
                      `*Producto:* ${order.productName || "No especificado"}\n` +
                      `*Precio:* S/ ${price.toFixed(2)}\n` +
                      `*Estado:* ${isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}\n` +
                      `*Fecha de Inicio:* ${formatDate(order.startDate)}\n` +
                      `*Fecha de Vencimiento:* ${formatDate(order.endDate)}\n\n` +
                      (isOnDemand
                        ? `Hola 😊, he comprado un producto a pedido (${order.productName}). ¿En cuántos días estará listo? Por favor, indíqueme los detalles para coordinar.`
                        : `Por favor indíqueme cómo puedo resolver mi consulta sobre este pedido.`)
                  );

                  const whatsappClientMessage = encodeURIComponent(
                    `😊 Estimado/a ${order.client?.name || "Cliente"} 😊\n\n` +
                      `Le enviamos la información de su suscripción a nuestro servicio de streaming:\n` +
                      `📌 Tipo: ${order.productName || "Sin nombre"}.\n` +
                      `🔢 Código: ${order.orderId || "No especificado"}\n` +
                      (isOnDemand
                        ? ""
                        : `📧 Correo: ${order.account?.email || "No especificado"}\n` +
                          `🔐 Contraseña: ${order.account?.password || "No especificado"}\n` +
                          `👤 Perfil: ${order.account?.profile || "No especificado"}\n` +
                          `📌 PIN: ${order.account?.pin || "No especificado"}\n`) +
                      `🌐 URL: Sin URL\n` +
                      `📅 Fecha de creación: ${formatDate(order.startDate)}\n` +
                      `📅 Fecha de vencimiento: ${formatDate(order.endDate)}\n` +
                      `🏁 Días contratados: ${order.durationDays || 30} días.\n\n` +
                      (isOnDemand
                        ? `*Nota:* Este pedido está "A pedido". El proveedor se contactará contigo para coordinar los detalles.\n\n`
                        : "") +
                      `*Términos y Condiciones:*\n${order.termsAndConditions || "No se especificaron términos y condiciones."}\n\n` +
                      `Muchas gracias por su preferencia.\n` +
                      `Atentamente, BLACKSTREAMING`
                  );

                  const normalizedProviderPhone = order.providerPhone
                    ? order.providerPhone.replace(/^\+51/, "").replace(/\D/g, "")
                    : "51999999999";

                  return (
                    <div
                      key={index}
                      className="border border-gray-600/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-3 border-b border-gray-600/50 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {statusIcon}
                          <div>
                            <h4 className="font-semibold text-white">
                              {order.productName || "Producto sin nombre"}
                            </h4>
                            {order.orderId && (
                              <p className="text-xs text-gray-400">N° Pedido: {order.orderId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">S/ {price.toFixed(2)}</p>
                          <p
                            className={`text-xs font-medium ${isOnDemand ? "text-yellow-400" : countdownColor}`}
                          >
                            {isOnDemand
                              ? "Pendiente de activación"
                              : `${daysRemaining} día${daysRemaining === 1 ? "" : "s"} restante${
                                  daysRemaining === 1 ? "" : "s"
                                }`}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                          <div className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiUser className="mr-2" /> Detalles de la Cuenta
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              {isOnDemand ? (
                                <>
                                  <p>
                                    <span className="font-medium text-gray-400">Usuario:</span>
                                    <span className="block text-white">Por completar</span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Contraseña:</span>
                                    <span className="block text-white">Por completar</span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Perfil:</span>
                                    <span className="block text-white">Por completar</span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">PIN:</span>
                                    <span className="block text-white">Por completar</span>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p>
                                    <span className="font-medium text-gray-400">Email:</span>
                                    <span className="block text-white break-all">
                                      {order.account?.email || "No especificado"}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Contraseña:</span>
                                    <span className="block text-white break-all">
                                      {order.account?.password || "No especificado"}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">Perfil:</span>
                                    <span className="block text-white">
                                      {order.account?.profile || "No especificado"}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-400">PIN:</span>
                                    <span className="block text-white">
                                      {order.account?.pin || "No especificado"}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiFileText className="mr-2" /> Información del Pedido
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              <p>
                                <span className="font-medium text-gray-400">Proveedor:</span>
                                <span className="block text-white">{order.provider || "No especificado"}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Teléfono del Proveedor:</span>
                                <span className="block text-white">
                                  {order.providerPhone || "No especificado"}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Estado:</span>
                                <span
                                  className={`block px-2 py-1 text-xs rounded-full ${
                                    isOnDemand
                                      ? "bg-yellow-900/80 text-yellow-400"
                                      : isActive
                                      ? "bg-green-900/80 text-green-400"
                                      : "bg-red-900/80 text-red-400"
                                  }`}
                                >
                                  {isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}
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
                              <p>
                                <span className="font-medium text-gray-400">Días restantes:</span>
                                <span className={`block ${countdownColor}`}>{daysRemaining}</span>
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50">
                            <h5 className="text-sm font-medium text-cyan-400 mb-3 flex items-center">
                              <FiUser className="mr-2" /> Información del Cliente
                            </h5>
                            <div className="space-y-2 text-gray-300">
                              <p>
                                <span className="font-medium text-gray-400">Nombre:</span>
                                <span className="block text-white">{order.client?.name || "No especificado"}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Teléfono:</span>
                                <span className="block text-white">{order.client?.phone || "No especificado"}</span>
                              </p>
                              <p>
                                <span className="font-medium text-gray-400">Email:</span>
                                <span className="block text-white">{order.client?.email || "No especificado"}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <a
                            href={`https://wa.me/51${normalizedProviderPhone}?text=${whatsappProviderMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                          >
                            <FiMessageCircle size={18} /> Contactar Proveedor
                          </a>

                          {order.renewable && (
                            <button
                              onClick={() => handleRenewal(order)}
                              disabled={loading}
                              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                                loading
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
                              }`}
                            >
                              <FiRefreshCw size={18} /> Renovar Pedido
                            </button>
                          )}

                          {order.client?.phone && (
                            <a
                              href={`https://wa.me/${order.client.phone.replace(/^\+/, "")}?text=${whatsappClientMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
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

      case "referidos":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Todos tus referidos ({referredUsers.length})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar referidos..."
                  className="px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {referredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600/50">
                  <thead className="bg-gray-700/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha de registro
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                    {referredUsers
                      .filter((user) => {
                        const username = user.username || "";
                        const email = user.email || "";
                        return (
                          username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          email.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                      })
                      .map((user, index) => (
                        <tr key={index} className="hover:bg-gray-700/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">
                            {user.username || "Sin nombre"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                            {user.email || "Sin email"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                            {user.joinDate ? formatDate(user.joinDate) : "No especificada"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/80 text-green-400">
                              {user.status || "Activo"}
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

      case "ganancias":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Reporte de ganancias</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-600/50 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias hoy</h4>
                <p className="text-3xl font-bold text-white">S/ 0.00</p>
                <p className="text-sm text-gray-400 mt-2">+0% desde ayer</p>
              </div>

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-600/50 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias esta semana</h4>
                <p className="text-3xl font-bold text-white">S/ 0.00</p>
                <p className="text-sm text-gray-400 mt-2">+0% desde la semana pasada</p>
              </div>

              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-600/50 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias totales</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-2">{referredUsers.length} referidos</p>
              </div>
            </div>

            <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiTrendingUp className="mr-2 text-cyan-400" /> Historial de comisiones
              </h4>

              {referredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600/50">
                    <thead className="bg-gray-800/50 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Referido
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Origen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700/50 divide-y divide-gray-600/50">
                      {referredUsers.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-600/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">
                            {user.username || "Usuario sin nombre"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                            {user.joinDate ? formatDate(user.joinDate) : "No especificada"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-white">S/ 0.00</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">Registro</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/80 text-yellow-400">
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

      case "configuracion":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-2xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Configuración de cuenta</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Cambiar contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={!newPassword}
                className={`w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium mt-4 transition-all duration-300 ${
                  !newPassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Guardar cambios
              </button>
            </div>

            <div className="mt-8 border-t border-gray-600/50 pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-900/80 hover:bg-red-800 text-white rounded-xl font-medium transition-all duration-300"
              >
                <FiLogOut /> Cerrar sesión
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl text-center max-w-2xl mx-auto border border-gray-700/50">
            <FiAlertCircle className="mx-auto text-4xl text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sección no encontrada</h3>
            <p className="text-gray-300 mb-4">La sección que estás buscando no existe o no está disponible.</p>
            <button
              onClick={() => setActiveSection("inicio")}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
            >
              Volver al inicio
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 overflow-y-auto`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-cyan-400">BlackStreaming</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="md:hidden p-1 rounded-full hover:bg-gray-700/50 transition-all duration-300"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button
              onClick={() => {
                setActiveSection("inicio");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "inicio" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiHome /> <span>Inicio</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("recargas");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "recargas" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiDollarSign /> <span>Recargas</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("pedidos");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "pedidos" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiShoppingCart /> <span>Mis pedidos</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("referidos");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "referidos" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiUsers /> <span>Referidos</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("ganancias");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "ganancias" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiTrendingUp /> <span>Ganancias</span>
            </button>

            <button
              onClick={() => {
                setActiveSection("configuracion");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "configuracion" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiSettings /> <span>Configuración</span>
            </button>
          </nav>

          <div className="mt-auto pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 transition-all duration-300"
            >
              <FiLogOut /> <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 p-4 sm:p-6 pt-20 md:pt-6">{renderContent()}</main>

      {/* Modal for Alerts */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-800/50">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{modal.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-all duration-300"
                >
                  <FiX size={20} />
                </button>
              </div>
              <p className="text-gray-300 mb-6">{modal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardAffiliate;
