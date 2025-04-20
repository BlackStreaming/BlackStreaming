import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FiSettings, 
  FiLogOut, 
  FiDollarSign, 
  FiUsers, 
  FiMenu, 
  FiTrendingUp, 
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
  FiArrowRight,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
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
  serverTimestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";

const DashboardAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingTopUps, setPendingTopUps] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [earnings, setEarnings] = useState({ 
    day: 0, 
    week: 0, 
    month: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
        setUserName(userData.username || userData.email.split('@')[0]);
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
    
    // Calcular ganancias semanales (25% del total) y mensuales (100% del total)
    const weeklyEarnings = totalEarnings * 0.25;
    const dailyEarnings = totalEarnings * 0.05;
    
    setEarnings({
      day: dailyEarnings,
      week: weeklyEarnings,
      month: totalEarnings,
      total: totalEarnings
    });
  };

  // Obtener usuarios y solicitudes pendientes de Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;
        setTotalUsers(usersCount);
        setUsers(usersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })).slice(-5));
        
        // Calcular ganancias basadas en usuarios
        calculateEarnings(usersCount);
  
        // Obtener registros pendientes
        const pendingQuery = query(
          collection(db, "pendingRegistrations"), 
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        setPendingRegistrations(pendingSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })));
  
        // Obtener recargas pendientes
        const topUpsQuery = query(
          collection(db, "pendingTopUps"), 
          where("status", "==", "pendiente")
        );
        const topUpsSnapshot = await getDocs(topUpsQuery);
        setPendingTopUps(topUpsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })));

        // Obtener retiros pendientes
        const withdrawalsQuery = query(
          collection(db, "withdrawals"),
          where("status", "==", "pending")
        );
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        setPendingWithdrawals(withdrawalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setError("Error al cargar datos");
      }
    };
  
    fetchData();

    // Escuchar cambios en tiempo real
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersCount = snapshot.size;
      setTotalUsers(usersCount);
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(-5));
      calculateEarnings(usersCount);
    });

    const unsubscribePending = onSnapshot(
      query(collection(db, "pendingRegistrations"), where("status", "==", "pending")),
      (snapshot) => {
        setPendingRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeTopUps = onSnapshot(
      query(collection(db, "pendingTopUps"), where("status", "==", "pendiente")),
      (snapshot) => {
        setPendingTopUps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeWithdrawals = onSnapshot(
      query(collection(db, "withdrawals"), where("status", "==", "pending")),
      (snapshot) => {
        setPendingWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribePending();
      unsubscribeTopUps();
      unsubscribeWithdrawals();
    };
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError("Error al cerrar sesión");
    }
  };

  // Función para aceptar usuarios
  const handleAccept = async (id) => {
    try {
      setLoading(true);
      const registrationRef = doc(db, "pendingRegistrations", id);
      const registrationDoc = await getDoc(registrationRef);

      if (registrationDoc.exists()) {
        const { email, password, username, role, referrerCode } = registrationDoc.data();

        // Verificar si el correo ya está registrado
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          alert("Este correo ya está registrado");
          return;
        }

        // Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Guardar usuario en Firestore
        await setDoc(doc(db, "users", userId), {
          username,
          email,
          role,
          referrerCode: referrerCode || null,
          balance: 0,
          createdAt: serverTimestamp(),
          earnings: 0
        });

        // Actualizar estado en pendingRegistrations
        await updateDoc(registrationRef, { 
          status: "accepted",
          processedAt: serverTimestamp(),
          processedBy: auth.currentUser.uid
        });

        alert(`Usuario ${username} aceptado correctamente`);
      }
    } catch (error) {
      console.error("Error al aceptar usuario:", error);
      setError("Error al aceptar usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para rechazar usuarios
  const handleDeny = async (id) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "pendingRegistrations", id), { 
        status: "denied",
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser.uid
      });
      alert("Solicitud rechazada correctamente");
    } catch (error) {
      console.error("Error al rechazar usuario:", error);
      setError("Error al rechazar usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para aprobar recargas
  const approveTopUp = async (id) => {
    try {
      setLoading(true);
      const topUpRef = doc(db, "pendingTopUps", id);
      const topUpDoc = await getDoc(topUpRef);

      if (topUpDoc.exists()) {
        const { userId, amount } = topUpDoc.data();
        
        // Actualizar estado de la recarga
        await updateDoc(topUpRef, { 
          status: "aprobado", 
          approvedAt: serverTimestamp(),
          approvedBy: auth.currentUser.uid
        });

        // Actualizar saldo del usuario
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const currentBalance = userDoc.data().balance || 0;
          await updateDoc(userRef, { balance: currentBalance + amount });
        }

        alert("Recarga aprobada y saldo actualizado");
      }
    } catch (error) {
      console.error("Error al aprobar recarga:", error);
      setError("Error al aprobar recarga");
    } finally {
      setLoading(false);
    }
  };

  // Función para denegar recargas
  const denyTopUp = async (id) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "pendingTopUps", id), { 
        status: "denegado",
        rejectedAt: serverTimestamp(),
        rejectedBy: auth.currentUser.uid
      });
      alert("Recarga denegada correctamente");
    } catch (error) {
      console.error("Error al denegar recarga:", error);
      setError("Error al denegar recarga");
    } finally {
      setLoading(false);
    }
  };

  // Función para aprobar retiro
  const approveWithdrawal = async (id) => {
    try {
      setLoading(true);
      const withdrawalRef = doc(db, "withdrawals", id);
      const withdrawalDoc = await getDoc(withdrawalRef);

      if (withdrawalDoc.exists()) {
        const { userId, amount } = withdrawalDoc.data();
        
        // Verificar saldo del proveedor
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const currentBalance = userDoc.data().balance || 0;
          if (currentBalance < amount) {
            alert("El proveedor no tiene suficiente saldo");
            return;
          }

          // Actualizar estado del retiro
          await updateDoc(withdrawalRef, { 
            status: "approved",
            approvedAt: serverTimestamp(),
            adminId: auth.currentUser.uid
          });

          // Actualizar saldo del proveedor
          await updateDoc(userRef, { 
            balance: currentBalance - amount,
            totalWithdrawn: (userDoc.data().totalWithdrawn || 0) + amount
          });

          alert("Retiro aprobado y saldo actualizado");
        }
      }
    } catch (error) {
      console.error("Error al aprobar retiro:", error);
      setError("Error al aprobar retiro");
    } finally {
      setLoading(false);
    }
  };

  // Función para rechazar retiro
  const denyWithdrawal = async (id) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "withdrawals", id), { 
        status: "rejected",
        rejectedAt: serverTimestamp(),
        adminId: auth.currentUser.uid
      });
      alert("Retiro rechazado correctamente");
    } catch (error) {
      console.error("Error al rechazar retiro:", error);
      setError("Error al rechazar retiro");
    } finally {
      setLoading(false);
    }
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
                  users.map((user, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{user.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-900 text-cyan-400">
                          {user.role || 'usuario'}
                        </span>
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
                  pendingRegistrations.slice(0, 3).map((reg, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{reg.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-400">
                          {reg.role}
                        </span>
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
                  pendingWithdrawals.slice(0, 3).map((withdrawal, index) => (
                    <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors rounded-lg px-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-white">{withdrawal.username}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-400">
                          S/ {withdrawal.amount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Método: {withdrawal.method}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 py-2">No hay retiros pendientes</p>
                )}
              </div>
            </div>
          </div>
        );

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
                <p className="text-sm text-gray-400 mt-1">Administrador</p>
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
                      setActiveSection("recargas");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "recargas" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiDollarSign className="mr-3" /> Recargas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("retiros");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "retiros" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiArrowRight className="mr-3" /> Retiros
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("usuarios");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "usuarios" ? 'bg-cyan-900 text-cyan-400 font-medium' : 'hover:bg-gray-700 text-gray-300'}`}
                  >
                    <FiUsers className="mr-3" /> Usuarios
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
                    <FiTrendingUp className="mr-3" /> Ganancias
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

export default DashboardAdmin;