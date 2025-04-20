import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiShoppingCart, FiLoader, FiAlertCircle, FiInfo, FiFileText, FiUser } from "react-icons/fi";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../images/logo.png";

const Netflix = () => {
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
  const navigate = useNavigate();

  // Format price safely
  const formatPrice = (price) => {
    const priceNumber = Number(price);
    return isNaN(priceNumber) ? "0.00" : priceNumber.toFixed(2);
  };

  // Get user data
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
            orders: userData.orders || []
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

  // Get products and count
  useEffect(() => {
    const q = query(collection(db, "products"), where("category", "==", "Netflix"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 0,
          stock: Number(doc.data().stock) || 0,
          accountDetails: doc.data().accountDetails || "Detalles no disponibles",
          terms: doc.data().terms || "Términos no especificados",
          provider: doc.data().provider || "Proveedor no especificado"
        }));
        setProducts(productsData);
        setProductsCount(productsData.length);
      },
      (err) => {
        setError("Error al cargar productos");
        console.error(err);
      }
    );

    return () => unsubscribe();
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
      const userRef = doc(db, "users", user.id);
      
      const orderData = {
        productId: purchaseModal.product.id,
        productName: purchaseModal.product.name,
        price: purchaseModal.product.price,
        provider: purchaseModal.product.provider,
        status: "pending",
        customerName: purchaseModal.customerName,
        phoneNumber: purchaseModal.phoneNumber,
        createdAt: new Date().toISOString(),
        accountDetails: purchaseModal.product.accountDetails,
        terms: purchaseModal.product.terms
      };

      await updateDoc(userRef, {
        balance: balance - purchaseModal.product.price,
        orders: [...user.orders, orderData]
      });

      setBalance(prev => prev - purchaseModal.product.price);
      setUser(prev => ({
        ...prev,
        orders: [...prev.orders, orderData]
      }));
      
      setPurchaseModal(null);
      alert("¡Compra realizada! El proveedor se contactará contigo");
    } catch (err) {
      setError("Error al procesar la compra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <FiLoader className="animate-spin text-4xl text-indigo-600 mb-4" />
        <p className="text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <FiAlertCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-gray-800 mb-2">Error</p>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-700 text-white shadow-lg transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-indigo-600 flex items-center justify-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="h-10" />
              <span className="ml-2 text-xl font-bold">BlackStreaming</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <Link 
              to="/netflix" 
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-indigo-800 text-white mb-2"
            >
              <span>Netflix</span>
              <span className="bg-white text-indigo-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {productsCount}
              </span>
            </Link>
            <Link 
              to="/spotify" 
              className="flex items-center justify-between px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-800 hover:text-white mb-2"
            >
              <span>Spotify</span>
              <span className="bg-white text-indigo-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </nav>
          {user && (
            <div className="p-4 border-t border-indigo-600">
              <div className="flex items-center">
                <div className="bg-indigo-600 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold">
                  <FiUser />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-indigo-200">Saldo: S/{balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'} md:ml-64`}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-40">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-bold text-indigo-700">Netflix</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setGeneralTermsModal(true)}
              className="text-sm text-indigo-600 hover:underline hidden md:block"
            >
              Términos Generales
            </button>
            {user && (
              <div className="hidden md:block text-sm text-gray-700">
                <span className="font-medium">{user.name}</span> - Saldo: S/{balance.toFixed(2)}
              </div>
            )}
          </div>
        </header>

        {/* Product Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.image || 'https://via.placeholder.com/300'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-gray-800'}`}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{product.name}</h3>
                  
                  {/* Información visible directamente */}
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
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

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-indigo-600 font-bold text-lg">S/ {formatPrice(product.price)}</span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => showDetails(product)}
                      className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm flex items-center justify-center"
                    >
                      <FiInfo className="mr-1" /> Detalles
                    </button>
                    <button
                      onClick={() => showTerms(product)}
                      className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm flex items-center justify-center"
                    >
                      <FiFileText className="mr-1" /> Términos
                    </button>
                  </div>

                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={product.stock <= 0 || loading}
                    className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                      product.stock > 0 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="mr-2" />
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      {purchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar Compra</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-800">{purchaseModal.product.name}</h3>
                <p className="text-indigo-600 font-bold text-xl">S/ {formatPrice(purchaseModal.product.price)}</p>
                <p className="text-sm text-gray-600">Proveedor: {purchaseModal.product.provider}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={purchaseModal.customerName}
                    onChange={(e) => setPurchaseModal(prev => ({
                      ...prev,
                      customerName: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp</label>
                  <input
                    type="tel"
                    value={purchaseModal.phoneNumber}
                    onChange={(e) => setPurchaseModal(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej. 999888777"
                    required
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    className="mt-1 mr-2"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-sm text-gray-600">
                    Acepto los <button type="button" onClick={() => setTermsModal(true)} className="text-indigo-600 hover:underline">Términos</button> y <button type="button" onClick={() => setGeneralTermsModal(true)} className="text-indigo-600 hover:underline">Condiciones Generales</button>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizePurchase}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center"
                >
                  {loading && <FiLoader className="animate-spin mr-2" />}
                  Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {detailModal && !termsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{detailModal.name}</h2>
                <button 
                  onClick={() => setDetailModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h3 className="font-medium text-indigo-700 mb-2">Proveedor:</h3>
                  <p className="text-gray-800">{detailModal.provider}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Detalles de la cuenta:</h3>
                  <div className="p-2 bg-white rounded-md">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">{detailModal.accountDetails}</pre>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDetailModal(null);
                  setTermsModal(true);
                }}
                className="w-full mt-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
              >
                Ver Términos Específicos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specific Terms Modal */}
      {termsModal && detailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Términos - {detailModal.name}</h2>
                <button 
                  onClick={() => setTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="prose prose-sm text-gray-600">
                <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                  <h3 className="font-bold text-indigo-700 mb-2">Proveedor: {detailModal.provider}</h3>
                </div>

                <h3 className="font-bold text-gray-700 mb-2">Términos específicos:</h3>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <pre className="whitespace-pre-wrap">{detailModal.terms}</pre>
                </div>

                <button
                  onClick={() => {
                    setTermsModal(false);
                    setGeneralTermsModal(true);
                  }}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-4"
                >
                  Ver Términos Generales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Terms Modal */}
      {generalTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Términos y Condiciones Generales</h2>
                <button 
                  onClick={() => setGeneralTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="prose prose-sm text-gray-600">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">1. Proceso de Compra</h3>
                    <p>Al realizar una compra, el proveedor se contactará contigo dentro de las próximas 24 horas hábiles para entregarte los accesos a tu cuenta.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">2. Garantía</h3>
                    <p>Todos los productos tienen una garantía de 7 días. Si tienes problemas con tu cuenta durante este periodo, el proveedor está obligado a resolverlos o reembolsarte.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">3. Uso Responsable</h3>
                    <p>El cliente es responsable del uso que dé a la cuenta adquirida. No nos hacemos responsables por suspensiones o baneos por mal uso.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">4. Soporte</h3>
                    <p>El soporte se realizará directamente con el proveedor mediante el número de WhatsApp proporcionado.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">5. Renovaciones</h3>
                    <p>Las renovaciones son manuales y deben solicitarse al proveedor antes de que finalice el período contratado.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setGeneralTermsModal(false)}
                className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Netflix;