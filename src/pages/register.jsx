import React, { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore configuration
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { FiAlertCircle, FiUser, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
=======
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Asegúrate de importar tu configuración de Firestore
import { doc, setDoc } from "firebase/firestore"; // Usamos setDoc para guardar datos en Firestore
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [role, setRole] = useState("user"); // Default role: "user"
  const [referrerCode, setReferrerCode] = useState(""); // State for referral code
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
=======
  const [role, setRole] = useState("user"); // Rol predeterminado: "user"
  const [referrerCode, setReferrerCode] = useState(""); // Estado para código de referido
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setError(null);
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
      if (!["user", "admin", "provider", "affiliate"].includes(role)) {
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
=======

    try {
      // Guarda la solicitud en Firestore con el código de referido si existe
      await setDoc(doc(db, "pendingRegistrations", email), {
        username: username,
        email: email,
        password: password,
        role: role,
        status: "pending",
        referrerCode: referrerCode || null,
        createdAt: new Date(),
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      });

      alert("Tu solicitud de registro ha sido enviada y está pendiente de aprobación.");
      navigate("/login");
    } catch (error) {
      console.error("Error al registrar la solicitud:", error.message);
<<<<<<< HEAD
      setError("Error al enviar la solicitud de registro. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
=======
      alert("Error al enviar la solicitud de registro. Por favor, inténtalo de nuevo.");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Black<span className="text-cyan-400">Streaming</span>
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Regístrate para acceder al sistema.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

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
                <option value="admin">Administrador</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Código de Referido (opcional)</label>
            <input
              type="text"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ingresa un código de referido (si tienes)"
=======
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-700 to-cyan-500 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2 tracking-tight">
          Black<span className="text-indigo-600">Streaming</span>
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Regístrate para acceder al sistema.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
            <input
              type="text"
              placeholder="Elige un nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="Elige una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="user">Usuario</option>
              <option value="affiliate">Afiliado</option>
              <option value="provider">Proveedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Referido (opcional)</label>
            <input
              type="text"
              placeholder="Ingresa un código de referido (si tienes)"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
            />
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 text-white"
            }`}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-400 hover:text-white flex items-center justify-center">
            <FiArrowLeft className="mr-1" /> ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
=======
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Registrarse
          </button>
        </form>
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      </div>
    </div>
  );
};

export default Register;