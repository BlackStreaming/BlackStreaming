import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FiUser, FiMail, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX, FiEye, FiEyeOff, FiPhone } from "react-icons/fi";
import { FaSignInAlt, FaUserPlus, FaSun, FaMoon } from "react-icons/fa";
import logo from "../images/logo.png";
import { motion } from "framer-motion";

// Comprehensive list of countries with phone codes and flags
const countryCodes = [
  { code: "+93", name: "Afghanistan", flag: "🇦🇫" },
  { code: "+355", name: "Albania", flag: "🇦🇱" },
  { code: "+213", name: "Algeria", flag: "🇩🇿" },
  { code: "+376", name: "Andorra", flag: "🇦🇩" },
  { code: "+244", name: "Angola", flag: "🇦🇴" },
  { code: "+1", name: "Antigua and Barbuda", flag: "🇦🇬" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+374", name: "Armenia", flag: "🇦🇲" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+994", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "+1", name: "Bahamas", flag: "🇧🇸" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+1", name: "Barbados", flag: "🇧🇧" },
  { code: "+375", name: "Belarus", flag: "🇧🇾" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+501", name: "Belize", flag: "🇧🇿" },
  { code: "+229", name: "Benin", flag: "🇧🇯" },
  { code: "+975", name: "Bhutan", flag: "🇧🇹" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "+387", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "+267", name: "Botswana", flag: "🇧🇼" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+673", name: "Brunei", flag: "🇧🇳" },
  { code: "+359", name: "Bulgaria", flag: "🇧🇬" },
  { code: "+226", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "+257", name: "Burundi", flag: "🇧🇮" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "+237", name: "Cameroon", flag: "🇨🇲" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+238", name: "Cape Verde", flag: "🇨🇻" },
  { code: "+236", name: "Central African Republic", flag: "🇨🇫" },
  { code: "+235", name: "Chad", flag: "🇹🇩" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+269", name: "Comoros", flag: "🇰🇲" },
  { code: "+243", name: "Congo, Democratic Republic", flag: "🇨🇩" },
  { code: "+242", name: "Congo, Republic", flag: "🇨🇬" },
  { code: "+506", name: "Costa Rica", flag: "🇨🇷" },
  { code: "+385", name: "Croatia", flag: "🇭🇷" },
  { code: "+53", name: "Cuba", flag: "🇨🇺" },
  { code: "+357", name: "Cyprus", flag: "🇨🇾" },
  { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+253", name: "Djibouti", flag: "🇩🇯" },
  { code: "+1", name: "Dominica", flag: "🇩🇲" },
  { code: "+1", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "+670", name: "East Timor", flag: "🇹🇱" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+503", name: "El Salvador", flag: "🇸🇻" },
  { code: "+240", name: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+291", name: "Eritrea", flag: "🇪🇷" },
  { code: "+372", name: "Estonia", flag: "🇪🇪" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+679", name: "Fiji", flag: "🇫🇯" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+241", name: "Gabon", flag: "🇬🇦" },
  { code: "+220", name: "Gambia", flag: "🇬🇲" },
  { code: "+995", name: "Georgia", flag: "🇬🇪" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+1", name: "Grenada", flag: "🇬🇩" },
  { code: "+502", name: "Guatemala", flag: "🇬🇹" },
  { code: "+224", name: "Guinea", flag: "🇬🇳" },
  { code: "+245", name: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+592", name: "Guyana", flag: "🇬🇾" },
  { code: "+509", name: "Haiti", flag: "🇭🇹" },
  { code: "+504", name: "Honduras", flag: "🇭🇳" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "+354", name: "Iceland", flag: "🇮🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+98", name: "Iran", flag: "🇮🇷" },
  { code: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+1", name: "Jamaica", flag: "🇯🇲" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+7", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+686", name: "Kiribati", flag: "🇰🇮" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+996", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "+856", name: "Laos", flag: "🇱🇦" },
  { code: "+371", name: "Latvia", flag: "🇱🇻" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+266", name: "Lesotho", flag: "🇱🇸" },
  { code: "+231", name: "Liberia", flag: "🇱🇷" },
  { code: "+218", name: "Libya", flag: "🇱🇾" },
  { code: "+423", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "+370", name: "Lithuania", flag: "🇱🇹" },
  { code: "+352", name: "Luxembourg", flag: "🇱🇺" },
  { code: "+853", name: "Macau", flag: "🇲🇴" },
  { code: "+389", name: "Macedonia", flag: "🇲🇰" },
  { code: "+261", name: "Madagascar", flag: "🇲🇬" },
  { code: "+265", name: "Malawi", flag: "🇲🇼" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+960", name: "Maldives", flag: "🇲🇻" },
  { code: "+223", name: "Mali", flag: "🇲🇱" },
  { code: "+356", name: "Malta", flag: "🇲🇹" },
  { code: "+692", name: "Marshall Islands", flag: "🇲🇭" },
  { code: "+222", name: "Mauritania", flag: "🇲🇷" },
  { code: "+230", name: "Mauritius", flag: "🇲🇺" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+691", name: "Micronesia", flag: "🇫🇲" },
  { code: "+373", name: "Moldova", flag: "🇲🇩" },
  { code: "+377", name: "Monaco", flag: "🇲🇨" },
  { code: "+976", name: "Mongolia", flag: "🇲🇳" },
  { code: "+382", name: "Montenegro", flag: "🇲🇪" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+258", name: "Mozambique", flag: "🇲🇿" },
  { code: "+95", name: "Myanmar", flag: "🇲🇲" },
  { code: "+264", name: "Namibia", flag: "🇳🇦" },
  { code: "+674", name: "Nauru", flag: "🇳🇷" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+505", name: "Nicaragua", flag: "🇳🇮" },
  { code: "+227", name: "Niger", flag: "🇳🇪" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+680", name: "Palau", flag: "🇵🇼" },
  { code: "+507", name: "Panama", flag: "🇵🇦" },
  { code: "+675", name: "Papua New Guinea", flag: "🇵🇬" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+1", name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { code: "+1", name: "Saint Lucia", flag: "🇱🇨" },
  { code: "+1", name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
  { code: "+685", name: "Samoa", flag: "🇼🇸" },
  { code: "+378", name: "San Marino", flag: "🇸🇲" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+381", name: "Serbia", flag: "🇷🇸" },
  { code: "+248", name: "Seychelles", flag: "🇸🇨" },
  { code: "+232", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+421", name: "Slovakia", flag: "🇸🇰" },
  { code: "+386", name: "Slovenia", flag: "🇸🇮" },
  { code: "+677", name: "Solomon Islands", flag: "🇸🇧" },
  { code: "+252", name: "Somalia", flag: "🇸🇴" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+211", name: "South Sudan", flag: "🇸🇸" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "+597", name: "Suriname", flag: "🇸🇷" },
  { code: "+268", name: "Swaziland", flag: "🇸🇿" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+963", name: "Syria", flag: "🇸🇾" },
  { code: "+886", name: "Taiwan", flag: "🇹🇼" },
  { code: "+992", name: "Tajikistan", flag: "🇹🇯" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+228", name: "Togo", flag: "🇹🇬" },
  { code: "+676", name: "Tonga", flag: "🇹🇴" },
  { code: "+1", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+993", name: "Turkmenistan", flag: "🇹🇲" },
  { code: "+688", name: "Tuvalu", flag: "🇹🇻" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+998", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "+678", name: "Vanuatu", flag: "🇻🇺" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+967", name: "Yemen", flag: "🇾🇪" },
  { code: "+260", name: "Zambia", flag: "🇿🇲" },
  { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },
];

// Theme Context
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+51"); // Default to Peru
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
      if (!phone || !/^\d{7,15}$/.test(phone)) {
        throw new Error("Por favor, ingresa un número de teléfono válido (7-15 dígitos).");
      }
      if (!["user", "affiliate", "provider"].includes(role)) {
        throw new Error("Rol no válido.");
      }

      await setDoc(doc(db, "pendingRegistrations", email), {
        username: username,
        email: email,
        password: password,
        phone: `${countryCode}${phone}`,
        role: role,
        status: "pending",
        referrerCode: referrerCode || null,
        createdAt: new Date().toISOString(),
      });

      setModal({
        isOpen: true,
        message: "Tu solicitud de registro ha sido enviada y está pendiente de aprobación. Comunicate con +51 931 757 531",
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
            V 2.0
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
                Número de Teléfono
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-shrink-0 w-48">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl ${
                      theme === "dark" ? "bg-gray-700/50 text-white" : "bg-gray-200/50 text-gray-900"
                    } border ${
                      theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                    } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all appearance-none`}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code + country.name} value={country.code}>
                        {country.flag} {country.name} ({country.code})
                      </option>
                    ))}
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
                <div className="relative flex-grow">
                  <FiPhone
                    className={`absolute top-3 left-3 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    } border ${
                      theme === "dark" ? "border-gray-600/50" : "border-gray-400/50"
                    } focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 shadow-md backdrop-blur-sm transition-all ${
                      theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-600"
                    } focus:placeholder-opacity-100`}
                    placeholder="Tu número de teléfono"
                    required
                  />
                </div>
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