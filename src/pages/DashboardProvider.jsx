import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  FiHome, FiBox, FiUpload, FiDollarSign, FiSettings,
  FiLogOut, FiMenu, FiEdit2, FiTrash2, FiPlus,
  FiCheck, FiX, FiUser, FiCreditCard, FiShoppingCart,
  FiClock, FiAlertCircle, FiX as FiClose
} from "react-icons/fi";
import {
  collection, addDoc, query, where, onSnapshot,
=======
import { 
  FiHome, FiBox, FiUpload, FiTrendingUp, FiSettings, 
  FiLogOut, FiMenu, FiEdit2, FiTrash2, FiPlus, 
  FiRefreshCw, FiCheck, FiX, FiUser, FiDollarSign,
  FiShoppingCart, FiClock, FiAlertCircle, FiInfo,
  FiCreditCard
} from "react-icons/fi";
import { 
  collection, addDoc, query, where, onSnapshot, 
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
  const [uid, setUid] = useState("");
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
<<<<<<< HEAD
=======
  
  // Form states
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
=======

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    email: "",
    password: "",
    preferences: "",
  });
<<<<<<< HEAD
=======

  // Withdrawal states
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Yape");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

  const navigate = useNavigate();
  const auth = getAuth();

<<<<<<< HEAD
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

=======
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle authentication state
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setEmail(user.email || "");
<<<<<<< HEAD
        setUid(user.uid);
        console.log("UID del usuario autenticado:", user.uid); // Log para depurar
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

<<<<<<< HEAD
=======
  // Fetch user data
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
<<<<<<< HEAD
=======
      
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || "Usuario");
        setAccountDetails({
          email: userData.email || "",
          password: "",
<<<<<<< HEAD
          preferences: userData.preferences || "",
=======
          preferences: userData.preferences || ""
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        });
      }
      setLoading(false);
    } catch (error) {
      setError("Error al cargar datos del usuario");
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  // Check if user is admin
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  useEffect(() => {
    const checkAdminStatus = async (email) => {
      try {
        const adminDoc = await getDoc(doc(db, "admins", email));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
<<<<<<< HEAD
    if (email) checkAdminStatus(email);
  }, [email]);

  useEffect(() => {
    if (!username) return;
    const q = query(collection(db, "products"), where("provider", "==", username));
=======

    if (email) {
      checkAdminStatus(email);
    }
  }, [email]);

  // Fetch products
  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "products"),
      where("provider", "==", username)
    );
    
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetchedProducts);
<<<<<<< HEAD
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
=======
    });

    return () => unsubscribe();
  }, [username]);

  // Fetch orders - CORREGIDO: Ahora ordena por fecha y filtra por proveedor
  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "orders"),
      where("provider", "==", username),
      orderBy("date", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Asegurarse de que el monto es un número
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
          date: data.date?.toDate() || new Date()
        };
      });
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [username]);

  // Fetch withdrawals for provider
  useEffect(() => {
    if (!username) return;

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    const q = query(
      collection(db, "withdrawals"),
      where("provider", "==", username),
      orderBy("createdAt", "desc")
    );
<<<<<<< HEAD
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
=======
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWithdrawals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount) || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate() || null
      }));
      setWithdrawals(fetchedWithdrawals);
    });

    return () => unsubscribe();
  }, [username]);

  // Fetch pending withdrawals for admin
  useEffect(() => {
    if (!isAdmin) return;

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    const q = query(
      collection(db, "withdrawals"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
<<<<<<< HEAD
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

=======
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWithdrawals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount) || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setPendingWithdrawals(fetchedWithdrawals);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Handle logout
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => {
        setError("Error al cerrar sesión");
        console.error("Logout error:", error);
      });
  };

<<<<<<< HEAD
=======
  // Handle form changes
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
=======
  // Handle account details changes
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
=======
  // Handle file upload
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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

<<<<<<< HEAD
  const handleStockChange = (e) => {
    const newStock = parseInt(e.target.value) || 1;
    const currentAccounts = product.accounts || [];
=======
  // Handle stock change - update accounts array length
  const handleStockChange = (e) => {
    const newStock = parseInt(e.target.value) || 1;
    const currentAccounts = product.accounts || [];
    
    // If increasing stock, add empty accounts
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    if (newStock > currentAccounts.length) {
      const newAccounts = [...currentAccounts];
      while (newAccounts.length < newStock) {
        newAccounts.push({ email: "", password: "", profile: "" });
      }
      setProduct({ ...product, stock: newStock, accounts: newAccounts });
<<<<<<< HEAD
    } else if (newStock < currentAccounts.length) {
      const newAccounts = currentAccounts.slice(0, Math.max(newStock, 1));
      setProduct({ ...product, stock: newStock, accounts: newAccounts });
    } else {
=======
    } 
    // If decreasing stock, remove accounts (but keep at least 1)
    else if (newStock < currentAccounts.length) {
      const newAccounts = currentAccounts.slice(0, Math.max(newStock, 1));
      setProduct({ ...product, stock: newStock, accounts: newAccounts });
    } 
    // If same stock, just update the number
    else {
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      setProduct({ ...product, stock: newStock });
    }
  };

<<<<<<< HEAD
=======
  // Handle account field changes
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleAccountFieldChange = (index, field, value) => {
    const newAccounts = [...product.accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setProduct({ ...product, accounts: newAccounts });
  };

<<<<<<< HEAD
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

=======
  // Handle product submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Validate accounts
      const hasEmptyAccounts = product.accounts.some(
        acc => !acc.email || !acc.password
      );
      
      if (hasEmptyAccounts) {
        setError("Por favor complete todos los campos de las cuentas");
        return;
      }

      await addDoc(collection(db, "products"), {
        ...product,
        provider: username,
        providerPhone: product.providerPhone || "",
        accounts: product.accounts,
        createdAt: serverTimestamp(),
        availableAccounts: product.accounts.length // Track available accounts
      });

      // Reset form
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
      setError(`Error al subir el producto: ${error.message}`);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct({
      ...product,
      accounts: product.accounts || Array(Math.max(product.stock || 1, 1)).fill({ email: "", password: "", profile: "" }),
      providerId: product.providerId || uid,
=======
      setError("Error al subir el producto");
    }
  };

  // Handle product edit
  const handleEdit = (product) => {
    setSelectedProduct({
      ...product,
      // Ensure accounts array matches stock count
      accounts: product.accounts || Array(Math.max(product.stock, 1)).fill({ email: "", password: "", profile: "" })
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    });
    setEditModalOpen(true);
  };

<<<<<<< HEAD
=======
  // Handle product update
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        const productRef = doc(db, "products", selectedProduct.id);
<<<<<<< HEAD
        await setDoc(productRef, {
          ...selectedProduct,
          providerId: selectedProduct.providerId || uid,
        }, { merge: true });
=======
        await setDoc(productRef, selectedProduct, { merge: true });
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        setEditModalOpen(false);
        alert("Producto actualizado exitosamente!");
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setError("Error al actualizar el producto");
    }
  };

<<<<<<< HEAD
=======
  // Handle product deletion
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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

<<<<<<< HEAD
=======
  // Handle account update
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleUpdateAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
<<<<<<< HEAD
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
=======
        await setDoc(userRef, {
          username,
          email: accountDetails.email,
          preferences: accountDetails.preferences,
          ...(accountDetails.password && { password: accountDetails.password })
        }, { merge: true });
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        alert("Configuración actualizada correctamente!");
      }
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      setError("Error al actualizar la configuración");
    }
  };

<<<<<<< HEAD
=======
  // Handle withdrawal request
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Ingrese un monto válido");
      return;
    }
<<<<<<< HEAD
    const availableBalance = calculateAvailableBalance();
=======

    const availableBalance = calculateAvailableBalance();
    
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    if (parseFloat(withdrawAmount) > availableBalance) {
      setError("No tienes suficientes fondos disponibles");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    if (!withdrawAccount) {
      setError("Ingrese los datos de su cuenta");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    try {
      await addDoc(collection(db, "withdrawals"), {
        provider: username,
        providerEmail: email,
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        account: withdrawAccount,
        status: "pending",
<<<<<<< HEAD
        createdAt: serverTimestamp(),
      });
=======
        createdAt: serverTimestamp()
      });

>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      setWithdrawAmount("");
      setWithdrawAccount("");
      alert("Solicitud de retiro enviada correctamente");
    } catch (error) {
      console.error("Error al solicitar retiro:", error);
      setError("Error al solicitar retiro");
    }
  };

<<<<<<< HEAD
=======
  // Handle withdrawal action (approve/reject)
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const handleWithdrawAction = async (withdrawalId, action) => {
    try {
      const withdrawalRef = doc(db, "withdrawals", withdrawalId);
      await updateDoc(withdrawalRef, {
        status: action,
        processedAt: serverTimestamp(),
<<<<<<< HEAD
        processedBy: email,
      });
      alert(action === "approved" ? "Retiro aprobado correctamente" : "Retiro rechazado");
=======
        processedBy: email
      });
      
      if (action === "approved") {
        alert("Retiro aprobado correctamente");
      } else {
        alert("Retiro rechazado");
      }
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    } catch (error) {
      console.error("Error al procesar retiro:", error);
      setError("Error al procesar retiro");
    }
  };

<<<<<<< HEAD
  const totalEarnings = orders.reduce((total, order) => total + (order.amount || 0), 0);
  const totalWithdrawn = withdrawals.reduce((total, withdrawal) => total + (withdrawal.status === "approved" ? withdrawal.amount : 0), 0);
  const calculateAvailableBalance = () => totalEarnings - totalWithdrawn;
  const availableBalance = calculateAvailableBalance();
  const totalStock = products.reduce((total, product) => total + (parseInt(product.stock) || 0), 0);

=======
  // Calculate total earnings - CORREGIDO: Asegura que el monto sea numérico
  const totalEarnings = orders.reduce((total, order) => {
    return total + (order.amount || 0);
  }, 0);

  // Calculate total withdrawn amount - CORREGIDO: Asegura que el monto sea numérico
  const totalWithdrawn = withdrawals.reduce((total, withdrawal) => {
    return total + (withdrawal.status === "approved" ? withdrawal.amount : 0);
  }, 0);

  // Calculate available balance
  const calculateAvailableBalance = () => {
    return totalEarnings - totalWithdrawn;
  };

  const availableBalance = calculateAvailableBalance();

  // Calculate total stock
  const totalStock = products.reduce((total, product) => {
    const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0;
    return total + stock;
  }, 0);

  // Render content based on active section
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
<<<<<<< HEAD
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
=======
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
        </div>
      );
    }

    if (error) {
      return (
<<<<<<< HEAD
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => setError("")}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
=======
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setError("")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
          >
            Aceptar
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
<<<<<<< HEAD
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
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Bienvenido, {username}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Productos */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <h3 className="text-base md:text-lg font-semibold text-indigo-700 mb-2 md:mb-3 flex items-center">
                  <FiBox className="mr-2" /> Inventario
                </h3>
                <div className="space-y-1 md:space-y-2 text-gray-600">
                  <p className="text-2xl md:text-3xl font-bold text-indigo-600">{products.length}</p>
                  <p className="text-sm md:text-base">Productos registrados</p>
                  <p className="text-xs md:text-sm">Stock total: {totalStock}</p>
                </div>
              </div>
              
              {/* Ganancias */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-base md:text-lg font-semibold text-green-700 mb-2 md:mb-3 flex items-center">
                  <FiDollarSign className="mr-2" /> Ganancias
                </h3>
                <div className="space-y-1 md:space-y-2 text-gray-600">
                  <p className="text-2xl md:text-3xl font-bold text-green-600">S/ {totalEarnings.toFixed(2)}</p>
                  <p className="text-sm md:text-base">Total acumulado</p>
                  <p className="text-xs md:text-sm">{orders.length} ventas realizadas</p>
                  <button 
                    onClick={() => setActiveSection("retiros")}
                    className="text-green-600 text-xs md:text-sm hover:underline"
                  >
                    Retirar fondos
                  </button>
                </div>
              </div>
              
              {/* Cuenta */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-base md:text-lg font-semibold text-blue-700 mb-2 md:mb-3 flex items-center">
                  <FiUser className="mr-2" /> Mi Cuenta
                </h3>
                <div className="space-y-1 md:space-y-2 text-gray-600">
                  <p className="text-base md:text-lg font-medium">{username}</p>
                  <p className="text-xs md:text-sm truncate">{email}</p>
                  <button 
                    onClick={() => setActiveSection("configuracion")}
                    className="text-blue-600 text-xs md:text-sm hover:underline"
                  >
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>
            
            {/* Últimos pedidos */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <FiShoppingCart className="mr-2" /> Pedidos recientes
              </h3>
              {orders.slice(0, 3).map((order, index) => (
                <div key={index} className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="w-2/3">
                      <p className="font-medium text-gray-800 truncate">{order.productName}</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        Comprador: {order.buyer || "Anónimo"}
                      </p>
                    </div>
                    <div className="text-right w-1/3">
                      <p className="font-medium text-gray-800">S/ {order.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-gray-500 py-2 text-center">No hay pedidos recientes</p>
              )}
              {orders.length > 3 && (
                <button 
                  onClick={() => setActiveSection("ganancias")}
                  className="w-full mt-3 text-center text-indigo-600 hover:underline text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          </div>
        );

      case "inventario":
        return (
<<<<<<< HEAD
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-white flex items-center">
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <FiBox className="mr-2" /> Inventario
              </h3>
              <button
                onClick={() => setActiveSection("subirProducto")}
<<<<<<< HEAD
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center w-full md:w-auto justify-center transition-colors"
=======
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center w-full md:w-auto justify-center"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
              >
                <FiPlus className="mr-2" /> Nuevo Producto
              </button>
            </div>
<<<<<<< HEAD
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
=======

            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                              </div>
                            )}
                            <div className="ml-4">
<<<<<<< HEAD
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
=======
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">S/ {product.price}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === "En stock" ? "bg-green-100 text-green-800" : 
                            product.status === "A pedido" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"
                          }`}>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
<<<<<<< HEAD
                            className="text-cyan-400 hover:text-cyan-500 mr-3"
=======
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
<<<<<<< HEAD
                            className="text-red-400 hover:text-red-500"
=======
                            className="text-red-600 hover:text-red-900"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
              <div className="text-center py-12">
                <FiBox className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-300">No tienes productos registrados</h4>
                <p className="text-gray-400">Agrega tu primer producto para comenzar</p>
                <button
                  onClick={() => setActiveSection("subirProducto")}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center mx-auto transition-colors"
=======
              <div className="text-center py-8 md:py-12">
                <FiBox className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-600">No tienes productos registrados</h4>
                <p className="text-gray-500 mb-4">Agrega tu primer producto para comenzar</p>
                <button
                  onClick={() => setActiveSection("subirProducto")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center mx-auto"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                >
                  <FiPlus className="mr-2" /> Agregar Producto
                </button>
              </div>
            )}
          </div>
        );

      case "subirProducto":
        return (
<<<<<<< HEAD
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
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
              <FiUpload className="mr-2" /> Subir Nuevo Producto
            </h3>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Imagen */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del producto</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {product.image ? (
                        <div className="relative">
                          <img src={product.image} alt="Preview" className="mx-auto h-48 w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setProduct({...product, image: ""})}
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
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
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
                </div>

                {/* Información básica */}
                <div className="col-span-1 space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
<<<<<<< HEAD
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      placeholder="Ej: Netflix Premium 1 mes"
                      required
                    />
                  </div>
<<<<<<< HEAD
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Categoría*</label>
=======

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      <select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
                    <div>
                      <label className="block text-gray-300 mb-2">Estado*</label>
=======

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      <select
                        name="status"
                        value={product.status}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      >
                        <option value="En stock">En stock</option>
                        <option value="A pedido">A pedido</option>
                      </select>
                    </div>
                  </div>
<<<<<<< HEAD
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Precio (S/)*</label>
=======

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
<<<<<<< HEAD
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        placeholder="Ej: 9.99"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
<<<<<<< HEAD
                    <div>
                      <label className="block text-gray-300 mb-2">Stock*</label>
=======

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleStockChange}
<<<<<<< HEAD
                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Duración (días)</label>
=======

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                  <input
                    type="number"
                    name="duration"
                    value={product.duration}
                    onChange={handleChange}
<<<<<<< HEAD
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                    placeholder="Dejar vacío para ilimitado"
                    min="1"
                  />
                </div>
<<<<<<< HEAD
                <div>
                  <label className="block text-gray-300 mb-2">Teléfono de contacto</label>
=======

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                  <input
                    type="text"
                    name="providerPhone"
                    value={product.providerPhone}
                    onChange={handleChange}
<<<<<<< HEAD
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                    placeholder="Ej: +51 987654321"
                  />
                </div>
              </div>
<<<<<<< HEAD
              <div>
                <label className="block text-gray-300 mb-2">Detalles del producto</label>
=======

              {/* Detalles y términos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalles del producto</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <textarea
                  name="details"
                  value={product.details}
                  onChange={handleChange}
                  rows="3"
<<<<<<< HEAD
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Describe los detalles y características del producto"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Términos y condiciones</label>
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe los detalles y características del producto"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Términos y condiciones</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <textarea
                  name="terms"
                  value={product.terms}
                  onChange={handleChange}
                  rows="3"
<<<<<<< HEAD
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
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Especifica los términos y condiciones de uso"
                ></textarea>
              </div>

              {/* Cuentas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuentas asociadas*</label>
                <p className="text-xs text-gray-500 mb-3">Debe completar todas las cuentas según el stock indicado</p>
                <div className="space-y-3 md:space-y-4">
                  {product.accounts.map((account, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 md:p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">Cuenta {index + 1}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          <input
                            type="email"
                            value={account.email}
                            onChange={(e) => handleAccountFieldChange(index, "email", e.target.value)}
<<<<<<< HEAD
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
=======
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            required
                          />
                        </div>
                        <div>
<<<<<<< HEAD
                          <label className="block text-xs font-medium text-gray-400 mb-1">Contraseña*</label>
=======
                          <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          <input
                            type="text"
                            value={account.password}
                            onChange={(e) => handleAccountFieldChange(index, "password", e.target.value)}
<<<<<<< HEAD
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
=======
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            required
                          />
                        </div>
                        <div>
<<<<<<< HEAD
                          <label className="block text-xs font-medium text-gray-400 mb-1">Perfil (opcional)</label>
=======
                          <label className="block text-xs font-medium text-gray-500 mb-1">Perfil (opcional)</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          <input
                            type="text"
                            value={account.profile}
                            onChange={(e) => handleAccountFieldChange(index, "profile", e.target.value)}
<<<<<<< HEAD
                            className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
=======
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            placeholder="Ej: Perfil 1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
<<<<<<< HEAD
=======

              {/* Submit button */}
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("inventario")}
<<<<<<< HEAD
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
=======
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                >
                  Cancelar
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
=======
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                >
                  Subir Producto
                </button>
              </div>
            </form>
          </div>
        );

      case "ganancias":
        return (
<<<<<<< HEAD
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
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
              <FiDollarSign className="mr-2" /> Ganancias
            </h3>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h4 className="text-base md:text-lg font-medium text-green-700 mb-1">Ganancias totales</h4>
                  <p className="text-xs md:text-sm text-green-600">{orders.length} ventas realizadas</p>
                  <p className="text-xs md:text-sm text-green-600">Retirado: S/ {totalWithdrawn.toFixed(2)}</p>
                  <p className="text-xs md:text-sm text-green-600">Disponible: S/ {availableBalance.toFixed(2)}</p>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-green-600 mt-2 md:mt-0">S/ {totalEarnings.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprador</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{order.productName}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{order.buyer || "Anónimo"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">S/ {order.amount.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "completed" ? "bg-green-100 text-green-800" : 
                          order.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status || "completed"}
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<<<<<<< HEAD
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
=======
            
            {orders.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-600">No hay ventas registradas</h4>
                <p className="text-gray-500">Tus ventas aparecerán aquí</p>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
              </div>
            )}
          </div>
        );

      case "retiros":
        return (
<<<<<<< HEAD
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
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            {isAdmin ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <FiCreditCard className="mr-2" /> Solicitudes de Retiro Pendientes
                </h3>
                
                {pendingWithdrawals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto (S/)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{withdrawal.provider}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{withdrawal.providerEmail}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{withdrawal.method}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">S/ {withdrawal.amount.toFixed(2)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(withdrawal.createdAt)}</td>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleWithdrawAction(withdrawal.id, "approved")}
<<<<<<< HEAD
                                  className="text-green-400 hover:text-green-500 flex items-center text-sm"
=======
                                  className="text-green-600 hover:text-green-900 flex items-center text-xs sm:text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                                >
                                  <FiCheck className="mr-1" /> Aprobar
                                </button>
                                <button
                                  onClick={() => handleWithdrawAction(withdrawal.id, "rejected")}
<<<<<<< HEAD
                                  className="text-red-400 hover:text-red-500 flex items-center text-sm"
=======
                                  className="text-red-600 hover:text-red-900 flex items-center text-xs sm:text-sm"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
                  <div className="text-center py-12">
                    <FiCreditCard className="mx-auto text-4xl text-gray-400 mb-3" />
                    <h4 className="text-lg font-medium text-gray-300">No hay solicitudes pendientes</h4>
                    <p className="text-gray-400">Las solicitudes de retiro aparecerán aquí</p>
=======
                  <div className="text-center py-8 md:py-12">
                    <FiCreditCard className="mx-auto text-4xl text-gray-400 mb-3" />
                    <h4 className="text-lg font-medium text-gray-600">No hay solicitudes pendientes</h4>
                    <p className="text-gray-500">Las solicitudes de retiro aparecerán aquí</p>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                  </div>
                )}
              </>
            ) : (
              <>
<<<<<<< HEAD
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
=======
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <FiCreditCard className="mr-2" /> Retirar Dinero
                </h3>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h4 className="text-base md:text-lg font-medium text-blue-700 mb-1">Saldo disponible</h4>
                      <p className="text-xs md:text-sm text-blue-600">Ganancias totales: S/ {totalEarnings.toFixed(2)}</p>
                      <p className="text-xs md:text-sm text-blue-600">Retirado: S/ {totalWithdrawn.toFixed(2)}</p>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 mt-2 md:mt-0">S/ {availableBalance.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-700 mb-3 md:mb-4">Solicitar Retiro</h4>
                    
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto a retirar (S/)*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
<<<<<<< HEAD
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          placeholder="Ej: 150.00"
                          step="0.01"
                          min="0"
                          max={availableBalance}
                        />
<<<<<<< HEAD
                        <p className="text-xs text-gray-400 mt-1">Máximo disponible: S/ {availableBalance.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Método de pago*</label>
                        <select
                          value={withdrawMethod}
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        <p className="text-xs text-gray-500 mt-1">Máximo disponible: S/ {availableBalance.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago*</label>
                        <select
                          value={withdrawMethod}
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        >
                          <option value="Yape">Yape</option>
                          <option value="Plin">Plin</option>
                          <option value="Transferencia">Transferencia Bancaria</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
<<<<<<< HEAD
                      <div>
                        <label className="block text-gray-300 mb-2">Datos de la cuenta*</label>
=======
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Datos de la cuenta*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        <input
                          type="text"
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
<<<<<<< HEAD
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          placeholder={withdrawMethod === "Yape" ? "Número de teléfono" : "Número de cuenta"}
                          required
                        />
                      </div>
<<<<<<< HEAD
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
=======
                      
                      <button
                        onClick={handleWithdrawRequest}
                        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableBalance || !withdrawAccount}
                        className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      >
                        Solicitar Retiro
                      </button>
                    </div>
                  </div>
<<<<<<< HEAD
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
=======
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-700 mb-3 md:mb-4">Historial de Retiros</h4>
                    
                    {withdrawals.length > 0 ? (
                      <div className="space-y-3 md:space-y-4">
                        {withdrawals.map((withdrawal, index) => (
                          <div key={index} className="border-b border-gray-100 py-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">S/ {withdrawal.amount.toFixed(2)}</p>
                                <p className="text-xs md:text-sm text-gray-500">{withdrawal.method} - {withdrawal.account}</p>
                                <p className="text-xs text-gray-500">
                                  {withdrawal.status === "pending" ? "Solicitado" : "Procesado"}: {formatDate(withdrawal.status === "pending" ? withdrawal.createdAt : withdrawal.processedAt)}
                                </p>
                              </div>
                              <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                withdrawal.status === "approved" ? "bg-green-100 text-green-800" : 
                                withdrawal.status === "rejected" ? "bg-red-100 text-red-800" : 
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {withdrawal.status === "approved" ? "Aprobado" : 
                                 withdrawal.status === "rejected" ? "Rechazado" : "Pendiente"}
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiCreditCard className="mx-auto text-3xl text-gray-400 mb-2" />
<<<<<<< HEAD
                        <p className="text-gray-400">No hay retiros registrados</p>
=======
                        <p className="text-gray-500">No hay retiros registrados</p>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
          <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiSettings className="mr-2" /> Configuración de cuenta
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAccount(); }} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre de usuario*</label>
=======
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
              <FiSettings className="mr-2" /> Configuración de cuenta
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAccount(); }} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
<<<<<<< HEAD
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Correo electrónico*</label>
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico*</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <input
                  type="email"
                  name="email"
                  value={accountDetails.email}
                  onChange={handleAccountChange}
<<<<<<< HEAD
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Nueva contraseña</label>
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <input
                  type="password"
                  name="password"
                  value={accountDetails.password}
                  onChange={handleAccountChange}
<<<<<<< HEAD
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Preferencias</label>
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferencias</label>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                <textarea
                  name="preferences"
                  value={accountDetails.preferences}
                  onChange={handleAccountChange}
                  rows="3"
<<<<<<< HEAD
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
=======
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tus preferencias y configuraciones"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Mobile header */}
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
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {username.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-gray-800 truncate px-2">{username}</p>
                <p className="text-xs md:text-sm text-gray-500 truncate px-2">{email}</p>
                <p className="text-xs mt-2 bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full inline-block">
                  {isAdmin ? "Administrador" : "Proveedor"}
                </p>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-2 md:p-4">
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("inicio");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "inicio" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiHome className="mr-3" /> Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("inventario");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "inventario" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiBox className="mr-3" /> Inventario
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("subirProducto");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "subirProducto" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiUpload className="mr-3" /> Subir Producto
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("ganancias");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "ganancias" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiDollarSign className="mr-3" /> Ganancias
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("retiros");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "retiros" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiCreditCard className="mr-3" /> Retiros
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveSection("configuracion");
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 md:py-3 rounded-lg flex items-center ${activeSection === "configuracion" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <FiSettings className="mr-3" /> Configuración
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="p-2 md:p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2"
              >
                <FiLogOut className="mr-2" /> Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64">
          {/* Mobile overlay */}
          {menuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            ></div>
          )}
          
          {renderContent()}
        </main>
      </div>

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Editar Producto</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                >
                  <FiX size={24} />
                </button>
              </div>
<<<<<<< HEAD
=======
              
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
              {selectedProduct && (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
                  <div className="space-y-4">
                    <div>
<<<<<<< HEAD
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
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                      <div className="flex items-center space-x-4">
                        {selectedProduct.image && (
                          <img src={selectedProduct.image} alt="Product" className="w-16 h-16 object-cover rounded" />
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
<<<<<<< HEAD
                                setSelectedProduct({ ...selectedProduct, image: reader.result });
=======
                                setSelectedProduct({...selectedProduct, image: reader.result});
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
<<<<<<< HEAD
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
=======
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                        <input
                          type="text"
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          required
                        />
                      </div>
                      <div>
<<<<<<< HEAD
                        <label className="block text-gray-300 mb-2">Categoría*</label>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría*</label>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Precio (S/)*</label>
                        <input
                          type="number"
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)*</label>
                        <input
                          type="number"
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
<<<<<<< HEAD
                        <label className="block text-gray-300 mb-2">Stock*</label>
                        <input
                          type="number"
                          value={selectedProduct.stock}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
                        <input
                          type="number"
                          value={selectedProduct.stock}
                          onChange={(e) => setSelectedProduct({...selectedProduct, stock: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                          min="1"
                          required
                        />
                      </div>
                      <div>
<<<<<<< HEAD
                        <label className="block text-gray-300 mb-2">Estado*</label>
                        <select
                          value={selectedProduct.status}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado*</label>
                        <select
                          value={selectedProduct.status}
                          onChange={(e) => setSelectedProduct({...selectedProduct, status: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                        >
                          <option value="En stock">En stock</option>
                          <option value="A pedido">A pedido</option>
                        </select>
                      </div>
                    </div>
<<<<<<< HEAD
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
=======

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                      <textarea
                        value={selectedProduct.details}
                        onChange={(e) => setSelectedProduct({...selectedProduct, details: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
<<<<<<< HEAD
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
=======
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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