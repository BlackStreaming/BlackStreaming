import React, { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiLock, FiArrowLeft } from "react-icons/fi";
=======
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [error, setError] = useState(null);
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setError(null);
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
<<<<<<< HEAD
        setError("Nombre de usuario no encontrado.");
=======
        alert("Nombre de usuario no encontrado.");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
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
<<<<<<< HEAD
        setError("La contraseña ingresada es incorrecta.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo ingresado no es válido.");
      } else if (error.code === "auth/user-not-found") {
        setError("El usuario no está registrado.");
      } else {
        setError("Usuario o contraseña incorrectos.");
=======
        alert("La contraseña ingresada es incorrecta.");
      } else if (error.code === "auth/invalid-email") {
        alert("El correo ingresado no es válido.");
      } else if (error.code === "auth/user-not-found") {
        alert("El usuario no está registrado.");
      } else {
        alert("Usuario o contraseña incorrectos.");
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      }
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
=======
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-700 to-cyan-500 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2 tracking-tight">
          Black<span className="text-indigo-600">Streaming</span>
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Bienvenido de nuevo. Inicia sesión para continuar.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
            <input
              type="text"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
=======
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
          >
            Iniciar Sesión
          </button>
        </form>
<<<<<<< HEAD

        <div className="mt-6 text-center">
          <Link to="/register" className="text-gray-400 hover:text-white flex items-center justify-center">
            <FiArrowLeft className="mr-1" /> ¿No tienes una cuenta? Regístrate
          </Link>
        </div>
=======
>>>>>>> 748be5c87e5ffde26d0e33692db0c6f7a2e9a6d2
      </div>
    </div>
  );
};

export default Login;