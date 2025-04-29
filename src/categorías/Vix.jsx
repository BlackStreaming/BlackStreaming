import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMenu,
  FiShoppingCart,
  FiLoader,
  FiAlertCircle,
  FiInfo,
  FiFileText,
  FiUser,
  FiX,
  FiLogOut,
  FiFilm,
  FiMusic,
  FiTv,
  FiVideo,
  FiPlayCircle,
  FiBook,
  FiPenTool,
  FiMessageSquare,
  FiGlobe,
} from "react-icons/fi";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  runTransaction,
  getDocs,
  limit,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../images/logo.png";

const Vix = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [termsModal, setTermsModal] = useState(false);
  const [generalTermsModal, setGeneralTermsModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(null);
  const [productsCount, setProductsCount] = useState({
    netflix: 0,
    spotify: 0,
    disney: 0,
    max: 0,
    primevideo: 0,
    vix: 0,
    crunchyroll: 0,
    canva: 0,
    chatgpt: 0,
    redessociales: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const priceNumber = Number(price);
    return isNaN(priceNumber) ? "0.00" : priceNumber.toFixed(2);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: currentUser.uid,
              name: userData.username || "Usuario",
              email: currentUser.email,
              orders: userData.orders || [],
              role: userData.role || "user",
            });
            setBalance(Number(userData.balance) || 0);
          } else {
            setError("Usuario no encontrado en la base de datos");
            console.error("Usuario no encontrado en la base de datos");
          }
        } catch (err) {
          setError("Error al cargar datos del usuario");
          console.error(err);
        }
      } else {
        setUser(null);
        setBalance(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      where("category", "==", "Vix")
    );
    const productsUnsubscribe = onSnapshot(
      productsQuery,
      async (snapshot) => {
        const productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            price: Number(data.price) || 0,
            stock: Number(data.availableAccounts) || 0,
            accountDetails: data.details || "Detalles no disponibles",
            terms: data.terms || "Términos del proveedor",
            provider: data.provider || "Proveedor no especificado",
            providerId: data.providerId || "",
            providerPhone: data.providerPhone || "",
            acceptsOrders: data.status === "A pedido",
            duration: data.duration || "1 mes",
            type: data.type || "Premium",
            status: data.status || "En stock",
          };
        });

        const productsWithProviders = await Promise.all(
          productsData.map(async (product) => {
            if (
              !product.provider ||
              product.provider === "Proveedor no especificado"
            ) {
              try {
                if (product.providerId) {
                  const providerDoc = await getDoc(
                    doc(db, "users", product.providerId)
                  );
                  if (providerDoc.exists()) {
                    return {
                      ...product,
                      provider:
                        providerDoc.data().username ||
                        providerDoc.data().email ||
                        product.provider,
                      providerPhone:
                        providerDoc.data().phoneNumber || product.providerPhone,
                    };
                  }
                }
              } catch (err) {
                console.error("Error al cargar datos del proveedor:", err);
              }
            }
            return product;
          })
        );

        setProducts(productsWithProviders);
        setProductsCount((prev) => ({
          ...prev,
          vix: productsWithProviders.length,
        }));
      },
      (err) => {
        setError("Error al cargar productos de Vix");
        console.error(err);
      }
    );

    const accountsQuery = query(
      collection(db, "vix_accounts"),
      where("status", "==", "available")
    );
    const accountsUnsubscribe = onSnapshot(
      accountsQuery,
      (snapshot) => {
        const accountsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          productId: doc.data().productId || "",
          providerId: doc.data().providerId || "",
        }));
        setAccounts(accountsData);
      },
      (err) => {
        console.error("Error al cargar cuentas:", err);
      }
    );

    const categories = [
      "Netflix",
      "Spotify",
      "Disney",
      "Max",
      "Prime Video",
      "Crunchyroll",
      "Canva",
      "ChatGPT",
      "Redes Sociales",
    ];

    const unsubscribes = categories.map((category) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, "");
      const q = query(
        collection(db, "products"),
        where("category", "==", category)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          setProductsCount((prev) => ({
            ...prev,
            [categoryKey]: snapshot.docs.length,
          }));
        },
        (err) => {
          console.error(`Error al cargar productos de ${category}:`, err);
        }
      );
    });

    return () => {
      productsUnsubscribe();
      accountsUnsubscribe();
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const handlePurchase = (product) => {
    if (!user) {
      setNotificationModal({
        message: "Por favor, inicia sesión para realizar una compra.",
        onClose: () => navigate("/login"),
      });
      return;
    }

    if (balance < product.price) {
      setNotificationModal({
        message: "Saldo insuficiente para realizar esta compra.",
      });
      return;
    }

    if (!product.providerId || product.providerId === "") {
      setNotificationModal({
        message: "Este producto no tiene un proveedor asociado. Contacta al administrador.",
      });
      return;
    }

    setPurchaseModal({
      product,
      customerName: user.name,
      phoneNumber: "",
    });
  };

  const finalizePurchase = async () => {
    if (!document.getElementById("termsCheck").checked) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }
    if (!/^\d{9}$/.test(purchaseModal.phoneNumber)) {
      setError("El número de WhatsApp debe tener 9 dígitos");
      return;
    }

    try {
      setLoading(true);

      const selectedProduct = purchaseModal.product;

      if (!selectedProduct.providerId || selectedProduct.providerId === "") {
        throw new Error("El producto no tiene un proveedor asociado");
      }

      let accountData = null;
      if (selectedProduct.status === "En stock") {
        accountData = await runTransaction(db, async (transaction) => {
          const productRef = doc(db, "products", selectedProduct.id);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw new Error("Producto no encontrado");
          }
          const productData = productDoc.data();
          if (productData.availableAccounts <= 0) {
            throw new Error("No hay cuentas disponibles para este producto");
          }

          const accountsRef = collection(db, `products/${selectedProduct.id}/accounts`);
          const availableAccountsQuery = query(
            accountsRef,
            where("status", "==", "available"),
            limit(1)
          );
          const availableAccountsSnapshot = await getDocs(availableAccountsQuery);
          if (availableAccountsSnapshot.empty) {
            throw new Error("No hay cuentas disponibles en la subcolección");
          }
          const accountDoc = availableAccountsSnapshot.docs[0];
          const accountRef = accountDoc.ref;
          const accountData = accountDoc.data();

          const userRef = doc(db, "users", user.id);
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) {
            throw new Error("Usuario no encontrado");
          }

          let providerDoc = null;
          let providerPhone = selectedProduct.providerPhone || "";
          if (selectedProduct.providerId && !providerPhone) {
            const providerRef = doc(db, "users", selectedProduct.providerId);
            providerDoc = await transaction.get(providerRef);
            if (providerDoc.exists()) {
              providerPhone = providerDoc.data().phoneNumber || "";
            }
          }

          transaction.update(accountRef, {
            status: "unavailable",
            assignedTo: user.id,
            assignedAt: new Date().toISOString(),
          });

          transaction.update(productRef, {
            availableAccounts: increment(-1),
            stock: increment(-1),
          });

          const userBalance = Number(userDoc.data().balance) || 0;
          const newBalance = userBalance - selectedProduct.price;
          if (newBalance < 0) {
            throw new Error("Saldo insuficiente");
          }
          const userOrders = userDoc.data().orders || [];
          const orderData = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            price: selectedProduct.price,
            provider: selectedProduct.provider,
            providerId: selectedProduct.providerId,
            providerPhone: providerPhone,
            status: "active",
            customerName: purchaseModal.customerName,
            customerId: user.id,
            phoneNumber: purchaseModal.phoneNumber,
            createdAt: new Date().toISOString(),
            accountDetails: {
              email: accountData.email || "No proporcionado",
              password: accountData.password || "No proporcionado",
              profile: accountData.profile || "No proporcionado",
            },
            terms: selectedProduct.terms,
            type: "vix",
          };
          transaction.update(userRef, {
            balance: newBalance,
            orders: [...userOrders, orderData],
          });

          const salesRef = doc(collection(db, "sales"));
          transaction.set(salesRef, {
            ...orderData,
            provider: selectedProduct.provider,
            providerId: selectedProduct.providerId,
            providerPhone: providerPhone,
            saleDate: new Date().toISOString(),
            status: "completed",
            accountDetails: {
              email: accountData.email || "No proporcionado",
              password: accountData.password || "No proporcionado",
              profile: accountData.profile || "No proporcionado",
            },
          });

          if (providerDoc && providerDoc.exists()) {
            const providerSales = providerDoc.data().sales || [];
            const saleData = {
              saleId: salesRef.id,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              price: selectedProduct.price,
              customerId: user.id,
              customerName: purchaseModal.customerName,
              customerPhone: purchaseModal.phoneNumber,
              accountDetails: {
                email: accountData.email || "No proporcionado",
                password: accountData.password || "No proporcionado",
                profile: accountData.profile || "No proporcionado",
              },
              saleDate: new Date().toISOString(),
              status: "completed",
            };
            transaction.update(doc(db, "users", selectedProduct.providerId), {
              sales: [...providerSales, saleData],
            });
          }

          return accountData;
        });
      } else {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, "users", user.id);
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) {
            throw new Error("Usuario no encontrado");
          }

          let providerDoc = null;
          let providerPhone = selectedProduct.providerPhone || "";
          if (selectedProduct.providerId && !providerPhone) {
            const providerRef = doc(db, "users", selectedProduct.providerId);
            providerDoc = await transaction.get(providerRef);
            if (providerDoc.exists()) {
              providerPhone = providerDoc.data().phoneNumber || "";
            }
          }

          const userBalance = Number(userDoc.data().balance) || 0;
          const newBalance = userBalance - selectedProduct.price;
          if (newBalance < 0) {
            throw new Error("Saldo insuficiente");
          }
          const userOrders = userDoc.data().orders || [];
          const orderData = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            price: selectedProduct.price,
            provider: selectedProduct.provider,
            providerId: selectedProduct.providerId,
            providerPhone: providerPhone,
            status: "pending",
            customerName: purchaseModal.customerName,
            customerId: user.id,
            phoneNumber: purchaseModal.phoneNumber,
            createdAt: new Date().toISOString(),
            accountDetails: null,
            terms: selectedProduct.terms,
            type: "vix",
          };
          transaction.update(userRef, {
            balance: newBalance,
            orders: [...userOrders, orderData],
          });

          const salesRef = doc(collection(db, "sales"));
          transaction.set(salesRef, {
            ...orderData,
            provider: selectedProduct.provider,
            providerId: selectedProduct.providerId,
            providerPhone: providerPhone,
            saleDate: new Date().toISOString(),
            status: "pending",
          });

          if (providerDoc && providerDoc.exists()) {
            const providerSales = providerDoc.data().sales || [];
            const saleData = {
              saleId: salesRef.id,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              price: selectedProduct.price,
              customerId: user.id,
              customerName: purchaseModal.customerName,
              customerPhone: purchaseModal.phoneNumber,
              accountDetails: null,
              saleDate: new Date().toISOString(),
              status: "pending",
            };
            transaction.update(doc(db, "users", selectedProduct.providerId), {
              sales: [...providerSales, saleData],
            });
          }
        });
      }

      setBalance((prev) => prev - selectedProduct.price);
      setUser((prev) => ({
        ...prev,
        orders: [
          ...prev.orders,
          {
            ...purchaseModal,
            status: selectedProduct.status === "En stock" ? "active" : "pending",
            createdAt: new Date().toISOString(),
            accountDetails:
              selectedProduct.status === "En stock"
                ? {
                    email: accountData?.email || "No proporcionado",
                    password: accountData?.password || "No proporcionado",
                    profile: accountData?.profile || "No proporcionado",
                  }
                : null,
          },
        ],
      }));

      setPurchaseModal(null);
      setNotificationModal({
        message:
          selectedProduct.status === "En stock"
            ? "¡Compra realizada con éxito! El proveedor se contactará contigo con los detalles de acceso."
            : "¡Pedido realizado con éxito! El proveedor se contactará contigo para coordinar los detalles.",
      });
    } catch (err) {
      setError(err.message || "Error al procesar la compra");
      console.error("Error en la compra:", err);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (product) => {
    setDetailModal({
      name: product.name,
      accountDetails: product.accountDetails,
      provider: product.provider,
      terms: product.terms,
    });
  };

  const showTerms = (product) => {
    setDetailModal({
      name: product.name,
      terms: product.terms,
      provider: product.provider,
    });
    setTermsModal(true);
  };

  const goToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user?.role === "user") navigate("/dashboard/user");
    else if (user?.role === "affiliate") navigate("/dashboard/affiliate");
    else if (user?.role === "provider") navigate("/dashboard/provider");
    else if (user?.role === "admin") navigate("/dashboard/admin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=Vix`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductStatus = (product) => {
    if (product.status === "A pedido") {
      return (
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
          A pedido
        </span>
      );
    }
    if (product.stock > 0) {
      return (
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
          Disponibles: {product.stock}
        </span>
      );
    }
    return (
      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/50">
        Agotado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200">
        <FiLoader className="animate-spin text-5xl text-cyan-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 p-4">
        <FiAlertCircle className="text-5xl text-red-400 mb-4" />
        <p className="text-xl font-semibold text-white mb-2">Error</p>
        <p className="text-gray-300 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all shadow-lg"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200 flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all md:hidden"
            >
              <FiMenu size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-10 w-auto" />
              <span className="text-xl font-semibold text-cyan-400 hidden sm:block">
                BlackStreaming
              </span>
            </Link>
          </div>

          <div className="flex items-center relative w-full sm:w-auto sm:max-w-xs md:max-w-md mt-3 sm:mt-0 order-3 sm:order-2 sm:mx-3">
            <input
              type="text"
              placeholder="Buscar en Vix..."
              className="w-full px-4 py-2 rounded-full bg-gray-800/50 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 text-gray-400 hover:text-cyan-400 transition-all"
            >
              <FiSearch size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2 order-2 sm:order-3">
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-sm font-medium text-gray-300 hidden sm:flex items-center">
                  <FiUser className="mr-2 text-cyan-400" /> {user.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-200 bg-gray-800/50 px-3 py-1 rounded-full">
                    S/ {balance.toFixed(2)}
                  </span>
                  <button
                    onClick={goToDashboard}
                    className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                    title="Dashboard"
                  >
                    <FiUser className="text-cyan-400" size={20} />
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      navigate("/");
                    }}
                    className="flex items-center space-x-1 px-3 py-2 rounded-full bg-red-600/80 hover:bg-red-700 transition-all text-sm text-white"
                  >
                    <FiLogOut size={18} />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm text-gray-200 hover:text-cyan-400 transition-all"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-all text-sm"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <aside
          className={`fixed inset-y-0 left-0 w-56 sm:w-64 bg-gray-900/90 backdrop-blur-sm text-white shadow-2xl transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 md:static md:z-40 md:translate-x-0 border-r border-gray-800/50`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 md:hidden">
              <span className="text-xl font-semibold text-cyan-400">
                BlackStreaming
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all"
              >
                <FiX size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                to="/netflix"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiFilm className="text-cyan-400" />
                  <span>Netflix</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.netflix}
                </span>
              </Link>
              <Link
                to="/spotify"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiMusic className="text-green-400" />
                  <span>Spotify</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.spotify}
                </span>
              </Link>
              <Link
                to="/disney"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiTv className="text-blue-400" />
                  <span>Disney+</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.disney}
                </span>
              </Link>
              <Link
                to="/max"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiVideo className="text-purple-400" />
                  <span>Max</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.max}
                </span>
              </Link>
              <Link
                to="/primevideo"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiPlayCircle className="text-blue-500" />
                  <span>Prime Video</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.primevideo}
                </span>
              </Link>
              <Link
                to="/vix"
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-600/30 text-white border border-cyan-500/30"
              >
                <div className="flex items-center space-x-2">
                  <FiTv className="text-red-400" />
                  <span>Vix</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.vix}
                </span>
              </Link>
              <Link
                to="/crunchyroll"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiBook className="text-orange-400" />
                  <span>Crunchyroll</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.crunchyroll}
                </span>
              </Link>
              <Link
                to="/canva"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiPenTool className="text-teal-400" />
                  <span>Canva</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.canva}
                </span>
              </Link>
              <Link
                to="/chatgpt"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiMessageSquare className="text-gray-400" />
                  <span>ChatGPT</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.chatgpt}
                </span>
              </Link>
              <Link
                to="/redessociales"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FiGlobe className="text-pink-400" />
                  <span>Redes Sociales</span>
                </div>
                <span className="bg-gray-800/50 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.redessociales}
                </span>
              </Link>
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/30 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">
                      Saldo: S/ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 md:pt-4 md:ml-64 min-h-screen`}
        >
          <section
            className="relative h-48 sm:h-56 md:h-64 bg-cover bg-center flex items-center justify-center overflow-hidden rounded-2xl shadow-lg mb-8"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-blue-900/50"></div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                Cuentas Premium de Vix
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                Disfruta de tus novelas y series favoritas con nuestros planes
              </p>
            </div>
          </section>

          <section className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Planes Disponibles
              </h2>
              <button
                onClick={() => setGeneralTermsModal(true)}
                className="text-sm sm:text-base text-cyan-400 hover:text-cyan-300 transition-all underline underline-offset-4"
              >
                Términos Generales
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-300 text-lg sm:text-xl">
                  No se encontraron productos que coincidan con tu búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 min-w-[250px] border border-gray-700/50"
                  >
                    <div className="relative h-52 sm:h-56 overflow-hidden">
                      <img
                        src={product.image || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      {renderProductStatus(product)}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg sm:text-xl text-white mb-3">
                        {product.name}
                      </h3>
                      <div className="text-sm text-gray-300 space-y-2 mb-4">
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">
                            Proveedor:
                          </span>
                          <span className="ml-2 text-gray-200">
                            {product.provider}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">
                            Duración:
                          </span>
                          <span className="ml-2 text-gray-200">
                            {product.duration || "1 mes"}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">Tipo:</span>
                          <span className="ml-2 text-gray-200">
                            {product.type || "Premium"}
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-xl sm:text-2xl">
                          S/ {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                        <button
                          onClick={() => showDetails(product)}
                          className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-xl text-sm flex items-center justify-center transition-all border border-gray-600/50"
                        >
                          <FiInfo className="mr-2" /> Detalles
                        </button>
                        <button
                          onClick={() => showTerms(product)}
                          className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-xl text-sm flex items-center justify-center transition-all border border-gray-600/50"
                        >
                          <FiFileText className="mr-2" /> Términos
                        </button>
                      </div>
                      <button
                        onClick={() => handlePurchase(product)}
                        disabled={
                          product.status === "En stock" && product.stock <= 0
                        }
                        className={`w-full py-3 rounded-xl flex items-center justify-center transition-all ${
                          product.status === "A pedido" || product.stock > 0
                            ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                            : "bg-red-600/50 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <FiShoppingCart className="mr-2" />
                        {product.status === "A pedido"
                          ? "Pedir"
                          : product.stock > 0
                          ? "Comprar"
                          : "Agotado"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
      </div>

      {purchaseModal && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  {purchaseModal.product.status === "A pedido"
                    ? "Confirmar Pedido"
                    : "Confirmar Compra"}
                </h2>
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50">
                <h3 className="font-semibold text-lg text-white">
                  {purchaseModal.product.name}
                </h3>
                <p className="text-white font-bold text-xl sm:text-2xl mt-1">
                  S/ {formatPrice(purchaseModal.product.price)}
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  Proveedor: {purchaseModal.product.provider}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Estado: {purchaseModal.product.status}
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={purchaseModal.customerName}
                    onChange={(e) =>
                      setPurchaseModal((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número de WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={purchaseModal.phoneNumber}
                    onChange={(e) =>
                      setPurchaseModal((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white transition-all"
                    placeholder="Ej. 999888777"
                    required
                  />
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    className="mt-1 mr-3 bg-gray-700 border-gray-600 text-cyan-400 focus:ring-cyan-400 rounded"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-sm text-gray-300">
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModal(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-all underline underline-offset-4"
                    >
                      Términos
                    </button>{" "}
                    y{" "}
                    <button
                      type="button"
                      onClick={() => setGeneralTermsModal(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-all underline underline-offset-4"
                    >
                      Condiciones Generales
                    </button>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="px-4 py-2 border border-gray-600/50 rounded-xl text-gray-300 hover:bg-gray-700/50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizePurchase}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 disabled:bg-gray-700/50 disabled:text-gray-400 flex items-center transition-all"
                >
                  {loading && <FiLoader className="animate-spin mr-2" />}
                  <span>
                    {purchaseModal.product.status === "A pedido"
                      ? "Confirmar Pedido"
                      : "Confirmar Compra"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Notificación
                </h2>
                <button
                  onClick={() => {
                    if (notificationModal.onClose) {
                      notificationModal.onClose();
                    }
                    setNotificationModal(null);
                  }}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-300 text-center mb-6">
                {notificationModal.message}
              </p>
              <button
                onClick={() => {
                  if (notificationModal.onClose) {
                    notificationModal.onClose();
                  }
                  setNotificationModal(null);
                }}
                className="w-full py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal && !termsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  {detailModal.name}
                </h2>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-5">
                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                  <h3 className="font-medium text-white mb-2">Proveedor:</h3>
                  <p className="text-gray-300">{detailModal.provider}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                  <h3 className="font-medium text-white mb-2">
                    Detalles de la cuenta:
                  </h3>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {detailModal.accountDetails}
                    </pre>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailModal(null);
                  setTermsModal(true);
                }}
                className="w-full mt-6 py-2 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600/50 transition-all border border-gray-600/50"
              >
                Ver Términos Específicos
              </button>
            </div>
          </div>
        </div>
      )}

      {termsModal && detailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Términos - {detailModal.name}
                </h2>
                <button
                  onClick={() => setTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="text-gray-300">
                <div className="bg-gray-700/50 p-4 rounded-xl mb-4 border border-gray-600/50">
                  <h3 className="font-semibold text-white mb-2">
                    Proveedor: {detailModal.provider}
                  </h3>
                </div>
                <h3 className="font-semibold text-white mb-2">
                  Términos específicos:
                </h3>
                <div className="bg-gray-700/50 p-4 rounded-xl mb-4 border border-gray-600/50">
                  <pre className="whitespace-pre-wrap text-gray-300">
                    {detailModal.terms}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    setTermsModal(false);
                    setGeneralTermsModal(true);
                  }}
                  className="w-full py-2 bg-gray-700/50 text-white rounded-xl hover:bg-gray-600/50 mb-4 transition-all border border-gray-600/50"
                >
                  Ver Términos Generales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {generalTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700/50 animate-fadeIn">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Términos y Condiciones Generales
                </h2>
                <button
                  onClick={() => setGeneralTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="text-gray-300">
                <div className="space-y-5">
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">
                      1. Proceso de Compra
                    </h3>
                    <p>
                      Al realizar una compra, el proveedor se contactará contigo
                      dentro de las próximas 24 horas hábiles para entregarte los
                      accesos a tu cuenta.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">2. Garantía</h3>
                    <p>
                      Todos los productos tienen una garantía de 7 días. Si tienes
                      problemas con tu cuenta durante este periodo, el proveedor
                      está obligado a resolverlos o reembolsarte.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">
                      3. Uso Responsable
                    </h3>
                    <p>
                      El cliente es responsable del uso que dé a la cuenta
                      adquirida. No nos hacemos responsables por suspensiones o
                      baneos por mal uso.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">4. Soporte</h3>
                    <p>
                      El soporte se realizará directamente con el proveedor
                      mediante el número de WhatsApp proporcionado.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 sm:p-5 rounded-xl border border-gray-600/50">
                    <h3 className="font-semibold text-white mb-2">5. Renovaciones</h3>
                    <p>
                      Las renovaciones son manuales y deben solicitarse al
                      proveedor antes de que finalice el período contratado.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-800/50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
              <span className="text-sm font-semibold text-cyan-400">
                BlackStreaming
              </span>
            </div>
            <div className="text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos
              reservados.
            </div>
            <div className="text-sm text-gray-400 text-center">
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Vix;
