import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiLogOut,
  FiDollarSign,
  FiUsers,
  FiMenu,
  FiTrendingUp,
  FiHome,
  FiMessageCircle,
  FiUser,
  FiAlertCircle,
  FiArrowRight,
  FiX,
  FiCheck,
  FiShoppingCart,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Modal Component for Notifications
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

const DashboardAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingTopUps, setPendingTopUps] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [topUpsHistory, setTopUpsHistory] = useState([]);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [earnings, setEarnings] = useState({ day: 0, week: 0, month: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState({ isOpen: false, message: "", title: "" });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const navigate = useNavigate();

  // Function to show modal
  const showModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  // Function to close modal
  const closeModal = () => {
    setModal({ isOpen: false, message: "", title: "" });
  };

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !isCreatingUser) {
        navigate("/login");
      } else if (user) {
        setEmail(user.email);
        fetchUsername(user.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, isCreatingUser]);

  // Obtener nombre del administrador
  const fetchUsername = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.username || userData.email.split("@")[0]);
      } else {
        setError("Usuario no encontrado en la base de datos");
      }
    } catch (error) {
      console.error("Error al obtener el nombre de usuario:", error);
      setError("Error al cargar datos del usuario");
    }
  };

  // Calcular ganancias
  const calculateEarnings = (usersCount) => {
    const earningsPerUser = 5;
    const totalEarnings = usersCount * earningsPerUser;
    const weeklyEarnings = totalEarnings * 0.25;
    const dailyEarnings = totalEarnings * 0.05;
    setEarnings({
      day: dailyEarnings,
      week: weeklyEarnings,
      month: totalEarnings,
      total: totalEarnings,
    });
  };

  // Obtener datos de Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTotalUsers(usersCount);
        setUsers(usersList.slice(-5));
        setAllUsers(usersList);
        calculateEarnings(usersCount);

        // Registros pendientes
        const pendingQuery = query(collection(db, "pendingRegistrations"), where("status", "==", "pending"));
        const pendingSnapshot = await getDocs(pendingQuery);
        setPendingRegistrations(pendingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Recargas pendientes
        const topUpsQuery = query(collection(db, "pendingTopUps"), where("status", "==", "pendiente"));
        const topUpsSnapshot = await getDocs(topUpsQuery);
        setPendingTopUps(topUpsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Retiros pendientes
        const withdrawalsQuery = query(collection(db, "withdrawals"), where("status", "==", "pending"));
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        setPendingWithdrawals(withdrawalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Historial de recargas
        const topUpsHistorySnapshot = await getDocs(collection(db, "topUpsHistory"));
        setTopUpsHistory(topUpsHistorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Historial de retiros
        const withdrawalsHistorySnapshot = await getDocs(collection(db, "withdrawalsHistory"));
        setWithdrawalsHistory(withdrawalsHistorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Ventas
        const salesSnapshot = await getDocs(collection(db, "sales"));
        const salesList = salesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSales(salesList);
        const total = salesList.reduce((sum, sale) => sum + (sale.price || 0), 0);
        setTotalSales(total);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("Error al cargar datos");
      }
    };
    fetchData();

    // Escuchar cambios en tiempo real
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersCount = snapshot.size;
      const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTotalUsers(usersCount);
      setUsers(usersList.slice(-5));
      setAllUsers(usersList);
      calculateEarnings(usersCount);
    });

    const unsubscribePending = onSnapshot(
      query(collection(db, "pendingRegistrations"), where("status", "==", "pending")),
      (snapshot) => {
        setPendingRegistrations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeTopUps = onSnapshot(
      query(collection(db, "pendingTopUps"), where("status", "==", "pendiente")),
      (snapshot) => {
        setPendingTopUps(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeWithdrawals = onSnapshot(
      query(collection(db, "withdrawals"), where("status", "==", "pending")),
      (snapshot) => {
        setPendingWithdrawals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeTopUpsHistory = onSnapshot(collection(db, "topUpsHistory"), (snapshot) => {
      setTopUpsHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeWithdrawalsHistory = onSnapshot(collection(db, "withdrawalsHistory"), (snapshot) => {
      setWithdrawalsHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      const salesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSales(salesList);
      const total = salesList.reduce((sum, sale) => sum + (sale.price || 0), 0);
      setTotalSales(total);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePending();
      unsubscribeTopUps();
      unsubscribeWithdrawals();
      unsubscribeTopUpsHistory();
      unsubscribeWithdrawalsHistory();
      unsubscribeSales();
    };
  }, []);

  // Aprobar retiro
  const approveWithdrawal = async (withdrawalId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: true }));
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      const withdrawal = pendingWithdrawals.find((w) => w.id === withdrawalId);
      if (!withdrawal?.providerId) {
        throw new Error("Proveedor no encontrado para el retiro");
      }
      await updateDoc(withdrawalRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      const providerRef = doc(db, "users", withdrawal.providerId);
      await updateDoc(providerRef, {
        balance: increment(-withdrawal.amount || 0),
      });
      await setDoc(doc(db, "withdrawalsHistory", withdrawalId), {
        ...withdrawal,
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      showModal("Éxito", "Retiro aprobado exitosamente");
    } catch (error) {
      console.error("Error al aprobar retiro:", error);
      setError(error.message || "Error al aprobar el retiro");
      showModal("Error", error.message || "Error al aprobar el retiro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: false }));
    }
  };

  // Rechazar retiro
  const denyWithdrawal = async (withdrawalId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: true }));
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      await updateDoc(withdrawalRef, {
        status: "denied",
        updatedAt: serverTimestamp(),
      });
      const withdrawal = pendingWithdrawals.find((w) => w.id === withdrawalId);
      await setDoc(doc(db, "withdrawalsHistory", withdrawalId), {
        ...withdrawal,
        status: "denied",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      showModal("Éxito", "Retiro rechazado exitosamente");
    } catch (error) {
      console.error("Error al rechazar retiro:", error);
      setError(error.message || "Error al rechazar el retiro");
      showModal("Error", error.message || "Error al rechazar el retiro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: false }));
    }
  };

  // Aprobar recarga
  const approveTopUp = async (topUpId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [topUpId]: true }));
      const topUpRef = doc(db, "pendingTopUps", topUpId);
      const topUp = pendingTopUps.find((t) => t.id === topUpId);
      if (!topUp?.userId) {
        throw new Error("Usuario no encontrado para la recarga");
      }
      await updateDoc(topUpRef, {
        status: "aprobado",
        updatedAt: serverTimestamp(),
      });
      const userRef = doc(db, "users", topUp.userId);
      await updateDoc(userRef, {
        balance: increment(topUp.amount || 0),
      });
      await setDoc(doc(db, "topUpsHistory", topUpId), {
        ...topUp,
        status: "aprobado",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      showModal("Éxito", "Recarga aprobada exitosamente");
    } catch (error) {
      console.error("Error al aprobar recarga:", error);
      setError(error.message || "Error al aprobar la recarga");
      showModal("Error", error.message || "Error al aprobar la recarga");
    } finally {
      setActionLoading((prev) => ({ ...prev, [topUpId]: false }));
    }
  };

  // Rechazar recarga
  const denyTopUp = async (topUpId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [topUpId]: true }));
      const topUpRef = doc(db, "pendingTopUps", topUpId);
      await updateDoc(topUpRef, {
        status: "rechazado",
        updatedAt: serverTimestamp(),
      });
      const topUp = pendingTopUps.find((t) => t.id === topUpId);
      await setDoc(doc(db, "topUpsHistory", topUpId), {
        ...topUp,
        status: "rechazado",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      showModal("Éxito", "Recarga rechazada exitosamente");
    } catch (error) {
      console.error("Error al rechazar recarga:", error);
      setError(error.message || "Error al rechazar la recarga");
      showModal("Error", error.message || "Error al rechazar la recarga");
    } finally {
      setActionLoading((prev) => ({ ...prev, [topUpId]: false }));
    }
  };

  // Aceptar registro
  const handleAccept = async (registrationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
      setIsCreatingUser(true);
      const registrationRef = doc(db, "pendingRegistrations", registrationId);
      const registration = pendingRegistrations.find((r) => r.id === registrationId);
      if (!registration) {
        throw new Error("Solicitud no encontrada");
      }
      const signInMethods = await fetchSignInMethodsForEmail(auth, registration.email);
      if (signInMethods.length > 0) {
        throw new Error("El correo ya está registrado");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, registration.email, registration.password);
      const newUser = userCredential.user;
      await setDoc(doc(db, "users", newUser.uid), {
        username: registration.username,
        email: registration.email,
        role: registration.role || "usuario",
        balance: 0,
        createdAt: serverTimestamp(),
      });
      await updateDoc(registrationRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      await signOut(auth);
      setError(null);
      showModal("Éxito", "Solicitud de registro aprobada exitosamente");
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      setError(error.message || "Error al aceptar la solicitud de registro");
      showModal("Error", error.message || "Error al aceptar la solicitud de registro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
      setIsCreatingUser(false);
    }
  };

  // Rechazar registro
  const handleDeny = async (registrationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
      const registrationRef = doc(db, "pendingRegistrations", registrationId);
      await updateDoc(registrationRef, {
        status: "denied",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      showModal("Éxito", "Solicitud de registro rechazada exitosamente");
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      setError(error.message || "Error al rechazar la solicitud de registro");
      showModal("Error", error.message || "Error al rechazar la solicitud de registro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError(error.message || "Error al cerrar sesión");
      showModal("Error", error.message || "Error al cerrar sesión");
    }
  };

  // Guardar cambios de configuración
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setActionLoading((prev) => ({ ...prev, config: true }));
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: userName,
        updatedAt: serverTimestamp(),
      });
      const newPassword = e.target.password.value;
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        await updatePassword(user, newPassword);
      }
      setError(null);
      showModal("Éxito", "Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setError(error.message || "Error al guardar cambios");
      showModal("Error", error.message || "Error al guardar cambios");
    } finally {
      setActionLoading((prev) => ({ ...prev, config: false }));
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "No especificada";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
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

  // Formatear valor para mostrar en la tabla
  const formatValue = (value, key) => {
    if (value === null || value === undefined) return "N/A";
    if (key.toLowerCase().includes("at") && (value?.toDate || new Date(value).getTime())) {
      return formatDate(value);
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Determinar estado del pedido
  const getOrderStatus = (sale) => {
    if (sale.status === "pending") return "Pendiente";
    if (!sale.expirationDate) return "Activo";
    const now = new Date();
    const expiration = sale.expirationDate.toDate ? sale.expirationDate.toDate() : new Date(sale.expirationDate);
    return now > expiration ? "Expirado" : "Activo";
  };

  // Renderizar contenido
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
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ganancias del mes</h3>
                <p className="text-3xl font-bold text-white">S/ {earnings.month.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-1">(5 soles por cada usuario)</p>
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50 shadow-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Usuarios registrados</h3>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
                <p className="text-sm text-gray-300 mt-1">Total ganancias: S/ {earnings.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-3">Últimos usuarios</h3>
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{user.username || "Sin nombre"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-900/80 text-cyan-400">
                          {user.role || "usuario"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay usuarios registrados</p>
                )}
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-3">Solicitudes pendientes</h3>
                {pendingRegistrations.length > 0 ? (
                  pendingRegistrations.slice(0, 3).map((reg) => (
                    <div
                      key={reg.id}
                      className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{reg.username || "Sin nombre"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-900/80 text-purple-400">
                          {reg.role || "usuario"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{reg.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay solicitudes pendientes</p>
                )}
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
                <h3 className="text-lg font-semibold text-white mb-3">Retiros pendientes</h3>
                {pendingWithdrawals.length > 0 ? (
                  pendingWithdrawals.slice(0, 3).map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="border-b border-gray-600/50 py-3 last:border-0 hover:bg-gray-600/50 transition-all duration-300 rounded-xl px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{withdrawal.provider || "Sin proveedor"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900/80 text-yellow-400">
                          S/ {(withdrawal.amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Método: {withdrawal.method || "No especificado"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay retiros pendientes</p>
                )}
              </div>
            </div>
          </div>
        );

      case "usuarios":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Solicitudes de registro</h3>
              {pendingRegistrations.length > 0 ? (
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
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                      {pendingRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-700/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{reg.username || "Sin nombre"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{reg.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900/80 text-cyan-400">
                              {reg.role || "usuario"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAccept(reg.id)}
                                disabled={actionLoading[reg.id]}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 disabled:bg-green-800"
                                title="Aceptar"
                              >
                                {actionLoading[reg.id] ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                  <FiCheck size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeny(reg.id)}
                                disabled={actionLoading[reg.id]}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 disabled:bg-red-800"
                                title="Rechazar"
                              >
                                {actionLoading[reg.id] ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                  <FiX size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300">No hay solicitudes de registro pendientes</p>
                </div>
              )}
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Todos los usuarios ({totalUsers})</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
                </div>
              </div>
              {allUsers.length > 0 ? (
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
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Saldo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                      {allUsers
                        .filter(
                          (user) =>
                            (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700/50 transition-all duration-300">
                            <td className="px-4 py-4 whitespace-nowrap text-white">{user.username || "Sin nombre"}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900/80 text-cyan-400">
                                {user.role || "usuario"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-white">
                              S/ {(user.balance || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300">No hay usuarios registrados</p>
                </div>
              )}
            </div>
          </div>
        );

      case "recargas":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Recargas pendientes</h3>
              {pendingTopUps.length > 0 ? (
                <div className="space-y-4">
                  {pendingTopUps.map((topUp) => (
                    <div
                      key={topUp.id}
                      className="border border-gray-600/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-3 border-b border-gray-600/50 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-cyan-900/80 rounded-full flex items-center justify-center text-cyan-400">
                            <FiDollarSign size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{topUp.username || "Sin nombre"}</h4>
                            <p className="text-xs text-gray-400">Solicitado: {formatDate(topUp.requestedAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-white">S/ {(topUp.amount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-700/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => approveTopUp(topUp.id)}
                            disabled={actionLoading[topUp.id]}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-green-800 transition-all duration-300"
                          >
                            {actionLoading[topUp.id] ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            ) : (
                              <>
                                <FiCheck size={18} /> Aprobar Recarga
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => denyTopUp(topUp.id)}
                            disabled={actionLoading[topUp.id]}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-red-800 transition-all duration-300"
                          >
                            {actionLoading[topUp.id] ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            ) : (
                              <>
                                <FiX size={18} /> Rechazar Recarga
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-300">No hay recargas pendientes</h4>
                  <p className="text-gray-400">Todas las solicitudes han sido procesadas</p>
                </div>
              )}
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Historial de recargas</h3>
              {topUpsHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600/50">
                    <thead className="bg-gray-700/50 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Usuario
                        </th>
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
                      {topUpsHistory.map((topUp) => (
                        <tr key={topUp.id} className="hover:bg-gray-700/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{topUp.username || "Sin nombre"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-white">S/ {(topUp.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                topUp.status === "aprobado"
                                  ? "bg-green-900/80 text-green-400"
                                  : "bg-red-900/80 text-red-400"
                              }`}
                            >
                              {topUp.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(topUp.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300">No hay historial de recargas</p>
                </div>
              )}
            </div>
          </div>
        );

      case "retiros":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Solicitudes de retiro</h3>
              {pendingWithdrawals.length > 0 ? (
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="border border-gray-600/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="bg-gray-700/50 backdrop-blur-sm px-4 py-3 border-b border-gray-600/50 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-900/80 rounded-full flex items-center justify-center text-yellow-400">
                            <FiDollarSign size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{withdrawal.provider || "Sin proveedor"}</h4>
                            <p className="text-xs text-gray-400">Email: {withdrawal.providerEmail || "No disponible"}</p>
                            <p className="text-xs text-gray-400">Solicitado: {formatDate(withdrawal.createdAt)}</p>
                            <p className="text-xs text-gray-400">Método: {withdrawal.method || "No especificado"}</p>
                            <p className="text-xs text-gray-400">Cuenta: {withdrawal.account || "No especificada"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-white">S/ {(withdrawal.amount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-700/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => approveWithdrawal(withdrawal.id)}
                            disabled={actionLoading[withdrawal.id]}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-green-800 transition-all duration-300"
                          >
                            {actionLoading[withdrawal.id] ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            ) : (
                              <>
                                <FiCheck size={18} /> Aprobar Retiro
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => denyWithdrawal(withdrawal.id)}
                            disabled={actionLoading[withdrawal.id]}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-red-800 transition-all duration-300"
                          >
                            {actionLoading[withdrawal.id] ? (
                              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            ) : (
                              <>
                                <FiX size={18} /> Rechazar Retiro
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-300">No hay retiros pendientes</h4>
                  <p className="text-gray-400">Todas las solicitudes han sido procesadas</p>
                </div>
              )}
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Historial de retiros</h3>
              {withdrawalsHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600/50">
                    <thead className="bg-gray-700/50 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Proveedor
                        </th>
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
                          Método
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                      {withdrawalsHistory.map((withdrawal) => (
                        <tr key={withdrawal.id} className="hover:bg-gray-700/50 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{withdrawal.provider || "Sin proveedor"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-white">S/ {(withdrawal.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                withdrawal.status === "approved"
                                  ? "bg-green-900/80 text-green-400"
                                  : "bg-red-900/80 text-red-400"
                              }`}
                            >
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(withdrawal.updatedAt)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{withdrawal.method || "No especificado"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300">No hay historial de retiros</p>
                </div>
              )}
            </div>
          </div>
        );

      case "pedidos":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-6xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Ventas General</h3>
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center mb-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Total Ventas</h4>
              <p className="text-3xl font-bold text-white">S/ {totalSales.toFixed(2)}</p>
              <p className="text-sm text-gray-300 mt-2">Suma de todos los pedidos realizados</p>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Historial de Pedidos</h3>
            {sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600/50">
                  <thead className="bg-gray-700/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Nombre del Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usuario Comprador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha y Hora de Compra
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Detalles de la Cuenta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/50 divide-y divide-gray-600/50">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-700/50 transition-all duration-300">
                        <td className="px-4 py-4 whitespace-nowrap text-white">{sale.productName || "Sin nombre"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-white">S/ {(sale.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">{sale.provider || "Sin proveedor"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">{sale.buyerUsername || "Sin usuario"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">{formatDate(sale.purchaseDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getOrderStatus(sale) === "Pendiente"
                                ? "bg-yellow-900/80 text-yellow-400"
                                : getOrderStatus(sale) === "Activo"
                                ? "bg-green-900/80 text-green-400"
                                : "bg-red-900/80 text-red-400"
                            }`}
                          >
                            {getOrderStatus(sale)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                          {sale.accountDetails
                            ? `Email: ${sale.accountDetails.email || "N/A"}, Contraseña: ${sale.accountDetails.password || "N/A"}, Perfil: ${sale.accountDetails.profile || "N/A"}, PIN: ${sale.accountDetails.pin || "No especificado"}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-300">No hay pedidos registrados</p>
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
                <p className="text-3xl font-bold text-white">S/ {earnings.day.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(5 soles por usuario)</p>
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-600/50 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias esta semana</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.week.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(25% del total de usuarios)</p>
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-600/50 shadow-lg">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias este mes</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.month.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(5 soles por cada usuario)</p>
              </div>
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-600/50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Resumen de ganancias</h4>
                <span className="px-3 py-1 bg-cyan-900/80 text-cyan-400 rounded-full text-sm">
                  Total: S/ {earnings.total.toFixed(2)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600/50">
                  <thead className="bg-gray-600/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cálculo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-700/50 divide-y divide-gray-600/50">
                    <tr>
                      <td className="px-4 py-3 text-gray-300">Ganancias por usuario</td>
                      <td className="px-4 py-3 text-white">S/ 5.00</td>
                      <td className="px-4 py-3 text-gray-400">Fijo por cada usuario registrado</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-300">Total usuarios</td>
                      <td className="px-4 py-3 text-white">{totalUsers}</td>
                      <td className="px-4 py-3 text-gray-400">Usuarios activos en el sistema</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-300">Ganancias totales</td>
                      <td className="px-4 py-3 text-white">S/ {earnings.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-400">{totalUsers} usuarios × S/ 5.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "configuracion":
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl max-w-2xl mx-auto border border-gray-700/50">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Configuración de cuenta</h3>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed"
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
                disabled={actionLoading.config}
                className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium mt-4 transition-all duration-300 disabled:bg-cyan-800"
              >
                {actionLoading.config ? (
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
                setActiveSection("retiros");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "retiros" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiArrowRight /> <span>Retiros</span>
            </button>
            <button
              onClick={() => {
                setActiveSection("usuarios");
                setMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === "usuarios" ? "bg-cyan-900/80 text-white" : "text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <FiUsers /> <span>Usuarios</span>
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
              <FiShoppingCart /> <span>Pedidos</span>
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
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
      {/* Notification Modal */}
      <NotificationModal
        isOpen={modal.isOpen}
        message={modal.message}
        title={modal.title}
        onClose={closeModal}
      />
    </div>
  );
};

export default DashboardAdmin;
