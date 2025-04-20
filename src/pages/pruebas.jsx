import React, { useState, useEffect } from "react";
import { 
  FiHome, FiBox, FiUpload, FiTrendingUp, FiSettings, 
  FiLogOut, FiMenu, FiEdit2, FiTrash2, FiPlus, 
  FiRefreshCw, FiCheck, FiX, FiUser, FiDollarSign,
  FiShoppingCart, FiClock, FiAlertCircle, FiInfo
} from "react-icons/fi";
import { 
  collection, addDoc, query, where, onSnapshot, 
  doc, deleteDoc, setDoc, getDoc, serverTimestamp 
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const DashboardProvider = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [username, setUsername] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form states
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
    accounts: [],
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    email: "",
    password: "",
    preferences: "",
  });

  const navigate = useNavigate();
  const auth = getAuth();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setEmail(user.email || "");
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Fetch user data
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
          preferences: userData.preferences || ""
        });
      }
      setLoading(false);
    } catch (error) {
      setError("Error al cargar datos del usuario");
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  // Fetch products
  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "products"),
      where("provider", "==", username)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetchedProducts);
    });

    return () => unsubscribe();
  }, [username]);

  // Fetch orders
  useEffect(() => {
    if (!username) return;

    const q = query(
      collection(db, "orders"),
      where("provider", "==", username)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [username]);

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => {
        setError("Error al cerrar sesión");
        console.error("Logout error:", error);
      });
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle account details changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
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

  // Handle product submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const formattedAccounts = product.accounts?.map((account) => ({
        email: account.email || "",
        password: account.password || "",
        profile: account.profile || "",
      })) || [];

      await addDoc(collection(db, "products"), {
        ...product,
        provider: username,
        providerPhone: product.providerPhone || "",
        accounts: formattedAccounts,
        createdAt: serverTimestamp()
      });

      // Reset form
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
        accounts: [],
      });

      alert("Producto subido exitosamente!");
    } catch (error) {
      console.error("Error al subir el producto:", error);
      setError("Error al subir el producto");
    }
  };

  // Handle product edit
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  // Handle product update
  const handleUpdateProduct = async () => {
    try {
      if (selectedProduct) {
        const productRef = doc(db, "products", selectedProduct.id);
        await setDoc(productRef, selectedProduct, { merge: true });
        setEditModalOpen(false);
        alert("Producto actualizado exitosamente!");
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setError("Error al actualizar el producto");
    }
  };

  // Handle product deletion
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

  // Handle account update
  const handleUpdateAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, accountDetails, { merge: true });
        alert("Configuración actualizada correctamente!");
      }
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      setError("Error al actualizar la configuración");
    }
  };

  // Calculate total earnings
  const totalEarnings = orders.reduce((total, order) => {
    const amount = typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0;
    return total + amount;
  }, 0);

  // Calculate total stock
  const totalStock = products.reduce((total, product) => {
    const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0;
    return total + stock;
  }, 0);

  // Render content based on active section
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setError("")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Aceptar
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case "inicio":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {username}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Productos */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
                  <FiBox className="mr-2" /> Inventario
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="text-3xl font-bold text-indigo-600">{products.length}</p>
                  <p>Productos registrados</p>
                  <p className="text-sm">Stock total: {totalStock}</p>
                </div>
              </div>
              
              {/* Ganancias */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                  <FiDollarSign className="mr-2" /> Ganancias
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="text-3xl font-bold text-green-600">S/ {totalEarnings.toFixed(2)}</p>
                  <p>Total acumulado</p>
                  <p className="text-sm">{orders.length} ventas realizadas</p>
                </div>
              </div>
              
              {/* Cuenta */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                  <FiUser className="mr-2" /> Mi Cuenta
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="text-lg font-medium">{username}</p>
                  <p className="text-sm">{email}</p>
                  <button 
                    onClick={() => setActiveSection("configuracion")}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>
            
            {/* Últimos pedidos */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <FiShoppingCart className="mr-2" /> Pedidos recientes
              </h3>
              {orders.slice(0, 3).map((order, index) => (
                <div key={index} className="border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{order.productName}</p>
                      <p className="text-sm text-gray-500">
                        Comprador: {order.buyer || "Anónimo"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">S/ {order.amount || "0.00"}</p>
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
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          </div>
        );

      case "inventario":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiBox className="mr-2" /> Inventario
              </h3>
              <button
                onClick={() => setActiveSection("subirProducto")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
              >
                <FiPlus className="mr-2" /> Nuevo Producto
              </button>
            </div>

            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/ {product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === "En stock" ? "bg-green-100 text-green-800" : 
                            product.status === "A pedido" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
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
                <h4 className="text-lg font-medium text-gray-600">No tienes productos registrados</h4>
                <p className="text-gray-500 mb-4">Agrega tu primer producto para comenzar</p>
                <button
                  onClick={() => setActiveSection("subirProducto")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center mx-auto"
                >
                  <FiPlus className="mr-2" /> Agregar Producto
                </button>
              </div>
            )}
          </div>
        );

      case "subirProducto":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiUpload className="mr-2" /> Subir Nuevo Producto
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <div className="flex text-sm text-gray-600">
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
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información básica */}
                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Netflix Premium 1 mes"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="status"
                        value={product.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="En stock">En stock</option>
                        <option value="A pedido">A pedido</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ej: 9.99"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
                  <input
                    type="number"
                    name="duration"
                    value={product.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Dejar vacío para ilimitado"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
                  <input
                    type="text"
                    name="providerPhone"
                    value={product.providerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: +51 987654321"
                  />
                </div>
              </div>

              {/* Detalles y términos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalles del producto</label>
                <textarea
                  name="details"
                  value={product.details}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe los detalles y características del producto"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Términos y condiciones</label>
                <textarea
                  name="terms"
                  value={product.terms}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Especifica los términos y condiciones de uso"
                ></textarea>
              </div>

              {/* Cuentas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuentas asociadas</label>
                <div className="space-y-4">
                  {Array.from({ length: product.stock }, (_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Cuenta {i + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
                          <input
                            type="email"
                            value={product.accounts?.[i]?.email || ""}
                            onChange={(e) => {
                              const updatedAccounts = [...(product.accounts || [])];
                              updatedAccounts[i] = { ...updatedAccounts[i], email: e.target.value };
                              setProduct({ ...product, accounts: updatedAccounts });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
                          <input
                            type="text"
                            value={product.accounts?.[i]?.password || ""}
                            onChange={(e) => {
                              const updatedAccounts = [...(product.accounts || [])];
                              updatedAccounts[i] = { ...updatedAccounts[i], password: e.target.value };
                              setProduct({ ...product, accounts: updatedAccounts });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Perfil (opcional)</label>
                          <input
                            type="text"
                            value={product.accounts?.[i]?.profile || ""}
                            onChange={(e) => {
                              const updatedAccounts = [...(product.accounts || [])];
                              updatedAccounts[i] = { ...updatedAccounts[i], profile: e.target.value };
                              setProduct({ ...product, accounts: updatedAccounts });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Subir Producto
                </button>
              </div>
            </form>
          </div>
        );

      case "ganancias":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiDollarSign className="mr-2" /> Ganancias
            </h3>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium text-green-700 mb-1">Ganancias totales</h4>
                  <p className="text-sm text-green-600">{orders.length} ventas realizadas</p>
                </div>
                <div className="text-3xl font-bold text-green-600">S/ {totalEarnings.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.buyer || "Anónimo"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/ {order.amount || "0.00"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "completed" ? "bg-green-100 text-green-800" : 
                          order.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status || "completed"}
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
                <h4 className="text-lg font-medium text-gray-600">No hay ventas registradas</h4>
                <p className="text-gray-500">Tus ventas aparecerán aquí</p>
              </div>
            )}
          </div>
        );

      case "configuracion":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiSettings className="mr-2" /> Configuración de cuenta
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAccount(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={accountDetails.email}
                  onChange={handleAccountChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={accountDetails.password}
                  onChange={handleAccountChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferencias</label>
                <textarea
                  name="preferences"
                  value={accountDetails.preferences}
                  onChange={handleAccountChange}
                  rows="3"
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
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
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
    <div className="p-6 border-b border-gray-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-indigo-600">
          {username.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium text-gray-800">{username}</p>
        <p className="text-sm text-gray-500">{email}</p>
        <p className="text-xs mt-2 bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full inline-block">
          Proveedor
        </p>
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
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "inicio" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "inventario" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "subirProducto" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "ganancias" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <FiDollarSign className="mr-3" /> Ganancias
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              setActiveSection("configuracion");
              setMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === "configuracion" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <FiSettings className="mr-3" /> Configuración
          </button>
        </li>
      </ul>
    </nav>
    
    <div className="p-4 border-t border-gray-200">
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2"
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
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Editar Producto</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {selectedProduct && (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                      <div className="flex items-center space-x-4">
                        {selectedProduct.image && (
                          <img src={selectedProduct.image} alt="Product" className="w-16 h-16 object-cover rounded" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelectedProduct({...selectedProduct, image: reader.result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                        <input
                          type="number"
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input
                          type="number"
                          value={selectedProduct.stock}
                          onChange={(e) => setSelectedProduct({...selectedProduct, stock: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={selectedProduct.status}
                          onChange={(e) => setSelectedProduct({...selectedProduct, status: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="En stock">En stock</option>
                          <option value="A pedido">A pedido</option>
                        </select>
                      </div>
                    </div>

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
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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