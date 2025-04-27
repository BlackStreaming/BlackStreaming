import React from "react";
import { FaTools, FaClock, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

// Assets
import logo from "../images/logo.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BlackStreaming" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BlackStreaming
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-2xl mx-4 text-center py-12">
          <div className="inline-flex items-center justify-center p-6 bg-gray-800 rounded-full mb-6">
            <FaTools className="text-5xl text-cyan-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Estamos en Mantenimiento
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            Estamos realizando mejoras para ofrecerte una mejor experiencia.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-gray-400 mb-8">
            <FaClock className="text-yellow-400" />
            <span>Volveremos pronto. Gracias por tu paciencia.</span>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-medium mb-3">¿Qué estamos haciendo?</h3>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                Actualizando nuestros servidores para mayor velocidad
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                Implementando nuevas características
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                Mejorando la seguridad de la plataforma
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src={logo} alt="BlackStreaming" className="h-6 w-auto" />
              <span className="text-sm font-medium">BlackStreaming</span>
            </div>
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} BlackStreaming. Todos los Derechos Reservados.
            </div>
            <div className="text-sm text-gray-400 flex items-center">
              Desarrollado por Saiph
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Maintenance;