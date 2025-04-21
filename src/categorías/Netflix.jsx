import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaBars, 
  FaShoppingCart, 
  FaSpinner, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaFileAlt, 
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";
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
  const [productsCount, setProductsCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const priceNumber = Number(price);
    return isNaN(priceNumber) ? "0.00" : priceNumber.toFixed(2);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: user.uid,
            name: userData.username || "Usuario",
            email: user.email,
            orders: userData.orders || [],
            role: userData.role || "user"
          });
          setBalance(Number(userData.balance) || 0);
        }
      } catch (err) {
        setError("Error al cargar datos del usuario");
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const productsQuery = query(collection(db, "products"));
    const productsUnsubscribe = onSnapshot(productsQuery, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 0,
          stock: Number(doc.data().availableAccounts) || 0,
          accountDetails: doc.data().details || "Detalles no disponibles",
          terms: "Términos del proveedor",
          provider: doc.data().email || "Proveedor no especificado",
          acceptsOrders: true,
          duration: doc.data().duration || "1 mes",
          type: "Premium"
        }));
        setProducts(productsData);
        setProductsCount(productsData.length);
      },
      (err) => {
        setError("Error al cargar productos");
        console.error(err);
      }
    );

    const accountsQuery = query(collection(db, "netflix_accounts"), where("status", "==", "available"));
    const accountsUnsubscribe = onSnapshot(accountsQuery,
      (snapshot) => {
        const accountsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          productId: doc.data().productId || "",
          providerId: doc.data().providerId || ""
        }));
        setAccounts(accountsData);
      },
      (err) => {
        console.error("Error al cargar cuentas:", err);
      }
    );

    return () => {
      productsUnsubscribe();
      accountsUnsubscribe();
    };
  }, []);

  const handlePurchase = (product) => {
    if (!user) return;
    
    if (balance < product.price) {
      alert("Saldo insuficiente para realizar esta compra");
      return;
    }
  
    setPurchaseModal({
      product,
      customerName: user.name,
      phoneNumber: ""
    });
  };

  const showDetails = (product) => {
    setDetailModal({
      name: product.name,
      accountDetails: product.accountDetails,
      provider: product.provider,
      terms: product.terms
    });
  };

  const showTerms = (product) => {
    setDetailModal({
      name: product.name,
      terms: product.terms
    });
    setTermsModal(true);
  };

  const finalizePurchase = async () => {
    try {
      setLoading(true);
      
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, "products", purchaseModal.product.id);
        const productDoc = await transaction.get(productRef);
        
        const currentStock = Number(productDoc.data().availableAccounts) || 0;
        
        if (currentStock <= 0) {
          throw new Error("No hay cuentas disponibles en stock");
        }

        const userRef = doc(db, "users", user.id);
        const userDoc = await transaction.get(userRef);
        
        const newBalance = (userDoc.data().balance || 0) - purchaseModal.product.price;
        
        const orderData = {
          productId: purchaseModal.product.id,
          productName: purchaseModal.product.name,
          price: purchaseModal.product.price,
          provider: purchaseModal.product.provider,
          status: "active",
          customerName: purchaseModal.customerName,
          phoneNumber: purchaseModal.phoneNumber,
          createdAt: new Date().toISOString(),
          accountDetails: `Email: ${purchaseModal.product.provider}\nContraseña: [El proveedor te contactará]`,
          terms: purchaseModal.product.terms
        };

        transaction.update(productRef, {
          availableAccounts: currentStock - 1
        });

        transaction.update(userRef, {
          balance: newBalance,
          orders: [...(userDoc.data().orders || []), orderData]
        });
      });

      setBalance(prev => prev - purchaseModal.product.price);
      setUser(prev => ({
        ...prev,
        orders: [...prev.orders, {
          ...purchaseModal,
          status: "active",
          createdAt: new Date().toISOString()
        }]
      }));
      
      setPurchaseModal(null);
      alert("¡Compra realizada! El proveedor se contactará contigo con los detalles de acceso.");
    } catch (err) {
      setError(err.message || "Error al procesar la compra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductStatus = (product) => {
    if (product.stock > 0) {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
          Disponibles: {product.stock}
        </span>
      );
    }
    return (
      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
        Agotado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <FaSpinner className="animate-spin text-4xl text-white mb-4" />
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <FaExclamationCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-white mb-2">Error</p>
        <p className="text-gray-400 mb-6 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black rounded-lg hover:opacity-90"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white transition-colors md:hidden"
            >
              <FaBars size={20} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">
                BlackStreaming
              </span>
            </Link>
          </div>

          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center relative w-1/3"
          >
            <input
              type="text"
              placeholder="Buscar en Netflix..."
              className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              <FaSearch />
            </button>
          </form>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm font-medium">👤 {user.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">S/{balance.toFixed(2)}</span>
                  <button
                    onClick={goToDashboard}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    title="Dashboard"
                  >
                    <FaUser className="text-white" />
                  </button>
                  <button
                    onClick={() => {
                      auth.signOut();
                      navigate("/");
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm"
                  >
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-sm hover:text-white transition-colors"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:opacity-90 transition-opacity text-sm"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar en Netflix..."
                className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
              >
                <FaSearch />
              </button>
            </form>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 md:translate-x-0 md:static`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-800 flex items-center justify-center">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="h-8" />
                <span className="ml-2 text-xl font-bold text-white">
                  BlackStreaming
                </span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <Link 
                to="/netflix" 
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-white text-black mb-2"
              >
                <span>Netflix</span>
                <span className="bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {productsCount}
                </span>
              </Link>
              <Link 
                to="/spotify" 
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span>Spotify</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link 
                to="/disney" 
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span>Disney+</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link 
                to="/max" 
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span>Max</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link 
                to="/primevideo" 
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span>Prime Video</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link 
                to="/vix" 
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span>Vix</span>
                <span className="bg-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                  <div className="bg-white text-black rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">Saldo: S/{balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
          <section className="relative h-64 bg-gradient-to-r from-gray-900 to-black flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Cuentas Premium de Netflix</h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                Disfruta de los mejores planes de Netflix a precios increíbles
              </p>
            </div>
          </section>

          <section className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Planes Disponibles</h2>
              <button 
                onClick={() => setGeneralTermsModal(true)}
                className="text-sm text-white hover:underline"
              >
                Términos Generales
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No se encontraron productos que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={product.image || 'https://via.placeholder.com/300'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {renderProductStatus(product)}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-white">{product.name}</h3>
                      
                      <div className="text-sm text-gray-300 space-y-1 mb-3">
                        <p className="flex items-center">
                          <span className="font-medium">Proveedor:</span> 
                          <span className="ml-1">{product.provider}</span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium">Duración:</span> 
                          <span className="ml-1">{product.duration || "1 mes"}</span>
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium">Tipo:</span> 
                          <span className="ml-1">{product.type || "Premium"}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-xl">S/ {formatPrice(product.price)}</span>
                      </div>

                      <div className="flex space-x-2 mb-3">
                        <button
                          onClick={() => showDetails(product)}
                          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center transition-colors"
                        >
                          <FaInfoCircle className="mr-1" /> Detalles
                        </button>
                        <button
                          onClick={() => showTerms(product)}
                          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center transition-colors"
                        >
                          <FaFileAlt className="mr-1" /> Términos
                        </button>
                      </div>

                      <button
                        onClick={() => handlePurchase(product)}
                        disabled={(product.stock <= 0 && !product.acceptsOrders) || loading}
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                          (product.stock > 0 || product.acceptsOrders) 
                            ? 'bg-white text-black hover:opacity-90' 
                            : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaShoppingCart className="mr-2" />
                        {product.stock > 0 ? 'Comprar' : 'Pedir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {purchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Confirmar Compra</h2>
                <button 
                  onClick={() => setPurchaseModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="font-bold text-white">{purchaseModal.product.name}</h3>
                <p className="text-white font-bold text-xl">S/ {formatPrice(purchaseModal.product.price)}</p>
                <p className="text-sm text-gray-400">Proveedor: {purchaseModal.product.provider}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Disponibles: {purchaseModal.product.stock}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={purchaseModal.customerName}
                    onChange={(e) => setPurchaseModal(prev => ({
                      ...prev,
                      customerName: e.target.value
                    }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Número de WhatsApp</label>
                  <input
                    type="tel"
                    value={purchaseModal.phoneNumber}
                    onChange={(e) => setPurchaseModal(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white"
                    placeholder="Ej. 999888777"
                    required
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    className="mt-1 mr-2 bg-gray-800 border-gray-700 text-white focus:ring-white"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-sm text-gray-400">
                    Acepto los <button type="button" onClick={() => setTermsModal(true)} className="text-white hover:underline">Términos</button> y <button type="button" onClick={() => setGeneralTermsModal(true)} className="text-white hover:underline">Condiciones Generales</button>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizePurchase}
                  disabled={loading}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center transition-opacity"
                >
                  {loading && <FaSpinner className="animate-spin mr-2" />}
                  Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailModal && !termsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{detailModal.name}</h2>
                <button 
                  onClick={() => setDetailModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-white mb-2">Proveedor:</h3>
                  <p className="text-white">{detailModal.provider}</p>
                </div>

                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-white mb-2">Detalles de la cuenta:</h3>
                  <div className="p-2 bg-gray-900 rounded-md">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{detailModal.accountDetails}</pre>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDetailModal(null);
                  setTermsModal(true);
                }}
                className="w-full mt-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Ver Términos Específicos
              </button>
            </div>
          </div>
        </div>
      )}

      {termsModal && detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Términos - {detailModal.name}</h2>
                <button 
                  onClick={() => setTermsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="text-gray-300">
                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-gray-700">
                  <h3 className="font-bold text-white mb-2">Proveedor: {detailModal.provider}</h3>
                </div>

                <h3 className="font-bold text-white mb-2">Términos específicos:</h3>
                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-gray-700">
                  <pre className="whitespace-pre-wrap text-gray-300">{detailModal.terms}</pre>
                </div>

                <button
                  onClick={() => {
                    setTermsModal(false);
                    setGeneralTermsModal(true);
                  }}
                  className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 mb-4 transition-colors border border-gray-700"
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
          <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Términos y Condiciones Generales</h2>
                <button 
                  onClick={() => setGeneralTermsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="text-gray-300">
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white mb-2">1. Proceso de Compra</h3>
                    <p>Al realizar una compra, el proveedor se contactará contigo dentro de las próximas 24 horas hábiles para entregarte los accesos a tu cuenta.</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white mb-2">2. Garantía</h3>
                    <p>Todos los productos tienen una garantía de 7 días. Si tienes problemas con tu cuenta durante este periodo, el proveedor está obligado a resolverlos o reembolsarte.</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white mb-2">3. Uso Responsable</h3>
                    <p>El cliente es responsable del uso que dé a la cuenta adquirida. No nos hacemos responsables por suspensiones o baneos por mal uso.</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white mb-2">4. Soporte</h3>
                    <p>El soporte se realizará directamente con el proveedor mediante el número de WhatsApp proporcionado.</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-white mb-2">5. Renovaciones</h3>
                    <p>Las renovaciones son manuales y deben solicitarse al proveedor antes de que finalice el período contratado.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-6 py-2 bg-white text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900/50 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src={logo} alt="BlackStreaming" className="h-6 w-auto" />
              <span className="text-sm font-medium">BlackStreaming</span>
            </div>
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
            </div>
            <div className="text-sm text-gray-400">
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Netflix;