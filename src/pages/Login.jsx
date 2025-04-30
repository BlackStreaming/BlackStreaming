import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiLock, FiArrowLeft, FiAlertCircle, FiX } from "react-icons/fi";
import { FaBars, FaSignOutAlt, FaColumns } from "react-icons/fa";
import logo from "../images/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      // Buscar el usuario en Firestore por nombre de usuario
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        setError("Nombre de usuario no encontrado.");
        return;
      }
  
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email;
  
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Redirigir a la página de inicio para todos los roles
      navigate("/");
    } catch (error) {
      // Mostrar un mensaje genérico para cualquier error de autenticación
      setError("Usuario o contraseña incorrectos.");
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all md:hidden"
            >
              <FaBars size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-10 w-auto" />
              <span className="text-xl font-semibold text-cyan-400 hidden sm:block">
                BlackStreaming
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 order-2 sm:order-3">
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 w-56 sm:w-64 bg-gray-900/90 backdrop-blur-sm text-white shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out z-50 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4">
                <span className="text-xl font-semibold text-cyan-400">
                  BlackStreaming
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-200 hover:bg-gray-700/50 p-2 rounded-full transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-2 p-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-2 text-left rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-3 py-2 text-left rounded-xl bg-cyan-500 hover:bg-cyan-600 transition-colors"
                >
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-700/50">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Black<span className="text-cyan-400">Streaming</span>
          </h1>
          <p className="text-sm text-center text-gray-400 mb-6">
            Bienvenido de nuevo. Inicia sesión para continuar.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/80 border-l-4 border-red-500 rounded-xl flex items-center">
              <FiAlertCircle className="mr-2 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Nombre de Usuario</label>
              <div className="relative">
                <FiUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <FiLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-all duration-300"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="text-gray-400 hover:text-cyan-400 flex items-center justify-center transition-all">
              <FiArrowLeft className="mr-1" /> ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
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
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
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

export default Login;
