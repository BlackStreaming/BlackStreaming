import React, { useState, useEffect } from "react";
import {
  FiHome, FiBox, FiUpload, FiDollarSign, FiSettings,
  FiLogOut, FiMenu, FiEdit2, FiTrash2, FiPlus,
  FiCheck, FiX, FiUser, FiCreditCard, FiShoppingCart,
  FiClock, FiAlertCircle, FiX as FiClose
} from "react-icons/fi";
import {
  collection, addDoc, query, where, onSnapshot,
  doc, deleteDoc, setDoc, getDoc, serverTimestamp,
  updateDoc, orderBy
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const DashboardProvider = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [username, setUsername] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState({
    image: "",
    category: "Netflix",
    name: "",
    price: "",
    stock: 1,
    duration: "",
    providerPhone: "",
    details: "",
    terms: "",
    status: "En stock",
    accounts: Array(1).fill({ email: "", password: "", profile: "" }),
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    email: "",
    password: "",
    preferences: "",
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Yape");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

  const navigate = useNavigate();
  const auth = getAuth();

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

  const getCategoryDisplayName = (type) => {
    const categoryMap = {
      netflix: "Netflix",
      spotify: "Spotify",
      disney: "Disney+",
      max: "Max",
      primevideo: "Prime Video",
      vix: "Vix",
    };
    return categoryMap[type?.toLowerCase()] || "Otro";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setEmail(user.email || "");
        setUid(user.uid);
        console.log("UID del usuario autenticado:", user.uid); // Log para depurar
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || "Usuario");
        setAccountDetails({
          email: userData.email || "",
          password: "",
          preferences: userData.preferences || "",
        });
      }
      setLoading(false);
    } catch (error) {
      setError("Error al cargar datos del usuario");
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminStatus = async (email) => {
      try {
        const adminDoc = await getDoc(doc(db, "admins", email));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    if (email) checkAdminStatus(email);
  }, [email]);

  useEffect(() => {
    if (!username) return;
    const q = query(collection(db, "products"), where("provider", "==", username));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetchedProducts);
    }, (err) => {
      console.error("Error fetching products:", err);
      setError("Error al cargar productos");
    });
    return () => unsubscribe();
  }, [username]);

  // useEffect para cargar las ventas (pedidos)
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "sales"),
      where("providerId", "==", uid)
      // Quitamos orderBy("saleDate", "desc") temporalmente para evitar problemas si saleDate no existe
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSales = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          productName: data.productName || "Producto sin nombre",
          category: data.type || "netflix",
          buyer: data.customerName || data.customerNAME || "Comprador desconocido", // Corrección para customerNAME
          buyerEmail: data.customerEmail || "Sin email",
          buyerPhone: data.phoneNumber || "Sin teléfono",
          date: data.saleDate ? new Date(data.saleDate) : data.createdAt ? new Date(data.createdAt) : new Date(), // Usar createdAt si saleDate no existe
          amount: parseFloat(data.price) || 0,
          status: data.status || "completed",
          accountDetails: data.accountDetails || { email: "No disponible", password: "No disponible", profile: "N/A" },
        };
      });
      setOrders(fetchedSales);
      console.log("Ventas cargadas:", fetchedSales);
    }, (err) => {
      console.error("Error fetching sales:", err);
      setError("Error al cargar ventas");
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!username) return;
    const q = query(
      collection(db, "withdrawals"),
      where("provider", "==", username),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWithdrawals = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount) || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          processedAt: data.processedAt?.toDate?.() || null,
        };
      });
      setWithdrawals(fetchedWithdrawals);
    }, (err) => {
      console.error("Error fetching withdrawals:", err);
      setError("Error al cargar retiros");
    });
    return () => unsubscribe();
  }, [username]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(
      collection(db, "withdrawals"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWithdrawals = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amount: parseFloat(data.amount) || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
      setPendingWithdrawals(fetchedWithdrawals);
    }, (err) => {
      console.error("Error fetching pending withdrawals:", err);
      setError("Error al cargar solicitudes de retiro pendientes");
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => {
        setError("Error al cerrar sesión");
        console.error("Logout error:", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockChange = (e) => {
    const newStock = parseInt(e.target.value) || 1;
    const currentAccounts = product.accounts || [];
    if (newStock > currentAccounts.length) {
      const newAccounts = [...currentAccounts];
      while (newAccounts.length < newStock) {
        newAccounts.push({ email: "", password: "", profile: "" });
      }
      setProduct({ ...product, stock: newStock, accounts: newAccounts });
    } else if (newStock < currentAccounts.length) {
      const newAccounts = currentAccounts.slice(0, Math.max(newStock, 1));
      setProduct({ ...product, stock: newStock, accounts: newAccounts });
    } else {
      setProduct({ ...product, stock: newStock });
    }
  };

  const handleAccountFieldChange = (index, field, value) => {
    const newAccounts = [...product.accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setProduct({ ...product, accounts: newAccounts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const hasEmptyAccounts = product.accounts.some((acc) => !acc.email || !acc.password);
    if (hasEmptyAccounts) {
      setError("Por favor complete todos los campos de las cuentas");
      return;
    }

    try {
      const productData = {
        ...product,
        provider: username,
        providerId: uid,
        providerPhone: product.providerPhone || "",
        createdAt: serverTimestamp(),
        availableAccounts: product.accounts.length,
      };
      const productRef = await addDoc(collection(db, "products"), productData);

      const accountsCollection = collection(db, `products/${productRef.id}/accounts`);
      for (const account of product.accounts) {
        await addDoc(accountsCollection, {
          email: account.email,
          password: account.password,
          profile: account.profile || "",
          status: "available",
        });
      }

      setProduct({
        image: "",
        category: "Netflix",
        name: "",
        price: "",
        stock: 1,
        duration: "",
        providerPhone: "",
        details: "",
        terms: "",
        status: "En stock",
        accounts: [{ email: "", password: "", profile: "" }],
      });

      setActiveSection("inventario");
      alert("Producto subido exitosamente!");
    } catch (error) {
      console.error("Error al subir el producto:", error);
      setError(`Error al subir el producto: ${error.message}`);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct({
      ...product,
      accounts: product.accounts || Array(Math.max(product.stock || 1, 1)).fill({ email: "", password: "", profile: "" }),
      providerId: product.providerId || uid,
    });
    setEditModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        const productRef = doc(db, "products", selectedProduct.id);
        await setDoc(productRef, {
          ...selectedProduct,
          providerId: selectedProduct.providerId || uid,
        }, { merge: true });
        setEditModalOpen(false);
        alert("Producto actualizado exitosamente!");
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setError("Error al actualizar el producto");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        alert("Producto eliminado exitosamente!");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setError("Error al eliminar el producto");
      }
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            username,
            email: accountDetails.email,
            preferences: accountDetails.preferences,
            ...(accountDetails.password && { password: accountDetails.password }),
          },
          { merge: true }
        );
        alert("Configuración actualizada correctamente!");
      }
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      setError("Error al actualizar la configuración");
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Ingrese un monto válido");
      return;
    }
    const availableBalance = calculateAvailableBalance();
    if (parseFloat(withdrawAmount) > availableBalance) {
      setError("No tienes suficientes fondos disponibles");
      return;
    }
    if (!withdrawAccount) {
      setError("Ingrese los datos de su cuenta");
      return;
    }
    try {
      await addDoc(collection(db, "withdrawals"), {
        provider: username,
        providerEmail: email,
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        account: withdrawAccount,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setWithdrawAmount("");
      setWithdrawAccount("");
      alert("Solicitud de retiro enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar retiro:", error);
      setError("Error al solicitar retiro");
    }
  };

  const handleWithdrawAction = async (withdrawalId, action) => {
    try {
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      await updateDoc(withdrawalRef, {
        status: action,
        processedAt: serverTimestamp(),
        processedBy: email,
      });
      alert(action === "approved" ? "Retiro aprobado correctamente" : "Retiro rechazado");
    } catch (error) {
      console.error("Error al procesar retiro:", error);
      setError("Error al procesar retiro");
    }
  };

  const totalEarnings = orders.reduce((total, order) => total + (order.amount || 0), 0);
  const totalWithdrawn = withdrawals.reduce((total, withdrawal) => total + (withdrawal.status === "approved" ? withdrawal.amount : 0), 0);
  const calculateAvailableBalance = () => totalEarnings - totalWithdrawn;
  const availableBalance = calculateAvailableBalance();
  const totalStock = products.reduce((total, product) => total + (parseInt(product.stock) || 0), 0);

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
            onClick={() => setError("")}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Aceptar
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              Bienvenido, <span className="text-cyan-400">{username}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <FiBox className="mr-2" /> Inventario
                </h3>
                <p className="text-3xl font-bold text-white">{products.length}</p>
                <p className="text-gray-400">Productos registrados</p>
                <p className="text-gray-400">Stock total: {totalStock}</p>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <FiDollarSign className="mr-2" /> Ganancias
                </h3>
                <p className="text-3xl font-bold text-white">S/ {totalEarnings.toFixed(2)}</p>
                <p className="text-gray-400">{orders.length} ventas realizadas</p>
                <button
                  onClick={() => setActiveSection("retiros")}
                  className="text-cyan-400 hover:underline text-sm"
                >
                  Retirar fondos
                </button>
              </div>
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <FiUser className="mr-2" /> Mi Cuenta
                </h3>
                <p className="text-lg font-medium text-white">{username}</p>
                <p className="text-sm text-gray-400 truncate">{email}</p>
                <button
                  onClick={() => setActiveSection("configuracion")}
                  className="text-cyan-400 hover:underline text-sm"
                >
                  Editar perfil
                </button>
              </div>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FiShoppingCart className="mr-2" /> Pedidos recientes
              </h3>
              {orders.length === 0 ? (
                <p className="text-gray-400 py-2 text-center">
                  No hay pedidos recientes. Verifica que las ventas tengan el providerId correcto en Firestore.
                </p>
              ) : (
                orders.slice(0, 3).map((order, index) => (
                  <div key={index} className="border-b border-gray-600 py-3 last:border-0 hover:bg-gray-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="w-2/3">
                        <p className="font-medium text-white truncate">{order.productName}</p>
                        <p className="text-sm text-gray-400 truncate">Comprador: {order.buyer}</p>
                      </div>
                      <div className="text-right w-1/3">
                        <p className="font-medium text-white">S/ {(order.amount || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-400">{formatDate(order.date)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
        );

      case "inventario":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FiBox className="mr-2" /> Inventario
              </h3>
              <button
                onClick={() => setActiveSection("subirProducto")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center w-full md:w-auto justify-center transition-colors"
              >
                <FiPlus className="mr-2" /> Nuevo Producto
              </button>
            </div>
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-600">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white truncate max-w-xs">{product.name}</div>
                              <div className="text-xs text-gray-400">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">S/ {(parseFloat(product.price) || 0).toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{product.stock || 0}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.status === "En stock" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-cyan-400 hover:text-cyan-500 mr-3"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-500"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBox className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No tienes productos registrados</h4>
                <p className="text-gray-400">Agrega tu primer producto para comenzar</p>
                <button
                  onClick={() => setActiveSection("subirProducto")}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center mx-auto transition-colors"
                >
                  <FiPlus className="mr-2" /> Agregar Producto
                </button>
              </div>
            )}
          </div>
        );

      case "subirProducto":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiUpload className="mr-2" /> Subir Nuevo Producto
            </h3>
            {error && (
              <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-gray-300 mb-2">Imagen del producto</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    {product.image ? (
                      <div className="relative">
                        <img src={product.image} alt="Preview" className="mx-auto h-48 w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setProduct({ ...product, image: "" })}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-400 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-500 focus-within:outline-none"
                          >
                            <span>Subir una imagen</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Nombre del producto*</label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Ej: Netflix Premium 1 mes"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Categoría*</label>
                      <select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        <option value="Netflix">Netflix</option>
                        <option value="Spotify">Spotify</option>
                        <option value="Disney">Disney+</option>
                        <option value="Max">Max</option>
                        <option value="Prime Video">Prime Video</option>
                        <option value="Vix">Vix</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Estado*</label>
                      <select
                        name="status"
                        value={product.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        <option value="En stock">En stock</option>
                        <option value="A pedido">A pedido</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Precio (S/)*</label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Ej: 9.99"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Stock*</label>
                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleStockChange}
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Duración (días)</label>
                  <input
                    type="number"
                    name="duration"
                    value={product.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Dejar vacío para ilimitado"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Teléfono de contacto</label>
                  <input
                    type="text"
                    name="providerPhone"
                    value={product.providerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Ej: +51 987654321"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Detalles del producto</label>
                <textarea
                  name="details"
                  value={product.details}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Describe los detalles y características del producto"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Términos y condiciones</label>
                <textarea
                  name="terms"
                  value={product.terms}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Especifica los términos y condiciones de uso"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Cuentas asociadas*</label>
                <p className="text-xs text-gray-400 mb-3">Debe completar todas las cuentas según el stock indicado</p>
                <div className="space-y-4">
                  {product.accounts.map((account, index) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                      <h4 className="text-sm font-medium text-white mb-3">Cuenta {index + 1}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Correo electrónico*</label>
                          <input
                            type="email"
                            value={account.email}
                            onChange={(e) => handleAccountFieldChange(index, "email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Contraseña*</label>
                          <input
                            type="text"
                            value={account.password}
                            onChange={(e) => handleAccountFieldChange(index, "password", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Perfil (opcional)</label>
                          <input
                            type="text"
                            value={account.profile}
                            onChange={(e) => handleAccountFieldChange(index, "profile", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                            placeholder="Ej: Perfil 1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("inventario")}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
                >
                  Subir Producto
                </button>
              </div>
            </form>
          </div>
        );

      case "ganancias":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiDollarSign className="mr-2" /> Ganancias
            </h3>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Ganancias totales</h4>
                  <p className="text-sm text-gray-400">{orders.length} ventas realizadas</p>
                  <p className="text-sm text-gray-400">Retirado: S/ {totalWithdrawn.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Disponible: S/ {availableBalance.toFixed(2)}</p>
                </div>
                <div className="text-3xl font-bold text-white mt-2 md:mt-0">S/ {totalEarnings.toFixed(2)}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comprador</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-600">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-white">{order.productName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{getCategoryDisplayName(order.category)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.buyer}</div>
                        <div className="text-xs text-gray-400">{order.buyerEmail}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{order.buyerPhone}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.date)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white">S/ {(order.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-400`}
                        >
                          Completado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <div className="text-center py-12">
                <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No hay ventas registradas</h4>
                <p className="text-gray-400">
                  Tus ventas aparecerán aquí. Verifica que las ventas tengan el providerId correcto en Firestore.
                </p>
              </div>
            )}
          </div>
        );

      case "pedidos":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiShoppingCart className="mr-2" /> Pedidos
            </h3>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comprador</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Detalles de cuenta</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-600">
                    {orders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-white">{order.productName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{order.buyer}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.date)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">S/ {(order.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.accountDetails ? (
                            <div>
                              <p>Email: {order.accountDetails.email}</p>
                              <p>Password: {order.accountDetails.password}</p>
                              <p>Profile: {order.accountDetails.profile || "N/A"}</p>
                            </div>
                          ) : (
                            "No disponible"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No hay pedidos registrados</h4>
                <p className="text-gray-400">
                  Los pedidos de tus productos aparecerán aquí. Verifica que las ventas tengan el providerId correcto en Firestore.
                </p>
              </div>
            )}
          </div>
        );

      case "retiros":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            {isAdmin ? (
              <>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FiCreditCard className="mr-2" /> Solicitudes de Retiro Pendientes
                </h3>
                {pendingWithdrawals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Proveedor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Método</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto (S/)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-600">
                        {pendingWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white truncate max-w-xs">{withdrawal.provider}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">{withdrawal.providerEmail}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{withdrawal.method}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">S/ {(withdrawal.amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(withdrawal.createdAt)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleWithdrawAction(withdrawal.id, "approved")}
                                  className="text-green-400 hover:text-green-500 flex items-center text-sm"
                                >
                                  <FiCheck className="mr-1" /> Aprobar
                                </button>
                                <button
                                  onClick={() => handleWithdrawAction(withdrawal.id, "rejected")}
                                  className="text-red-400 hover:text-red-500 flex items-center text-sm"
                                >
                                  <FiX className="mr-1" /> Rechazar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiCreditCard className="mx-auto text-4xl text-gray-400 mb-3" />
                    <h4 className="text-lg font-medium text-gray-300">No hay solicitudes pendientes</h4>
                    <p className="text-gray-400">Las solicitudes de retiro aparecerán aquí</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FiCreditCard className="mr-2" /> Retirar Dinero
                </h3>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-1">Saldo disponible</h4>
                      <p className="text-sm text-gray-400">Ganancias totales: S/ {totalEarnings.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Retirado: S/ {totalWithdrawn.toFixed(2)}</p>
                    </div>
                    <div className="text-3xl font-bold text-white mt-2 md:mt-0">S/ {availableBalance.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-medium text-white mb-4">Solicitar Retiro</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Monto a retirar (S/)*</label>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Ej: 150.00"
                          step="0.01"
                          min="0"
                          max={availableBalance}
                        />
                        <p className="text-xs text-gray-400 mt-1">Máximo disponible: S/ {availableBalance.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Método de pago*</label>
                        <select
                          value={withdrawMethod}
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="Yape">Yape</option>
                          <option value="Plin">Plin</option>
                          <option value="Transferencia">Transferencia Bancaria</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Datos de la cuenta*</label>
                        <input
                          type="text"
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder={withdrawMethod === "Yape" ? "Número de teléfono" : "Número de cuenta"}
                          required
                        />
                      </div>
                      <button
                        onClick={handleWithdrawRequest}
                        disabled={
                          !withdrawAmount ||
                          parseFloat(withdrawAmount) <= 0 ||
                          parseFloat(withdrawAmount) > availableBalance ||
                          !withdrawAccount
                        }
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                          withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= availableBalance && withdrawAccount
                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Solicitar Retiro
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-medium text-white mb-4">Historial de Retiros</h4>
                    {withdrawals.length > 0 ? (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal, index) => (
                          <div key={index} className="border-b border-gray-600 py-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-white">S/ {(withdrawal.amount || 0).toFixed(2)}</p>
                                <p className="text-sm text-gray-400">{withdrawal.method} - {withdrawal.account}</p>
                                <p className="text-xs text-gray-400">
                                  {withdrawal.status === "pending" ? "Solicitado" : "Procesado"}: {formatDate(withdrawal.status === "pending" ? withdrawal.createdAt : withdrawal.processedAt)}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                  withdrawal.status === "approved"
                                    ? "bg-green-900 text-green-400"
                                    : withdrawal.status === "rejected"
                                    ? "bg-red-900 text-red-400"
                                    : "bg-yellow-900 text-yellow-400"
                                }`}
                              >
                                {withdrawal.status === "approved" ? "Aprobado" : withdrawal.status === "rejected" ? "Rechazado" : "Pendiente"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiCreditCard className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="text-gray-400">No hay retiros registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "configuracion":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiSettings className="mr-2" /> Configuración de cuenta
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAccount(); }} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario*</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Correo electrónico*</label>
                <input
                  type="email"
                  name="email"
                  value={accountDetails.email}
                  onChange={handleAccountChange}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={accountDetails.password}
                  onChange={handleAccountChange}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Preferencias</label>
                <textarea
                  name="preferences"
                  value={accountDetails.preferences}
                  onChange={handleAccountChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Tus preferencias y configuraciones"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
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
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none"
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-gray-800 overflow-y-auto`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-cyan-400">BlackStreaming</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-700"
            >
              <FiClose className="text-lg" />
            </button>
          </div>
          <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-700 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white truncate">{username}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
              <p className="text-xs mt-2 bg-cyan-900 text-cyan-400 py-1 px-2 rounded-full inline-block">
                {isAdmin ? "Administrador" : "Proveedor"}
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <button
              onClick={() => { setActiveSection("inicio"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "inicio" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiHome /> <span>Inicio</span>
            </button>
            <button
              onClick={() => { setActiveSection("inventario"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "inventario" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiBox /> <span>Inventario</span>
            </button>
            <button
              onClick={() => { setActiveSection("subirProducto"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "subirProducto" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiUpload /> <span>Subir Producto</span>
            </button>
            <button
              onClick={() => { setActiveSection("ganancias"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "ganancias" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiDollarSign /> <span>Ganancias</span>
            </button>
            <button
              onClick={() => { setActiveSection("pedidos"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "pedidos" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiShoppingCart /> <span>Pedidos</span>
            </button>
            <button
              onClick={() => { setActiveSection("retiros"); setMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "retiros" ? "bg-cyan-900 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FiCreditCard /> <span>Retiros</span>
            </button>
            <button
              onClick={() => { setActiveSection("configuracion"); setMenuOpen(false); }}
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

      <main className="md:ml-64 p-4 pt-20 md:pt-4">
        {renderContent()}
      </main>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Editar Producto</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>
              {selectedProduct && (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Imagen</label>
                      <div className="flex items-center space-x-4">
                        {selectedProduct.image && (
                          <div className="relative">
                            <img src={selectedProduct.image} alt="Product" className="w-16 h-16 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => setSelectedProduct({ ...selectedProduct, image: "" })}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedProduct({ ...selectedProduct, image: reader.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-sm text-gray-300"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Nombre*</label>
                        <input
                          type="text"
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Categoría*</label>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="Netflix">Netflix</option>
                          <option value="Spotify">Spotify</option>
                          <option value="Disney">Disney+</option>
                          <option value="Max">Max</option>
                          <option value="Prime Video">Prime Video</option>
                          <option value="Vix">Vix</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Precio (S/)*</label>
                        <input
                          type="number"
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Stock*</label>
                        <input
                          type="number"
                          value={selectedProduct.stock}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Estado*</label>
                        <select
                          value={selectedProduct.status}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="En stock">En stock</option>
                          <option value="A pedido">A pedido</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Duración (días)</label>
                        <input
                          type="number"
                          value={selectedProduct.duration}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, duration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Dejar vacío para ilimitado"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Teléfono de contacto</label>
                        <input
                          type="text"
                          value={selectedProduct.providerPhone}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, providerPhone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Ej: +51 987654321"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Detalles</label>
                      <textarea
                        value={selectedProduct.details || ""}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, details: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Describe los detalles y características del producto"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Términos y condiciones</label>
                      <textarea
                        value={selectedProduct.terms || ""}
                        onChange={(e) => setSelectedProduct({ ...selectedProduct, terms: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Especifica los términos y condiciones de uso"
                      ></textarea>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProvider;