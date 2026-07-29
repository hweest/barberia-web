// frontend/src/components/AdminLogin.jsx
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("hectorpedraza624@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // ============================================
  // LOGIN
  // ============================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RECUPERAR CONTRASEÑA
  // ============================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/request-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setResetMessage("✅ Se ha enviado un correo con las instrucciones");
        setTimeout(() => {
          setShowReset(false);
          setResetMessage("");
        }, 5000);
      } else {
        setError(data.message || "Error al enviar correo");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDERIZAR
  // ============================================
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #121212)",
          padding: "3rem",
          borderRadius: "25px",
          maxWidth: "450px",
          width: "100%",
          border: "1px solid rgba(212,167,98,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "white", fontSize: "2.5rem" }}>
            ✂️ <span style={{ color: "#d4a762" }}>Barbería</span>
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Panel de Administración
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            style={{
              background: "rgba(255,0,0,0.1)",
              border: "1px solid #ff4444",
              color: "#ff4444",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {resetMessage && (
          <div
            style={{
              background: "rgba(76, 175, 80, 0.1)",
              border: "1px solid #4CAF50",
              color: "#4CAF50",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {resetMessage}
          </div>
        )}

        {!showReset ? (
          // ===== FORMULARIO DE LOGIN =====
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                <FaEnvelope /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hectorpedraza624@gmail.com"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                <FaLock /> Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    paddingRight: "45px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #d4a762, #b8923a)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "50px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Cargando..." : "🔓 Iniciar Sesión"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setResetEmail("");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          // ===== FORMULARIO DE RECUPERACIÓN =====
          <form onSubmit={handleResetPassword}>
            <h3 style={{ color: "white", marginBottom: "1rem" }}>
              🔐 Recuperar Contraseña
            </h3>
            <p
              style={{
                color: "#888",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                <FaEnvelope /> Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="hectorpedraza624@gmail.com"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #25D366, #1da851)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Enviando..." : "📧 Enviar correo"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ← Volver al login
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "1.5rem",
          }}
        >
          <p style={{ color: "#444", fontSize: "0.8rem" }}>
            Barbería - Panel de Administración
          </p>
          <p style={{ color: "#333", fontSize: "0.7rem" }}>
            Email: hectorpedraza624@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
