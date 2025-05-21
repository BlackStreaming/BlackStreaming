import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext"; // Asegúrate de que la ruta sea correcta

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando...</p>; // Muestra un mensaje mientras se verifica la autenticación
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;