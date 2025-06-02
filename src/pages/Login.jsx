import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiLock, FiArrowLeft, FiAlertCircle, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { FaSignInAlt, FaUserPlus, FaSun, FaMoon } from "react-icons/fa";
import logo from "../images/logo.png";
import { motion } from "framer-motion";

// Theme Context
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    console.log("Toggling theme from", theme); // Debugging
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    console.log("Theme set to", newTheme); // Debugging
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
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

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      navigate("/");
    } catch (error) {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div
      className={`min-h-screen font-inter transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 text-gray-200"
          : "bg-gradient-to-b from-gray-100 via-blue-50 to-gray-100 text-gray-900"
      } flex flex-col`}
    >
      {/* Navigation Bar */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b ${
          theme === "dark" ? "border-gray-800/50 bg-gray-900/80" : "border-gray-300/50 bg-gray-100/80"
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start">
            <Link to="/" className="flex items-center space-x-3">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={logo}
                alt="BlackStreaming"
                className="h-12 w-auto transition-transform"
              />
              <span
                className={`text-2xl font-bold bg-gradient-to-r ${
                  theme === "dark"
                    ? "from-cyan-400/50 to-blue-600/50 text-cyan-400"
                    : "from-blue-500/50 to-indigo-500/50 text-blue-600"
                } bg-clip-text`}
              >
                BlackStreaming
              </span>
            </Link>
          </div>

          {/* Version Label */}
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            className="text-xs font-semibold text-white bg-cyan-500/20 rounded-full px-3 py-1"
          >
            V 2.0
          </motion.div>

          {/* Theme Toggle and Buttons */}
          <div className="flex items-center justify-center lg:justify-end space-x-3">
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                theme === "dark" ? "text-cyan-400 hover:bg-gray-700/50" : "text-blue-600 hover:bg-gray-200/50"
              } transition-all`}
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <FaSun size={22} /> : <FaMoon size={22} />}
            </motion.button>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold text-white shadow-md transition-all duration-300 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <FaSignInAlt size={18} />
              <span>Ingresar</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold text-white shadow-md transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <FaUserPlus size={18} />
              <span>Registrarse</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className={`backdrop-blur-md rounded-2xl shadow-2xl p-12 w-full max-w-lg border-2 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-cyan-500/20"
              : "bg-gradient-to-br from-gray-200/60 to-gray-300/60 border-blue-500/20"
          }`}
        >
          {/* Large Logo */}
          <motion.div className="flex justify-center mb-6">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={logo}
              alt="BlackStreaming"
              className="h-24 sm:h-32 w-auto transition-transform"
            />
          </motion.div>

          <h1
            className={`text-3xl font-bold mb-10 text-center ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Black
            <span
              className={theme === "dark" ? "text-cyan-400" : "text-blue-600"}
            >
              Streaming
            </span>
          </h1>
          <p
            className={`text-sm text-center mb-10 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Bienvenido de nuevo. Inicia sesión para continuar.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-gradient-to-r from-red-900/80 to-red-800/80 border-l-4 border-red-500 rounded-xl flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
              <button onClick={handleCloseError} className="text-red-400 hover:text-red-300">
                <FiX size={18} />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className={`block mb-2 text-lg ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Nombre de Usuario
              </label>
              <div className="relative">
                <FiUser
                  className={`absolute top-3 left-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                    theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                  } focus:placeholder-opacity-100`} /* Removed placeholder-opacity-0 */
                  required
                />
              </div>
            </div>

            <div>
              <label
                className={`block mb-2 text-lg ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Contraseña
              </label>
              <div className="relative">
                <FiLock
                  className={`absolute top-3 left-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                    theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                  } focus:placeholder-opacity-100`} /* Removed placeholder-opacity-0 */
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-3 right-3 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-cyan-400"
                      : "text-gray-600 hover:text-blue-600"
                  } transition-colors`}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300"
            >
              Iniciar Sesión
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/register"
              className={`flex items-center justify-center transition-all text-lg ${
                theme === "dark"
                  ? "text-gray-400 hover:text-cyan-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <FiArrowLeft className="mr-1" /> ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`backdrop-blur-md border-t py-6 ${
          theme === "dark" ? "border-gray-800/50" : "border-gray-300/50"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
              <span
                className={`text-sm font-semibold ${
                  theme === "dark" ? "text-cyan-400" : "text-blue-600"
                }`}
              >
                BlackStreaming
              </span>
            </div>
            <div
              className={`text-sm text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © {new Date().getFullYear()} BlackStreaming. Todos los derechos reservados.
            </div>
            <div
              className={`text-sm text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrap Login with ThemeProvider
const LoginWithTheme = () => (
  <ThemeProvider>
    <Login />
  </ThemeProvider>
);

export default LoginWithTheme;