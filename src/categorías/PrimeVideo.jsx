import React, { useState, useEffect } from "react";
<<<<<<< HEAD
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

const PrimeVideo = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [termsModal, setTermsModal] = useState(false);
  const [generalTermsModal, setGeneralTermsModal] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
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
          console.error("Error al cargar datos del usuario:", err);
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
      where("category", "==", "Prime Video")
    );
    const productsUnsubscribe = onSnapshot(
      productsQuery,
      async (snapshot) => {
        try {
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
              acceptsOrders: data.acceptsOrders !== false,
              duration: data.duration || "1 mes",
              type: data.type || "Premium",
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
          setProductsCount(productsWithProviders.length);
        } catch (err) {
          setError("Error al cargar productos");
          console.error("Error al cargar productos:", err);
        }
      },
      (err) => {
        setError("Error al cargar productos");
        console.error("Error en onSnapshot:", err);
      }
    );

    return () => productsUnsubscribe();
  }, []);

  const handlePurchase = (product) => {
    if (!user) {
      alert("Por favor, inicia sesión para realizar una compra.");
      navigate("/login");
=======
import { Link } from "react-router-dom";
import { FiMenu, FiFileText, FiInfo, FiClipboard, FiShoppingCart } from "react-icons/fi";
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Firebase configuración
import logo from "../images/logo.png";

const categories = [
  { name: "Netflix" },
  { name: "Spotify" },
  { name: "Disney" },
  { name: "Max" },
  { name: "PrimeVideo" },
  { name: "Vix" },
];

const PrimeVideo = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [user, setUser] = useState(null); // Estado para el usuario autenticado
  const [balance, setBalance] = useState(0); // Estado para el balance del usuario
  const [role, setRole] = useState("user"); // Estado para el rol del usuario
  const currentCategory = "Prime Video";

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const loadUser = async () => {
      if (auth.currentUser) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", auth.currentUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setUser({
              name: userDoc.username || "Usuario",
              email: auth.currentUser.email,
            });
            setBalance(userDoc.balance || 0);
            setRole(userDoc.role || "user");
          }
        } catch (error) {
          console.error("Error al cargar los datos del usuario:", error);
        }
      }
    };

    loadUser();
  }, []);

  // Obtener productos de la categoría actual
  useEffect(() => {
    const q = query(collection(db, "products"), where("category", "==", currentCategory));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const primeVideoProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(primeVideoProducts);
    });

    return () => unsubscribe();
  }, [currentCategory]);

  // Obtener el conteo de productos por categoría
  useEffect(() => {
    const counts = {};
    categories.forEach((category) => {
      const q = query(collection(db, "products"), where("category", "==", category.name));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        counts[category.name] = snapshot.size;
        setCategoryCounts({ ...counts }); // Actualizar el estado con los conteos
      });

      return () => unsubscribe();
    });
  }, []);

  const closeModal = () => setModalContent(null);

  const handlePurchase = async (product) => {
    if (!auth.currentUser) {
      alert("Por favor, inicia sesión para realizar una compra.");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      return;
    }

    if (balance < product.price) {
<<<<<<< HEAD
      alert("Saldo insuficiente para realizar esta compra");
      return;
    }

    if (!product.providerId || product.providerId === "") {
      alert(
        "Este producto no tiene un proveedor asociado. Contacta al administrador."
      );
      return;
    }

    setPurchaseModal({
      product,
      customerName: user.name,
      phoneNumber: "",
    });
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

  const finalizePurchase = async () => {
    const termsCheck = document.getElementById("termsCheck");
    if (!termsCheck?.checked) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }
    if (!/^\d{9}$/.test(purchaseModal.phoneNumber)) {
      setError("El número de WhatsApp debe tener 9 dígitos");
=======
      alert("Saldo insuficiente para realizar esta compra.");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      return;
    }

    try {
<<<<<<< HEAD
      setLoading(true);

      const selectedProduct = purchaseModal.product;

      if (!selectedProduct.providerId || selectedProduct.providerId === "") {
        throw new Error("El producto no tiene un proveedor asociado");
      }

      const accountData = await runTransaction(db, async (transaction) => {
        const productRef = doc(db, "products", selectedProduct.id);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw new Error("Producto no encontrado");
        }
        const productData = productDoc.data();
        if (productData.availableAccounts <= 0) {
          throw new Error("No hay cuentas disponibles para este producto");
        }

        const accountsRef = collection(
          db,
          `products/${selectedProduct.id}/accounts`
        );
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
          type: "primevideo",
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

      setBalance((prev) => prev - selectedProduct.price);
      setUser((prev) => ({
        ...prev,
        orders: [
          ...prev.orders,
          {
            ...purchaseModal,
            status: "active",
            createdAt: new Date().toISOString(),
            accountDetails: {
              email: accountData.email || "No proporcionado",
              password: accountData.password || "No proporcionado",
              profile: accountData.profile || "No proporcionado",
            },
          },
        ],
      }));

      setPurchaseModal(null);
      alert(
        "¡Compra realizada con éxito! El proveedor se contactará contigo con los detalles de acceso."
      );
    } catch (err) {
      setError(err.message || "Error al procesar la compra");
      console.error("Error en la compra:", err);
    } finally {
      setLoading(false);
    }
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
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=Prime Video`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductStatus = (product) => {
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
              placeholder="Buscar en Prime Video..."
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
                placeholder="Buscar en Prime Video..."
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
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Netflix</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/spotify"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Spotify</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/disney"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Disney+</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/max"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Max</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/primevideo"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-cyan-900 text-white"
              >
                <span>Prime Video</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount}
                </span>
              </Link>
              <Link
                to="/vix"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Vix</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/crunchyroll"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Crunchyroll</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/canva"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Canva</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/chatgpt"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>ChatGPT</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/redessociales"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span>Redes Sociales</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
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
                Cuentas Premium de Prime Video
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                Disfruta de películas, series y contenido exclusivo con Prime Video
              </p>
            </div>
          </section>

          <section className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Planes Disponibles
              </h2>
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
                          (product.stock <= 0 && !product.acceptsOrders) ||
                          loading
                        }
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                          product.stock > 0 || product.acceptsOrders
                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FiShoppingCart className="mr-2" />
                        {product.stock > 0 ? "Comprar" : "Pedir"}
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
                <h2 className="text-xl font-bold text-white">Confirmar Compra</h2>
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
                  Disponibles: {purchaseModal.product.stock}
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
                  <span>Confirmar Compra</span>
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
=======
      const userRef = doc(db, "users", auth.currentUser.uid); // Referencia al usuario en Firestore

      // Actualizar el saldo y registrar el pedido
      await updateDoc(userRef, {
        balance: balance - product.price,
        orders: [
          ...(user.orders || []),
          {
            id: product.id,
            name: product.name,
            price: product.price,
            date: new Date().toISOString(),
          },
        ],
      });

      alert("¡Compra realizada con éxito!");
      setBalance((prevBalance) => prevBalance - product.price); // Actualizar el balance en el estado
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      alert("Hubo un problema al realizar la compra.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      {/* Barra lateral fija en escritorio, responsive en móviles */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-indigo-700 text-white shadow-lg z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 md:block`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center py-6 border-b border-indigo-500">
            {/* Logo con redirección a Home */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="BlackStreaming" className="h-12 cursor-pointer" />
            </Link>
          </div>
          <nav className="p-4 space-y-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/${category.name.toLowerCase()}`}
                className={`flex items-center justify-between py-3 px-4 rounded-md hover:bg-indigo-500 ${
                  currentCategory === category.name ? "bg-indigo-500 font-bold" : ""
                }`}
              >
                <span>{category.name}</span>
                <span className="flex items-center justify-center bg-white text-indigo-700 font-semibold text-sm rounded-full h-6 w-6 shadow">
                  {categoryCounts[category.name] || 0}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm fixed top-0 left-0 w-full z-10 md:ml-64">
          <h1 className="text-3xl font-bold text-indigo-700">{currentCategory}</h1>
          {user && (
            <div className="text-indigo-700 font-medium">
              {user.name} - Saldo: S/{balance.toFixed(2)}
            </div>
          )}
          <button
            className="text-indigo-700 text-2xl md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FiMenu />
          </button>
        </header>

        {/* Catálogo */}
        <main className="p-8 mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-transform transform hover:-translate-y-1 flex flex-col items-center relative"
                >
                  {/* Indicador de estado */}
                  <div className="relative mb-4">
                    <span
                      className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                      }`}
                    >
                      {product.stock > 0 ? "En stock" : "A pedido"}
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Stock:</strong> {product.stock}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Proveedor:</strong> {product.provider}
                  </p>
                  <p className="text-lg font-bold text-indigo-700 mt-2 mb-4">
                    S/ {product.price}
                  </p>

                  {/* Botón de compra */}
                  <button
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    onClick={() => handlePurchase(product)}
                  >
                    <FiShoppingCart className="inline-block mr-2" />
                    Comprar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No hay productos disponibles en esta categoría.
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{modalContent.title}</h2>
            <p className="text-gray-700">{modalContent.content}</p>
            <button
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    </div>
  );
};

export default PrimeVideo;