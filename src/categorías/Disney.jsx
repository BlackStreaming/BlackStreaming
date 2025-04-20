import React, { useState, useEffect } from "react";
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

const Disney = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [user, setUser] = useState(null); // Estado para el usuario autenticado
  const [balance, setBalance] = useState(0); // Estado para el balance del usuario
  const [role, setRole] = useState("user"); // Estado para el rol del usuario
  const currentCategory = "Disney";

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
      const disneyProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(disneyProducts);
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
      return;
    }

    if (balance < product.price) {
      alert("Saldo insuficiente para realizar esta compra.");
      return;
    }

    try {
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
    </div>
  );
};

export default Disney;