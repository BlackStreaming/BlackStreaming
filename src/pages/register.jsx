import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FiUser, FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX, FiEye, FiEyeOff } from "react-icons/fi";
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
    console.log("Toggling theme from", theme);
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    console.log("Theme set to", newTheme);
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

// Notification Modal Component
const NotificationModal = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-sm w-full border transform transition-all duration-300 ${
          type === "success" ? "border-green-500 scale-100" : "border-red-500 scale-100"
        }`}
      >
        <div className="flex items-center mb-4">
          {type === "success" ? (
            <FiCheckCircle className="text-green-400 text-2xl mr-2" />
          ) : (
            <FiAlertCircle className="text-red-400 text-2xl mr-2" />
          )}
          <h3
            className={`text-lg font-bold ${
              type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {type === "success" ? "Éxito" : "Error"}
          </h3>
        </div>
        <p className="text-gray-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-2 rounded-xl font-medium transition-all duration-300 ${
            type === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [referrerCode, setReferrerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setModal({ isOpen: false, message: "", type: "success" });
    setLoading(true);

    try {
      if (!username || username.length < 3) {
        throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Por favor, ingresa un correo electrónico válido.");
      }
      if (!password || password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }
      if (!["user", "affiliate", "provider"].includes(role)) {
        throw new Error("Rol no válido.");
      }

      await setDoc(doc(db, "pendingRegistrations", email), {
        username: username,
        email: email,
        password: password,
        role: role,
        status: "pending",
        referrerCode: referrerCode || null,
        createdAt: new Date().toISOString(),
      });

      setModal({
        isOpen: true,
        message: "Tu solicitud de registro ha sido enviada y está pendiente de aprobación.",
        type: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error al registrar la solicitud:", error.message);
      setModal({
        isOpen: true,
        message: error.message || "Error al enviar la solicitud de registro. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
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

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            className="text-xs font-semibold text-white bg-cyan-500/20 rounded-full px-3 py-1"
          >
            V 1.0
          </motion.div>

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
            Regístrate para acceder al sistema.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                    theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                  } focus:placeholder-opacity-100`}
                  placeholder="Elige un nombre de usuario"
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
                Correo Electrónico
              </label>
              <div className="relative">
                <FiMail
                  className={`absolute top-3 left-3 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                    theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                  } focus:placeholder-opacity-100`}
                  placeholder="Tu correo electrónico"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                    theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                  } focus:placeholder-opacity-100`}
                  placeholder="Elige una contraseña"
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

            <div>
              <label
                className={`block mb-2 text-lg ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Rol
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-gray-200/50"
                  } ${theme === "dark" ? "text-white" : "text-gray-900"} border ${
                    theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                  } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all appearance-none`}
                >
                  <option value="user">Usuario</option>
                  <option value="affiliate">Afiliado</option>
                  <option value="provider">Proveedor</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className={`w-4 h-4 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                className={`block mb-2 text-lg ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Código de Referido (opcional)
              </label>
              <input
                type="text"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
                className={`w-full pl-4 pr-4 py-2.5 rounded-xl bg-transparent ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } border ${
                  theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                  theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                } focus:placeholder-opacity-100`}
                placeholder="Ingresa un código de referido (si tienes)"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : theme === "dark"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h-8z"
                    />
                  </svg>
                  Registrando...
                </div>
              ) : (
                "Registrarse"
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className={`flex items-center justify-center transition-all text-lg ${
                theme === "dark"
                  ? "text-gray-400 hover:text-cyan-400"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <FiArrowLeft className="mr-1" /> ¿Ya tienes una cuenta? Inicia sesión
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

const RegisterWithTheme = () => (
  <ThemeProvider>
    <Register />
  </ThemeProvider>
);

export default RegisterWithTheme;