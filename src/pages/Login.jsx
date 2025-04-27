import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiLock, FiArrowLeft } from "react-icons/fi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

      const role = userData.role;
      if (role === "user") navigate("/");
      else if (role === "affiliate") navigate("/");
      else if (role === "provider") navigate("/");
      else if (role === "admin") navigate("/");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setError("La contraseña ingresada es incorrecta.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo ingresado no es válido.");
      } else if (error.code === "auth/user-not-found") {
        setError("El usuario no está registrado.");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Black<span className="text-cyan-400">Streaming</span>
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Bienvenido de nuevo. Inicia sesión para continuar.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Nombre de Usuario</label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-gray-400 hover:text-white flex items-center justify-center">
            <FiArrowLeft className="mr-1" /> ¿No tienes una cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;