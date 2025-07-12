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
  FiFileText,
  FiX,
  FiBell,
  FiEdit,
  FiSearch,
  FiPhone,
  FiStar,
} from "react-icons/fi";
import { db, auth } from "../firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Notification Modal
const NotificationModal = ({ isOpen, message, title, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-800/50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Modal
const EditProfileModal = ({ isOpen, user, onClose, onSave }) => {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!newUsername.trim()) {
      setError("El nombre de usuario no puede estar vacío.");
      return;
    }
    onSave(user.id, newUsername.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-800/50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Nombre de usuario</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                required
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Rate Provider Modal
const RateProviderModal = ({ isOpen, provider, onClose, onRate }) => {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (rating < 1 || rating > 5) {
      setError("Por favor, selecciona una calificación entre 1 y 5 estrellas.");
      return;
    }
    onRate(provider.id, rating);
    setRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-800/50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Calificar Proveedor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Proveedor: {provider.name}</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={24}
                    className={`cursor-pointer ${
                      star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
              >
                Enviar Calificación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DashboardUser = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [topUps, setTopUps] = useState([]);
  const [userName, setUserName] = useState({ username: "", phone: "" });
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [activePage, setActivePage] = useState("inicio");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: "", title: "" });
  const [editProfileModal, setEditProfileModal] = useState({ isOpen: false, user: null });
  const [rateProviderModal, setRateProviderModal] = useState({ isOpen: false, provider: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  // Show modal
  const showModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  // Close modal
  const closeModal = () => {
    setModal({ isOpen: false, message: "", title: "" });
  };

  // Open edit profile modal
  const openEditProfileModal = (user) => {
    setEditProfileModal({ isOpen: true, user });
  };

  // Close edit profile modal
  const closeEditProfileModal = () => {
    setEditProfileModal({ isOpen: false, user: null });
  };

  // Open rate provider modal
  const openRateProviderModal = (provider) => {
    setRateProviderModal({ isOpen: true, provider });
  };

  // Close rate provider modal
  const closeRateProviderModal = () => {
    setRateProviderModal({ isOpen: false, provider: null });
  };

  // Update user profile
  const updateUserProfile = async (userId, newUsername) => {
    try {
      setActionLoading((prev) => ({ ...prev, profile: true }));
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        username: newUsername,
        updatedAt: serverTimestamp(),
      });
      setUserName((prev) => ({ ...prev, username: newUsername }));
      showModal("Éxito", "Perfil actualizado exitosamente");
      closeEditProfileModal();
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      showModal("Error", error.message || "Error al actualizar el perfil");
    } finally {
      setActionLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Rate provider
  const rateProvider = async (providerId, rating) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`rate_${providerId}`]: true }));
      await addDoc(collection(db, "ratings"), {
        userId,
        providerId,
        rating,
        ratedAt: serverTimestamp(),
      });
      showModal("Éxito", "Calificación enviada exitosamente");
      closeRateProviderModal();
    } catch (error) {
      console.error("Error al calificar proveedor:", error);
      showModal("Error", error.message || "Error al enviar la calificación");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`rate_${providerId}`]: false }));
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const productsQuery = query(collection(db, "products"));
        const querySnapshot = await getDocs(productsQuery);
        console.log("Products fetched:", querySnapshot.docs.length);
        const productsData = {};
        querySnapshot.forEach((doc) => {
          productsData[doc.id] = doc.data();
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al cargar productos: " + error.message);
      }
    };
    fetchProducts();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "notifications", "adminMessage"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const userRole = "user";
          if (data.roles && data.roles.includes(userRole)) {
            setNotifications([{ id: docSnapshot.id, ...data }]);
          } else {
            setNotifications([]);
          }
        } else {
          setNotifications([]);
        }
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        setError("Error al cargar notificaciones: " + error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch providers
  useEffect(() => {
    if (!userId) return;

    const fetchProviders = async () => {
      try {
        const salesQuery = query(collection(db, "sales"), where("customerId", "==", userId));
        const salesSnapshot = await getDocs(salesQuery);
        const providerIds = new Set();
        const providersList = [];

        salesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.providerId && !providerIds.has(data.providerId)) {
            providerIds.add(data.providerId);
            providersList.push({
              id: data.providerId,
              name: data.provider || "Proveedor desconocido",
              phone: data.providerPhone || "No especificado",
            });
          }
        });

        setProviders(providersList);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError("Error al cargar proveedores: " + error.message);
      }
    };

    fetchProviders();
  }, [userId]);

  // Handle renewal
  const handleRenewal = async (order) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`renew_${order.id}`]: true }));
      const renewalPrice = parseFloat(order.renewalPrice) || parseFloat(order.price) || 0;
      if (balance < renewalPrice) {
        showModal("Error", "Saldo insuficiente para renovar el pedido. Por favor, recarga tu saldo.");
        return;
      }

      const durationDays = parseInt(order.durationDays) || 30;
      const nowTimestamp = Timestamp.now();
      const nowDate = nowTimestamp.toDate();
      const startDate = nowDate;
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const endDateTimestamp = Timestamp.fromDate(endDate);

      const orderRef = doc(db, "sales", order.id);
      await updateDoc(orderRef, {
        startDate: nowTimestamp,
        endDate: endDateTimestamp,
        renewedAt: nowTimestamp,
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: balance - renewalPrice,
      });

      setBalance((prev) => prev - renewalPrice);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                startDate: startDate,
                endDate: endDate,
                renewedAt: nowDate,
                status: "completed",
                daysRemaining: durationDays,
                totalDays: durationDays,
                timeElapsedPercentage: 0,
              }
            : o
        )
      );

      showModal("Éxito", `¡Pedido renovado exitosamente! Nueva fecha de vencimiento: ${formatDate(endDate)}`);
    } catch (error) {
      console.error("Error al renovar el pedido:", error);
      showModal("Error", "Error al renovar el pedido: " + error.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`renew_${order.id}`]: false }));
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showModal("Error", error.message || "Error al cerrar sesión");
    }
  };

  // Authentication check
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

  // Fetch user data
  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName({
            username: userData.username || "Usuario",
            phone: userData.phone || "",
          });
          setEmail(userData.email || "No especificado");
          setBalance(Number(userData.balance) || 0);
        } else {
          setError("Usuario no encontrado");
        }
      },
      (error) => {
        console.error("Error in user data listener:", error);
        setError("Error al cargar datos del usuario: " + error.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Fetch orders and handle deletion of expired orders
  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "sales"), where("customerId", "==", userId));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const now = new Date();
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

        for (const saleDoc of snapshot.docs) {
          const data = saleDoc.data();
          const endDate = data.endDate?.toDate?.() || new Date();
          if (endDate < now && now.getTime() - endDate.getTime() > fiveDaysInMs) {
            try {
              await deleteDoc(doc(db, "sales", saleDoc.id));
              console.log(`Deleted expired order: ${saleDoc.id}`);
            } catch (error) {
              console.error(`Error deleting order ${saleDoc.id}:`, error);
            }
          }
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
            endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
          } else {
            endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
            shouldUpdateFirestore = true;
          }

          if (shouldUpdateFirestore) {
            updateDoc(doc(db, "sales", saleDoc.id), {
              startDate: startDateRaw || Timestamp.fromDate(saleDate),
              endDate: Timestamp.fromDate(endDate),
              durationDays: durationDays,
            }).catch((error) => {
              console.error("Error al actualizar startDate/endDate en Firestore:", error);
            });
          }

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
            renewalPrice: parseFloat(data.renewalPrice) || 0,
            provider: data.provider || "No especificado",
            providerId: data.providerId || "",
            providerPhone: data.providerPhone || data.providerWhatsapp || "51999999999",
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
              customerName: data.customerName || "Cliente desconocido",
              email: data.customerEmail || "No especificado",
              phone: data.phoneNumber || "No especificado",
            },
            paymentMethod: "BlackStreaming",
            orderId: `BS-${saleDoc.id.slice(0, 8).toUpperCase()}`,
            termsAndConditions: productTerms,
            renewable: data.renewable !== undefined ? data.renewable : true,
          };
        }).filter(order => {
          const endDate = new Date(order.endDate);
          return !(endDate < now && now.getTime() - endDate.getTime() > fiveDaysInMs);
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
      const now = new Date();
      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          const totalDurationMs = new Date(order.endDate).getTime() - new Date(order.startDate).getTime();
          const elapsedMs = now.getTime() - new Date(order.startDate).getTime();
          const remainingMs = new Date(order.endDate).getTime() - now.getTime();

          const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
          const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
          const timeElapsedPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 100;

          return { ...order, daysRemaining, totalDays, timeElapsedPercentage };
        }).filter(order => {
          const endDate = new Date(order.endDate);
          return !(endDate < now && now.getTime() - endDate.getTime() > fiveDaysInMs);
        })
      );
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId, products]);

  // Fetch top-ups
  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "pendingTopUps"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const topUpsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().requestedAt?.toDate?.() || new Date(),
          amount: parseFloat(doc.data().amount) || 0,
        }));
        setTopUps(topUpsList);
      },
      (error) => {
        console.error("Error al obtener recargas:", error);
        setError("Error al cargar recargas: " + error.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Handle top-up request
  const handleTopUpRequest = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, topUp: true }));
      if (!amount || isNaN(amount)) {
        showModal("Error", "Ingrese un monto válido");
        return;
      }

      const amountNumber = parseFloat(amount);
      if (amountNumber < 10) {
        showModal("Error", "El monto mínimo de recarga es S/ 10.00");
        return;
      }

      await addDoc(collection(db, "pendingTopUps"), {
        userId,
        username: userName.username,
        amount: amountNumber,
        status: "pendiente",
        requestedAt: serverTimestamp(),
      });

      setAmount("");
      showModal("Éxito", "Solicitud de recarga enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar recarga:", error);
      showModal("Error", error.message || "Error al enviar solicitud de recarga");
    } finally {
      setActionLoading((prev) => ({ ...prev, topUp: false }));
    }
  };

  // Update password and phone
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      setActionLoading((prev) => ({ ...prev, password: true }));
      const newPassword = e.target.password.value;
      const newPhone = e.target.phone.value;

      const user = auth.currentUser;
      const userRef = doc(db, "users", userId);

      const updates = {};
      if (newPassword) {
        if (newPassword.length < 6) {
          showModal("Error", "La contraseña debe tener al menos 6 caracteres");
          return;
        }
        await updatePassword(user, newPassword);
        updates.updatedAt = serverTimestamp();
      }
      if (newPhone) {
        updates.phone = newPhone;
        updates.updatedAt = serverTimestamp();
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }

      setUserName((prev) => ({ ...prev, phone: newPhone || prev.phone }));
      showModal("Éxito", "Cambios guardados correctamente");
      e.target.reset();
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      showModal("Error", error.message || "Error al guardar los cambios");
    } finally {
      setActionLoading((prev) => ({ ...prev, password: false }));
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "No especificada";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "Fecha inválida";
      return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Render content
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

    switch (activePage) {
      case "inicio":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Bienvenido, <span className="text-cyan-400">{userName.username}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Información de cuenta</h3>
                <div className="space-y-2 text-gray-300">
                  <p className="flex items-center">
                    <FiUser className="mr-2 text-cyan-400" />
                    <span>{userName.username}</span>
                  </p>
                  <p className="flex items-center">
                    <FiMessageCircle className="mr-2 text-cyan-400" />
                    <span>{email}</span>
                  </p>
                  <p className="flex items-center">
                    <FiPhone className="mr-2 text-cyan-400" />
                    <span>{userName.phone || "No especificado"}</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Saldo disponible</h3>
                <p className="text-3xl font-bold text-white">S/ {balance.toFixed(2)}</p>
                <button
                  onClick={() => setActivePage("recargar")}
                  className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
                >
                  Recargar
                </button>
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Pedidos activos</h3>
                <p className="text-3xl font-bold text-white">{orders.filter((o) => new Date(o.endDate) > new Date() && o.status === "completed").length}</p>
                <button
                  onClick={() => setActivePage("pedidos")}
                  className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300"
                >
                  Ver pedidos
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-3">Pedidos recientes</h3>
                {orders.length > 0 ? (
                  orders.slice(0, 3).map((order) => {
                    const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                    const isOnDemand = order.status === "pending";
                    return (
                      <div
                        key={order.id}
                        className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{order.productName}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "pending"
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
                  })
                ) : (
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
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-3">Notificaciones</h3>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                    >
                      <p className="text-gray-300">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(notification.updatedAt?.toDate?.() || new Date())}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay notificaciones</p>
                )}
              </div>
            </div>
          </div>
        );

      case "notificaciones":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Notificaciones</h3>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border border-gray-600/50 rounded-2xl p-4 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(notification.updatedAt?.toDate?.() || new Date())}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBell className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No hay notificaciones</h4>
                <p className="text-gray-400">No tienes mensajes nuevos</p>
              </div>
            )}
          </div>
        );

      case "recargar":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Recargar saldo</h3>
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Monto a recargar (S/)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 placeholder-gray-500"
                    placeholder="Mínimo S/ 10.00"
                    min="10"
                    step="0.01"
                  />
                </div>
                <button
                  onClick={handleTopUpRequest}
                  disabled={actionLoading.topUp || !amount || parseFloat(amount) < 10}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    amount && parseFloat(amount) >= 10 && !actionLoading.topUp
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {actionLoading.topUp ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-auto"></div>
                  ) : (
                    "Solicitar recarga"
                  )}
                </button>
              </div>
              <div className="mt-6 bg-gray-700/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-600/50 max-w-md mx-auto">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <FiDollarSign className="mr-2" /> ¿Cómo realizar tu recarga?
                </h4>
                <p className="text-gray-300 mb-2">
                  Realiza tu pago mediante <span className="font-semibold text-white">Yape</span> al número:
                </p>
                <p className="text-xl font-bold text-white mb-2">📱 931757531</p>
                <p className="text-gray-300 mb-3">
                  Una vez realizado el pago, por favor contáctanos vía WhatsApp al mismo número para confirmar tu recarga.
                </p>
                <a
                  href={`https://wa.me/51931757531?text=${encodeURIComponent(
                    "Hola 😊, he realizado una recarga a través de Yape. Por favor, confirma mi pago."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300"
                >
                  <FiMessageCircle className="mr-2" /> Confirmar por WhatsApp
                </a>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Historial de recargas</h3>
              {topUps.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600/50">
                    <thead className="bg-gray-700/50">
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
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                      {topUps.map((topUp) => (
                        <tr key={topUp.id} className="hover:bg-gray-600/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">
                            S/ {topUp.amount.toFixed(2)}
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
                          <td className="px-4 py-4 whitespace-nowrap text-gray-400">
                            {formatDate(topUp.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 py-8">No hay recargas registradas</p>
              )}
            </div>
          </div>
        );

      case "proveedores":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Proveedores</h3>
            {providers.length > 0 ? (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="border border-gray-600/50 rounded-2xl p-4 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-medium">{provider.name}</p>
                        <p className="text-xs text-gray-400">Teléfono: {provider.phone}</p>
                      </div>
                      <button
                        onClick={() => openRateProviderModal(provider)}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300 flex items-center gap-2"
                      >
                        <FiStar size={16} />
                        Calificar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUser className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No hay proveedores</h4>
                <p className="text-gray-400">No has realizado compras con proveedores aún.</p>
              </div>
            )}
          </div>
        );

      case "pedidos":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white">Mis pedidos</h3>
              <div className="relative w-48 sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-sm placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute right-2 top-2 text-gray-400" size={16} />
              </div>
            </div>
            {orders.length > 0 ? (
              orders
                .filter(
                  (order) =>
                    (order.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (order.orderId || "").toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((order) => {
                  const price = parseFloat(order.price) || 0;
                  const renewalPrice = parseFloat(order.renewalPrice) || 0;
                  const isActive = new Date(order.endDate) > new Date() && order.status === "completed";
                  const isOnDemand = order.status === "pending";
                  const daysRemaining = order.daysRemaining || 0;
                  const timeElapsedPercentage = order.timeElapsedPercentage || 0;

                  let countdownColor = "bg-green-400";
                  if (timeElapsedPercentage > 70 && timeElapsedPercentage <= 90) {
                    countdownColor = "bg-yellow-400";
                  } else if (timeElapsedPercentage > 90) {
                    countdownColor = "bg-red-400";
                  }

                  const statusIcon = isOnDemand ? (
                    <FiClock className="text-yellow-400" size={16} />
                  ) : isActive ? (
                    <FiCheckCircle className="text-green-400" size={16} />
                  ) : (
                    <FiAlertCircle className="text-red-400" size={16} />
                  );

                  const whatsappProviderMessage = encodeURIComponent(
                    `*Consulta sobre Pedido - ${order.productName || "Sin nombre"}*\n\n` +
                      `*N° Pedido:* ${order.orderId || "No especificado"}\n` +
                      `*Producto:* ${order.productName || "No especificado"}\n` +
                      `*Precio:* S/ ${price.toFixed(2)}\n` +
                      (order.renewalPrice ? `*Precio de Renovación:* S/ ${renewalPrice.toFixed(2)}\n` : "") +
                      `*Estado:* ${isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}\n` +
                      `*Fecha de Inicio:* ${formatDate(order.startDate)}\n` +
                      `*Fecha de Vencimiento:* ${formatDate(order.endDate)}\n` +
                      (isOnDemand
                        ? `Hola 😊, he comprado un producto a pedido (${order.productName}). ¿En cuántos días estará listo? Por favor, indíqueme los detalles para coordinar.`
                        : `Por favor indíqueme cómo puedo resolver mi consulta sobre este pedido.`)
                  );

                  const whatsappClientMessage = encodeURIComponent(
                    `😊 Estimado/a ${order.client?.customerName || "Cliente"} 😊\n\n` +
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
                      key={order.id}
                      className="border border-gray-600/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 mb-4"
                    >
                      <div className="bg-gray-700/50 backdrop-blur-sm px-3 py-2 border-b border-gray-600/20 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {statusIcon}
                          <div>
                            <h4 className="font-semibold text-white text-sm">
                              {order.productName || "Producto sin nombre"}
                            </h4>
                            {order.orderId && (
                              <p className="text-xs text-gray-400">N°: {order.orderId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">S/ {price.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">
                            {order.renewalPrice && `Ren: S/ ${renewalPrice.toFixed(1)}`}
                          </p>
                          <p
                            className={`text-xs ${
                              isOnDemand ? "text-yellow-400" : countdownColor.replace("bg-", "text-")
                            }`}
                          >
                            {isOnDemand
                              ? "Pendiente"
                              : `${daysRemaining} día${daysRemaining === 1 ? "" : "s"}`}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-700/50 backdrop-blur-sm">
                        <div className="mb-2">
                          <div className="w-full bg-gray-600/40 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${countdownColor}`}
                              style={{ width: `${Math.min(timeElapsedPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 text-right">
                            {timeElapsedPercentage.toFixed(0)}%
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-2.5 rounded-xl">
                            <h5 className="text-xs font-medium text-gray-400 flex items-center mb-0.5">
                              <FiUser className="mr-0.5" size={12} /> Cuenta
                            </h5>
                            <div className="space-y-0.5 text-xs text-gray-300">
                              {isOnDemand ? (
                                <>
                                  <p>Usuario: <span className="text-gray-200">Por completar</span></p>
                                  <p>Clave: <span className="text-gray-200">Por completar</span></p>
                                  <p>Perfil: <span className="text-gray-200">Por completar</span></p>
                                  <p>PIN: <span className="text-gray-200">No</span></p>
                                </>
                              ) : (
                                <>
                                  <p>Email: <span className="text-gray-100 break-all">{order.account?.email || "-"}</span></p>
                                  <p>Clave: <span className="text-gray-100 break-all">{order.account?.password || "-"}</span></p>
                                  <p>Perfil: <span className="text-gray-100">{order.account?.profile || "-"}</span></p>
                                  <p>PIN: <span className="text-gray-100">{order.account?.pin || "-"}</span></p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-2.5 rounded-xl">
                            <h5 className="text-xs font-medium text-gray-400 flex items-center mb-0.5">
                              <FiFileText className="mr-0.5" size={12} /> Pedido
                            </h5>
                            <div className="space-y-0.5 text-xs text-gray-300">
                              <p>Proveedor: <span className="text-gray-100">{order.provider || "-"}</span></p>
                              <p>Teléfono: <span className="text-gray-100">{order.providerPhone || "-"}</span></p>
                              <p>
                                Estado: <span
                                  className={`inline-block px-1 py-0.5 text-[10px] rounded-full ${
                                    isOnDemand
                                      ? "bg-yellow-900/60 text-yellow-300"
                                      : isActive
                                      ? "bg-green-900/60 text-green-300"
                                      : "bg-red-900/60 text-red-300"
                                  }`}
                                >
                                  {isOnDemand ? "A pedido" : isActive ? "Activo" : "Expirado"}
                                </span>
                              </p>
                              <p>Inicio: <span className="text-gray-100">{formatDate(order.startDate)}</span></p>
                              <p>Vence: <span className="text-gray-100">{formatDate(order.endDate)}</span></p>
                              <p>Días: <span className={`text-gray-100 ${countdownColor.replace("bg-", "text-")}`}>{daysRemaining}</span></p>
                            </div>
                          </div>
                          <div className="border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-2.5 rounded-xl">
                            <h5 className="text-xs font-medium text-gray-400 flex items-center mb-0.5">
                              <FiUser className="mr-0.5" size={12} /> Cliente
                            </h5>
                            <div className="space-y-0.5 text-xs text-gray-300">
                              <p>Nombre: <span className="text-gray-100">{order.client?.customerName || "-"}</span></p>
                              <p>Email: <span className="text-gray-100 break-all">{order.client?.email || "-"}</span></p>
                              <p>Teléfono: <span className="text-gray-100">{order.client?.phone || "-"}</span></p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href={`https://wa.me/51${normalizedProviderPhone}?text=${whatsappProviderMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 text-xs transition-all duration-300"
                          >
                            <FiMessageCircle size={12} /> Proveedor
                          </a>
                          {order.renewalPrice && order.renewable && (
                            <button
                              onClick={() => handleRenewal(order)}
                              disabled={actionLoading[`renew_${order.id}`]}
                              className={`flex-1 py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 text-xs transition-all duration-300 ${
                                actionLoading[`renew_${order.id}`]
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
                              }`}
                            >
                              {actionLoading[`renew_${order.id}`] ? (
                                <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                              ) : (
                                <>
                                  <FiRefreshCw size={12} /> Renovar (S/ {renewalPrice.toFixed(1)})
                                </>
                              )}
                            </button>
                          )}
                          {order.client?.phone && (
                            <a
                              href={`https://wa.me/${order.client.phone.replace(/^\+/, "")}?text=${whatsappClientMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 text-xs transition-all duration-300"
                            >
                              <FiMessageCircle size={12} /> Cliente
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <FiShoppingCart className="mx-auto text-3xl text-gray-400 mb-2" />
                <h4 className="text-base font-medium text-gray-300">No tienes pedidos</h4>
                <p className="text-gray-400 text-sm">Realiza tu primer pedido en nuestra tienda</p>
              </div>
            )}
          </div>
        );

      case "configuracion":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-2xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Configuración de cuenta</h3>
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-4"
              onChange={() => setError("")}
            >
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={userName.username}
                    disabled
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => openEditProfileModal({ id: userId, username: userName.username })}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300"
                    title="Editar Nombre"
                  >
                    <FiEdit size={16} />
                  </button>
                </div>
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
                <label className="block text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={userName.phone || ""}
                  placeholder="Ingresa tu número de teléfono"
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading.password}
                className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium mt-4 transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading.password ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-auto"></div>
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </form>
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
              onClick={() => setActivePage("inicio")}
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
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 overflow-y-auto`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
              className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-all duration-300"
            >
              BlackStreaming
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="md:hidden p-1 rounded-full hover:bg-gray-700/50 transition-all duration-300"
            >
              <FiX className="text-lg" />
            </button>
          </div>
          <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
              {userName.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{userName.username}</p>
              <p className="text-xs text-gray-400">Usuario</p>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { id: "inicio", label: "Inicio", icon: FiHome },
              { id: "notificaciones", label: "Notificaciones", icon: FiBell },
              { id: "recargar", label: "Recargar saldo", icon: FiDollarSign },
              { id: "pedidos", label: "Mis pedidos", icon: FiShoppingCart },
              { id: "proveedores", label: "Proveedores", icon: FiUser },
              { id: "configuracion", label: "Configuración", icon: FiSettings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activePage === item.id
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-cyan-400"
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-300 border border-red-900/50"
            >
              <FiLogOut className="text-lg" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="md:ml-64 p-4 sm:p-6 min-h-screen">{renderContent()}</main>
      <NotificationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
      <EditProfileModal
        isOpen={editProfileModal.isOpen}
        user={editProfileModal.user}
        onClose={closeEditProfileModal}
        onSave={updateUserProfile}
      />
      <RateProviderModal
        isOpen={rateProviderModal.isOpen}
        provider={rateProviderModal.provider}
        onClose={closeRateProviderModal}
        onRate={rateProvider}
      />
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardUser;