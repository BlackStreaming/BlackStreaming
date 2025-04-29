import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore configuration
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { FiUser, FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// Modal Component for Notifications
const NotificationModal = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className={`bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full border transform transition-all duration-300 ${
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
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Black<span className="text-cyan-400">Streaming</span>
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Regístrate para acceder al sistema.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Nombre de Usuario</label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Elige un nombre de usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Tu correo electrónico"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Elige una contraseña"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Rol</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
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
            <label className="block text-gray-300 mb-1">
              Código de Referido (opcional)
            </label>
            <input
              type="text"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ingresa un código de referido (si tienes)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 text-white"
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
            className="text-gray-400 hover:text-white flex items-center justify-center"
          >
            <FiArrowLeft className="mr-1" /> ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
      </div>

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
