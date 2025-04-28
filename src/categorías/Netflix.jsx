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

const Netflix = () => {
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
    // Fetch Netflix products
    const productsQuery = query(
      collection(db, "products"),
      where("category", "==", "Netflix")
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
            status: data.status || "En stock", // Ensure status is included
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
          netflix: productsWithProviders.length,
        }));
      },
      (err) => {
        setError("Error al cargar productos de Netflix");
        console.error(err);
      }
    );

    // Fetch accounts for Netflix products
    const accountsQuery = query(
      collection(db, "netflix_accounts"),
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

    // Fetch product counts for other categories
    const categories = [
      "Spotify",
      "Disney",
      "Max",
      "Prime Video",
      "Vix",
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
      alert("Por favor, inicia sesión para realizar una compra.");
      navigate("/login");
      return;
    }

    if (balance < product.price) {
      alert("Saldo insuficiente para realizar esta compra");
      return;
    }

    if (!product.providerId || product.providerId === "") {
      alert("Este producto no tiene un proveedor asociado. Contacta al administrador.");
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
        // Handle "En stock" products
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
            type: "netflix",
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
        // Handle "A pedido" products
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
            status: "pending", // A pedido orders start as pending
            customerName: purchaseModal.customerName,
            customerId: user.id,
            phoneNumber: purchaseModal.phoneNumber,
            createdAt: new Date().toISOString(),
            accountDetails: null, // No account details yet for "A pedido"
            terms: selectedProduct.terms,
            type: "netflix",
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
            status: "pending", // A pedido sales are pending until fulfilled
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
      alert(
        selectedProduct.status === "En stock"
          ? "¡Compra realizada con éxito! El proveedor se contactará contigo con los detalles de acceso."
          : "¡Pedido realizado con éxito! El proveedor se contactará contigo para coordinar los detalles."
      );
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
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=Netflix`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductStatus = (product) => {
    if (product.status === "A pedido") {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-900 text-yellow-400">
          A pedido
        </span>
      );
    }
    if (product.stock > 0) {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400">
          Disponibles: {product.stock}
        </span>
      );
    }
    return (
      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-red-900 text-red-400">
        Agotado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
        <FiLoader className="animate-spin text-4xl text-cyan-500 mb-4" />
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <FiAlertCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-white mb-2">Error</p>
        <p className="text-gray-400 mb-6 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:bg-gray-700 p-2 rounded-lg transition-colors md:hidden"
            >
              <FiMenu size={20} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
              <span className="text-xl font-bold text-cyan-400">
                BlackStreaming
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center relative w-1/3">
            <input
              type="text"
              placeholder="Buscar en Netflix..."
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              <FiSearch />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-300 flex items-center">
                  <FiUser className="mr-2 text-cyan-400" /> {user.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-300">
                    S/ {balance.toFixed(2)}
                  </span>
                  <button
                    onClick={goToDashboard}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    title="Dashboard"
                  >
                    <FiUser className="text-white" />
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      navigate("/");
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 transition-colors text-sm text-white"
                  >
                    <FiLogOut /> <span>Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en Netflix..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
              >
                <FiSearch />
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white shadow-lg transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-40 md:translate-x-0 md:static border-r border-gray-700`}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                to="/netflix"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-cyan-900 text-white"
              >
                <span>Netflix</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.netflix}
                </span>
              </Link>
              <Link
                to="/spotify"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Spotify</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.spotify}
                </span>
              </Link>
              <Link
                to="/disney"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Disney+</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.disney}
                </span>
              </Link>
              <Link
                to="/max"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Max</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.max}
                </span>
              </Link>
              <Link
                to="/primevideo"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Prime Video</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.primevideo}
                </span>
              </Link>
              <Link
                to="/vix"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Vix</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.vix}
                </span>
              </Link>
              <Link
                to="/crunchyroll"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Crunchyroll</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.crunchyroll}
                </span>
              </Link>
              <Link
                to="/canva"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Canva</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.canva}
                </span>
              </Link>
              <Link
                to="/chatgpt"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>ChatGPT</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.chatgpt}
                </span>
              </Link>
              <Link
                to="/redessociales"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Redes Sociales</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount.redessociales}
                </span>
              </Link>
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">
                      Saldo: S/ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main
          className={`flex-1 transition-all duration-300 ${
            menuOpen ? "ml-64" : "ml-0"
          } md:ml-64 p-4 pt-20 md:pt-4`}
        >
          <section className="relative h-64 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden rounded-lg shadow-md mb-6">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Cuentas Premium de Netflix
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Disfruta de los mejores planes de Netflix a precios increíbles
              </p>
            </div>
          </section>

          <section className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Planes Disponibles</h2>
              <button
                onClick={() => setGeneralTermsModal(true)}
                className="text-sm text-cyan-400 hover:underline"
              >
                Términos Generales
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No se encontraron productos que coincidan con tu búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {renderProductStatus(product)}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-white">
                        {product.name}
                      </h3>
                      <div className="text-sm text-gray-300 space-y-1 mb-3">
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">
                            Proveedor:
                          </span>
                          <span className="ml-1 text-white">
                            {product.provider}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">
                            Duración:
                          </span>
                          <span className="ml-1 text-white">
                            {product.duration || "1 mes"}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium text-gray-400">Tipo:</span>
                          <span className="ml-1 text-white">
                            {product.type || "Premium"}
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-xl">
                          S/ {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="flex space-x-2 mb-3">
                        <button
                          onClick={() => showDetails(product)}
                          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center transition-colors"
                        >
                          <FiInfo className="mr-1" /> Detalles
                        </button>
                        <button
                          onClick={() => showTerms(product)}
                          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center transition-colors"
                        >
                          <FiFileText className="mr-1" /> Términos
                        </button>
                      </div>
                      <button
                        onClick={() => handlePurchase(product)}
                        disabled={
                          product.status === "En stock" &&
                          product.stock <= 0
                        }
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                          product.status === "A pedido" || product.stock > 0
                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                            : "bg-red-900 text-white cursor-not-allowed"
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
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
      </div>

      {purchaseModal && user && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {purchaseModal.product.status === "A pedido"
                    ? "Confirmar Pedido"
                    : "Confirmar Compra"}
                </h2>
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="font-bold text-white">
                  {purchaseModal.product.name}
                </h3>
                <p className="text-white font-bold text-xl">
                  S/ {formatPrice(purchaseModal.product.price)}
                </p>
                <p className="text-sm text-gray-400">
                  Proveedor: {purchaseModal.product.provider}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Estado: {purchaseModal.product.status}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                    placeholder="Ej. 999888777"
                    required
                  />
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    className="mt-1 mr-2 bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-sm text-gray-400">
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModal(true)}
                      className="text-cyan-400 hover:underline"
                    >
                      Términos
                    </button>{" "}
                    y{" "}
                    <button
                      type="button"
                      onClick={() => setGeneralTermsModal(true)}
                      className="text-cyan-400 hover:underline"
                    >
                      Condiciones Generales
                    </button>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizePurchase}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-400 flex items-center transition-colors"
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

      {detailModal && !termsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">
                  {detailModal.name}
                </h2>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <h3 className="font-medium text-white mb-2">Proveedor:</h3>
                  <p className="text-gray-300">{detailModal.provider}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <h3 className="font-medium text-white mb-2">
                    Detalles de la cuenta:
                  </h3>
                  <div className="p-2 bg-gray-800 rounded-md">
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
                className="w-full mt-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
              >
                Ver Términos Específicos
              </button>
            </div>
          </div>
        </div>
      )}

      {termsModal && detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">
                  Términos - {detailModal.name}
                </h2>
                <button
                  onClick={() => setTermsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
              <div className="text-gray-300">
                <div className="bg-gray-700 p-3 rounded-lg mb-4 border border-gray-600">
                  <h3 className="font-bold text-white mb-2">
                    Proveedor: {detailModal.provider}
                  </h3>
                </div>
                <h3 className="font-bold text-white mb-2">
                  Términos específicos:
                </h3>
                <div className="bg-gray-700 p-3 rounded-lg mb-4 border border-gray-600">
                  <pre className="whitespace-pre-wrap text-gray-300">
                    {detailModal.terms}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    setTermsModal(false);
                    setGeneralTermsModal(true);
                  }}
                  className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 mb-4 transition-colors border border-gray-600"
                >
                  Ver Términos Generales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {generalTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">
                  Términos y Condiciones Generales
                </h2>
                <button
                  onClick={() => setGeneralTermsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX />
                </button>
              </div>
              <div className="text-gray-300">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-white mb-2">
                      1. Proceso de Compra
                    </h3>
                    <p>
                      Al realizar una compra, el proveedor se contactará contigo
                      dentro de las próximas 24 horas hábiles para entregarte los
                      accesos a tu cuenta.
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-white mb-2">2. Garantía</h3>
                    <p>
                      Todos los productos tienen una garantía de 7 días. Si tienes
                      problemas con tu cuenta durante este periodo, el proveedor
                      está obligado a resolverlos o reembolsarte.
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-white mb-2">
                      3. Uso Responsable
                    </h3>
                    <p>
                      El cliente es responsable del uso que dé a la cuenta
                      adquirida. No nos hacemos responsables por suspensiones o
                      baneos por mal uso.
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-white mb-2">4. Soporte</h3>
                    <p>
                      El soporte se realizará directamente con el proveedor
                      mediante el número de WhatsApp proporcionado.
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="font-bold text-white mb-2">5. Renovaciones</h3>
                    <p>
                      Las renovaciones son manuales y deben solicitarse al
                      proveedor antes de que finalice el período contratado.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src={logo} alt="BlackStreaming" className="h-6 w-auto" />
              <span className="text-sm font-medium text-white">
                BlackStreaming
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos
              reservados.
            </div>
            <div className="text-sm text-gray-400">Desarrollado por Saiph</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Netflix;
