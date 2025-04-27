import React, { useState, useEffect } from "react";
<<<<<<< HEAD
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
=======
import { FiSettings, FiLogOut, FiDollarSign, FiUsers, FiMenu, FiTrendingUp, FiHome, FiMessageCircle, FiRefreshCw, FiUser, FiClock, FiCheckCircle, FiAlertCircle, FiInfo, FiFileText, FiPhone, FiArrowRight, FiX, FiCheck } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { db, auth } from "../firebase";
import { signOut, onAuthStateChanged, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { collection, doc, getDoc, setDoc, query, where, onSnapshot, updateDoc, getDocs, serverTimestamp } from "firebase/firestore";
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
<<<<<<< HEAD
  const [users, setUsers] = useState([]); // Last 5 users for display
  const [allUsers, setAllUsers] = useState([]); // All users for search
=======
  const [users, setUsers] = useState([]);
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingTopUps, setPendingTopUps] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [earnings, setEarnings] = useState({ day: 0, week: 0, month: 0, total: 0 });
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [actionLoading, setActionLoading] = useState({}); // Granular loading for actions
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Verificar autenticación y redirigir si no está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setEmail(user.email);
        fetchUsername(user.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Obtener el nombre del administrador autenticado
  const fetchUsername = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.username || userData.email.split("@")[0]);
<<<<<<< HEAD
      } else {
        setError("Usuario no encontrado en la base de datos");
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      }
    } catch (error) {
      console.error("Error al obtener el nombre de usuario:", error);
      setError("Error al cargar datos del usuario");
    }
  };

  // Calcular ganancias basadas en usuarios
  const calculateEarnings = (usersCount) => {
    const earningsPerUser = 5; // 5 soles por usuario
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

  // Obtener usuarios y solicitudes pendientes de Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;
<<<<<<< HEAD
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTotalUsers(usersCount);
        setUsers(usersList.slice(-5)); // Últimos 5 para la vista inicial
        setAllUsers(usersList); // Todos los usuarios para búsqueda
=======
        setTotalUsers(usersCount);
        setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).slice(-5));
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        calculateEarnings(usersCount);

        // Obtener registros pendientes
        const pendingQuery = query(collection(db, "pendingRegistrations"), where("status", "==", "pending"));
        const pendingSnapshot = await getDocs(pendingQuery);
        setPendingRegistrations(pendingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Obtener recargas pendientes
        const topUpsQuery = query(collection(db, "pendingTopUps"), where("status", "==", "pendiente"));
        const topUpsSnapshot = await getDocs(topUpsQuery);
        setPendingTopUps(topUpsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Obtener retiros pendientes
        const withdrawalsQuery = query(collection(db, "withdrawals"), where("status", "==", "pending"));
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        setPendingWithdrawals(withdrawalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("Error al cargar datos");
      }
    };
    fetchData();

    // Escuchar cambios en tiempo real
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersCount = snapshot.size;
<<<<<<< HEAD
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
=======
      setTotalUsers(usersCount);
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).slice(-5));
      calculateEarnings(usersCount);
    });

    const unsubscribePending = onSnapshot(query(collection(db, "pendingRegistrations"), where("status", "==", "pending")), (snapshot) => {
      setPendingRegistrations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeTopUps = onSnapshot(query(collection(db, "pendingTopUps"), where("status", "==", "pendiente")), (snapshot) => {
      setPendingTopUps(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeWithdrawals = onSnapshot(query(collection(db, "withdrawals"), where("status", "==", "pending")), (snapshot) => {
      setPendingWithdrawals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2

    return () => {
      unsubscribeUsers();
      unsubscribePending();
      unsubscribeTopUps();
      unsubscribeWithdrawals();
    };
  }, []);

<<<<<<< HEAD
  // Aprobar un retiro
  const approveWithdrawal = async (withdrawalId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: true }));
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      await updateDoc(withdrawalRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      // Opcional: Actualizar el saldo del usuario si es necesario
      // const withdrawal = pendingWithdrawals.find((w) => w.id === withdrawalId);
      // if (withdrawal?.userId) {
      //   const userRef = doc(db, "users", withdrawal.userId);
      //   await updateDoc(userRef, {
      //     balance: increment(-withdrawal.amount || 0),
      //   });
      // }
      setError(null);
      alert("Retiro aprobado exitosamente");
    } catch (error) {
      console.error("Error al aprobar retiro:", error);
      setError(error.message || "Error al aprobar el retiro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: false }));
    }
  };

  // Rechazar un retiro
  const denyWithdrawal = async (withdrawalId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: true }));
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      await updateDoc(withdrawalRef, {
        status: "denied",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      alert("Retiro rechazado exitosamente");
    } catch (error) {
      console.error("Error al rechazar retiro:", error);
      setError(error.message || "Error al rechazar el retiro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [withdrawalId]: false }));
    }
  };

  // Aprobar una recarga
  const approveTopUp = async (topUpId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [topUpId]: true }));
      const topUpRef = doc(db, "pendingTopUps", topUpId);
      const topUp = pendingTopUps.find((t) => T.id === topUpId);
      if (!topUp?.userId) {
        throw new Error("Usuario no encontrado para la recarga");
      }
      await updateDoc(topUpRef, {
        status: "aprobado",
        updatedAt: serverTimestamp(),
      });
      // Actualizar el saldo del usuario
      const userRef = doc(db, "users", topUp.userId);
      await updateDoc(userRef, {
        balance: increment(topUp.amount || 0),
      });
      setError(null);
      alert("Recarga aprobada exitosamente");
    } catch (error) {
      console.error("Error al aprobar recarga:", error);
      setError(error.message || "Error al aprobar la recarga");
    } finally {
      setActionLoading((prev) => ({ ...prev, [topUpId]: false }));
    }
  };

  // Rechazar una recarga
  const denyTopUp = async (topUpId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [topUpId]: true }));
      const topUpRef = doc(db, "pendingTopUps", topUpId);
      await updateDoc(topUpRef, {
        status: "rechazado",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      alert("Recarga rechazada exitosamente");
    } catch (error) {
      console.error("Error al rechazar recarga:", error);
      setError(error.message || "Error al rechazar la recarga");
    } finally {
      setActionLoading((prev) => ({ ...prev, [topUpId]: false }));
    }
  };

  // Aceptar solicitud de registro
  const handleAccept = async (registrationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
      const registrationRef = doc(db, "pendingRegistrations", registrationId);
      const registration = pendingRegistrations.find((r) => r.id === registrationId);
      if (!registration) {
        throw new Error("Solicitud no encontrada");
      }

      // Check if email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(auth, registration.email);
      if (signInMethods.length > 0) {
        throw new Error("El correo ya está registrado");
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, registration.email, registration.password);
      const user = userCredential.user;

      // Guardar datos del usuario en Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: registration.username,
        email: registration.email,
        role: registration.role || "usuario",
        balance: 0,
        createdAt: serverTimestamp(),
      });

      // Actualizar estado de la solicitud
      await updateDoc(registrationRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      setError(null);
      alert("Solicitud de registro aprobada exitosamente");
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      setError(error.message || "Error al aceptar la solicitud de registro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  // Rechazar solicitud de registro
  const handleDeny = async (registrationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [registrationId]: true }));
      const registrationRef = doc(db, "pendingRegistrations", registrationId);
      await updateDoc(registrationRef, {
        status: "denied",
        updatedAt: serverTimestamp(),
      });
      setError(null);
      alert("Solicitud de registro rechazada exitosamente");
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      setError(error.message || "Error al rechazar la solicitud de registro");
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
<<<<<<< HEAD
      setError(error.message || "Error al cerrar sesión");
    }
  };

  // Guardar cambios en configuración
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setActionLoading((prev) => ({ ...prev, config: true }));
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      const userRef = doc(db, "users", user.uid);

      // Update username in Firestore
      await updateDoc(userRef, {
        username: userName,
        updatedAt: serverTimestamp(),
      });

      // Update password if provided
      const newPassword = e.target.password.value;
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        await updatePassword(user, newPassword);
      }

      setError(null);
      alert("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setError(error.message || "Error al guardar cambios");
    } finally {
      setActionLoading((prev) => ({ ...prev, config: false }));
=======
      setError("Error al cerrar sesión");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return "No especificada";
<<<<<<< HEAD
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "Fecha inválida";
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
=======
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  };

  // Renderizar contenido principal
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
      case "inicio":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
<<<<<<< HEAD
            <h2 className="text-2xl font-bold text-white mb-6">
              Bienvenido, <span className="text-cyan-400">{userName}</span>
            </h2>
=======
            <h2 className="text-2xl font-bold text-white mb-6">Bienvenido, <span className="text-cyan-400">{userName}</span></h2>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Ganancias del mes</h3>
                <p className="text-3xl font-bold text-white">S/ {earnings.month.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-1">(5 soles por cada usuario)</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Usuarios registrados</h3>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
                <p className="text-sm text-gray-300 mt-1">Total ganancias: S/ {earnings.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Últimos usuarios</h3>
                {users.length > 0 ? (
<<<<<<< HEAD
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{user.username || "Sin nombre"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-900 text-cyan-400">
                          {user.role || "usuario"}
                        </span>
=======
                  users.map((user, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{user.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-900 text-cyan-400">{user.role || "usuario"}</span>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      </div>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay usuarios registrados</p>
                )}
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Solicitudes pendientes</h3>
                {pendingRegistrations.length > 0 ? (
<<<<<<< HEAD
                  pendingRegistrations.slice(0, 3).map((reg) => (
                    <div
                      key={reg.id}
                      className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{reg.username || "Sin nombre"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-400">
                          {reg.role || "usuario"}
                        </span>
=======
                  pendingRegistrations.slice(0, 3).map((reg, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{reg.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-400">{reg.role}</span>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      </div>
                      <p className="text-sm text-gray-400">{reg.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay solicitudes pendientes</p>
                )}
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Retiros pendientes</h3>
                {pendingWithdrawals.length > 0 ? (
<<<<<<< HEAD
                  pendingWithdrawals.slice(0, 3).map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{withdrawal.username || "Sin nombre"}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-400">
                          S/ {(withdrawal.amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Método: {withdrawal.method || "No especificado"}</p>
=======
                  pendingWithdrawals.slice(0, 3).map((withdrawal, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{withdrawal.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-400">S/ {withdrawal.amount?.toFixed(2) || "0.00"}</span>
                      </div>
                      <p className="text-sm text-gray-400">Método: {withdrawal.method}</p>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay retiros pendientes</p>
                )}
              </div>
            </div>
          </div>
        );

<<<<<<< HEAD
      case "usuarios":
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-white mb-4">Solicitudes de registro</h3>
              {pendingRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700">
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
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {pendingRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-white">{reg.username || "Sin nombre"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-300">{reg.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900 text-cyan-400">
                              {reg.role || "usuario"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAccept(reg.id)}
                                disabled={actionLoading[reg.id]}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-green-800"
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
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-red-800"
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

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Todos los usuarios ({totalUsers})</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
                </div>
              </div>
              {allUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700">
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
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {allUsers
                        .filter(
                          (user) =>
                            (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-white">{user.username || "Sin nombre"}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900 text-cyan-400">
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Recargas pendientes</h3>
            {pendingTopUps.length > 0 ? (
              <div className="space-y-4">
                {pendingTopUps.map((topUp) => (
                  <div
                    key={topUp.id}
                    className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-400">
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
                    <div className="p-4 bg-gray-700">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => approveTopUp(topUp.id)}
                          disabled={actionLoading[topUp.id]}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-green-800 transition-colors"
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
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-red-800 transition-colors"
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
        );

      case "retiros":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Solicitudes de retiro</h3>
            {pendingWithdrawals.length > 0 ? (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-900 rounded-full flex items-center justify-center text-yellow-400">
                          <FiDollarSign size={18} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{withdrawal.username || "Sin nombre"}</h4>
                          <p className="text-xs text-gray-400">Solicitado: {formatDate(withdrawal.requestedAt)}</p>
                          <p className="text-xs text-gray-400">Método: {withdrawal.method || "No especificado"}</p>
                          {withdrawal.accountDetails && (
                            <p className="text-xs text-gray-400">Detalles: {withdrawal.accountDetails}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-white">S/ {(withdrawal.amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-700">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => approveWithdrawal(withdrawal.id)}
                          disabled={actionLoading[withdrawal.id]}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-green-800 transition-colors"
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
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-red-800 transition-colors"
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
        );

      case "ganancias":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Reporte de ganancias</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias hoy</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.day.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(5 soles por usuario)</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias esta semana</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.week.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(25% del total de usuarios)</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias este mes</h4>
                <p className="text-3xl font-bold text-white">S/ {earnings.month.toFixed(2)}</p>
                <p className="text-sm text-gray-300 mt-2">(5 soles por cada usuario)</p>
              </div>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Resumen de ganancias</h4>
                <span className="px-3 py-1 bg-cyan-900 text-cyan-400 rounded-full text-sm">
                  Total: S/ {earnings.total.toFixed(2)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-600">
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
                  <tbody className="bg-gray-700 divide-y divide-gray-600">
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Configuración de cuenta</h3>
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
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
                <label className="block text-gray-300 mb-1">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading.config}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium mt-4 transition-colors disabled:bg-cyan-800"
              >
                {actionLoading.config ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-auto"></div>
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </form>
          </div>
        );

      default:
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
            <FiAlertCircle className="mx-auto text-4 spodziewane text-yellow-500 mb-4" />
=======
      case 'usuarios':
              return (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Solicitudes de registro</h3>
                    
                    {pendingRegistrations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-800 divide-y divide-gray-600">
                            {pendingRegistrations.map((reg) => (
                              <tr key={reg.id} className="hover:bg-gray-700 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-white">{reg.username}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-gray-300">{reg.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900 text-cyan-400">
                                    {reg.role}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleAccept(reg.id)}
                                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                      title="Aceptar"
                                    >
                                      <FiCheck size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeny(reg.id)}
                                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                      title="Rechazar"
                                    >
                                      <FiX size={16} />
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
      
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Todos los usuarios ({totalUsers})</h3>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar usuarios..."
                          className="px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    {users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-800 divide-y divide-gray-600">
                            {users
                              .filter(user => 
                                user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((user) => (
                                <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                                  <td className="px-4 py-4 whitespace-nowrap text-white">{user.username}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-900 text-cyan-400">
                                      {user.role || 'usuario'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-white">S/ {user.balance?.toFixed(2) || '0.00'}</td>
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
      
            case 'recargas':
              return (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
                  <h3 className="text-xl font-bold text-white mb-6">Recargas pendientes</h3>
                  
                  {pendingTopUps.length > 0 ? (
                    <div className="space-y-4">
                      {pendingTopUps.map((topUp) => (
                        <div key={topUp.id} className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-400">
                                <FiDollarSign size={18} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{topUp.username}</h4>
                                <p className="text-xs text-gray-400">Solicitado: {formatDate(topUp.requestedAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-medium text-white">S/ {topUp.amount?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-700">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => approveTopUp(topUp.id)}
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-green-800 transition-colors"
                              >
                                <FiCheck size={18} /> Aprobar Recarga
                              </button>
                              
                              <button
                                onClick={() => denyTopUp(topUp.id)}
                                disabled={loading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-red-800 transition-colors"
                              >
                                <FiX size={18} /> Rechazar Recarga
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
                      <p className="text-gray-400">Todos las solicitudes han sido procesadas</p>
                    </div>
                  )}
                </div>
              );
      
            case 'retiros':
              return (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
                  <h3 className="text-xl font-bold text-white mb-6">Solicitudes de retiro</h3>
                  
                  {pendingWithdrawals.length > 0 ? (
                    <div className="space-y-4">
                      {pendingWithdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-yellow-900 rounded-full flex items-center justify-center text-yellow-400">
                                <FiDollarSign size={18} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{withdrawal.username}</h4>
                                <p className="text-xs text-gray-400">Solicitado: {formatDate(withdrawal.requestedAt)}</p>
                                <p className="text-xs text-gray-400">Método: {withdrawal.method}</p>
                                {withdrawal.accountDetails && (
                                  <p className="text-xs text-gray-400">Detalles: {withdrawal.accountDetails}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-medium text-white">S/ {withdrawal.amount?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-700">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => approveWithdrawal(withdrawal.id)}
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-green-800 transition-colors"
                              >
                                <FiCheck size={18} /> Aprobar Retiro
                              </button>
                              
                              <button
                                onClick={() => denyWithdrawal(withdrawal.id)}
                                disabled={loading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-red-800 transition-colors"
                              >
                                <FiX size={18} /> Rechazar Retiro
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
                      <p className="text-gray-400">Todos las solicitudes han sido procesadas</p>
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
                      <p className="text-3xl font-bold text-white">S/ {earnings.day.toFixed(2)}</p>
                      <p className="text-sm text-gray-300 mt-2">(5 soles por usuario)</p>
                    </div>
                    
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                      <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias esta semana</h4>
                      <p className="text-3xl font-bold text-white">S/ {earnings.week.toFixed(2)}</p>
                      <p className="text-sm text-gray-300 mt-2">(25% del total de usuarios)</p>
                    </div>
                    
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                      <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ganancias este mes</h4>
                      <p className="text-3xl font-bold text-white">S/ {earnings.month.toFixed(2)}</p>
                      <p className="text-sm text-gray-300 mt-2">(5 soles por cada usuario)</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white">Resumen de ganancias</h4>
                      <span className="px-3 py-1 bg-cyan-900 text-cyan-400 rounded-full text-sm">
                        Total: S/ {earnings.total.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Concepto</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cálculo</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700 divide-y divide-gray-600">
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
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
            <FiAlertCircle className="mx-auto text-4xl text-yellow-500 mb-4" />
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
            <h3 className="text-xl font-bold text-white mb-2">Sección no encontrada</h3>
            <p className="text-gray-300 mb-4">La sección que estás buscando no existe o no está disponible.</p>
            <button
              onClick={() => setActiveSection("inicio")}
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
<<<<<<< HEAD
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-800 overflow-y-auto`}
      >
=======
      <aside className={`fixed inset-y-0 left-0 transform ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-800 overflow-y-auto`}>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
              onClick={() => setActiveSection("inicio")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "inicio" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiHome /> <span>Inicio</span>
            </button>
            <button
              onClick={() => setActiveSection("recargas")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "recargas" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiDollarSign /> <span>Recargas</span>
            </button>
            <button
              onClick={() => setActiveSection("retiros")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "retiros" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiArrowRight /> <span>Retiros</span>
            </button>
            <button
              onClick={() => setActiveSection("usuarios")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "usuarios" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiUsers /> <span>Usuarios</span>
            </button>
            <button
              onClick={() => setActiveSection("ganancias")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "ganancias" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiTrendingUp /> <span>Ganancias</span>
            </button>
            <button
              onClick={() => setActiveSection("configuracion")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "configuracion" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
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
      <main className="md:ml-64 p-4 pt-20 md:pt-4">{renderContent()}</main>
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

export default DashboardAdmin;