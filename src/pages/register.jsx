import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore configuration
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { FiUser, FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { FaBars } from "react-icons/fa";
import logo from "../images/logo.png";

// Modal Component for Notifications
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
  const [role, setRole] = useState("user"); // Default role: "user"
  const [referrerCode, setReferrerCode] = useState(""); // State for referral code
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setModal({ isOpen: false, message: "", type: "success" });
    setLoading(true);

    try {
      // Validate inputs
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

      // Save the registration request to Firestore in the 'pendingRegistrations' collection
      await setDoc(doc(db, "pendingRegistrations", email), {
        username: username,
        email: email,
        password: password, // Note: Storing passwords in Firestore is not recommended; consider using Firebase Authentication
        role: role,
        status: "pending",
        referrerCode: referrerCode || null,
        createdAt: new Date().toISOString(),
      });

      // Show success modal
      setModal({
        isOpen: true,
        message: "Tu solicitud de registro ha sido enviada y está pendiente de aprobación.",
        type: "success",
      });

      // Navigate to login after a short delay to allow the user to see the modal
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
              className="px-4 py-2 text-sm text-gray-200 hover:textcyan-400 transition-all"
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
            Regístrate para acceder al sistema.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Nombre de Usuario</label>
              <div className="relative">
                <FiUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                  placeholder="Elige un nombre de usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Correo Electrónico</label>
              <div className="relative">
                <FiMail className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                  placeholder="Tu correo electrónico"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                  placeholder="Elige una contraseña"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Rol</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all appearance-none"
                >
                  <option value="user">Usuario</option>
                  <option value="affiliate">Afiliado</option>
                  <option value="provider">Proveedor</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
              <label className="block text-gray-300 mb-2">
                Código de Referido (opcional)
              </label>
              <input
                type="text"
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600/50 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500"
                placeholder="Ingresa un código de referido (si tienes)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white"
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
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-cyan-400 flex items-center justify-center transition-all"
            >
              <FiArrowLeft className="mr-1" /> ¿Ya tienes una cuenta? Inicia sesión
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

export default Register;
