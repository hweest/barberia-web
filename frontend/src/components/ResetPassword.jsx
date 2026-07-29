// frontend/src/components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);

  // ============================================
  // VERIFICAR QUE EL TOKEN EXISTE
  // ============================================
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError("No hay token de recuperación. El enlace no es válido.");
    }
  }, [token]);

  // ============================================
  // RESTABLECER CONTRASEÑA
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Validar longitud
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/admin");
        }, 3000);
      } else {
        setError(data.message || "Error al restablecer la contraseña");
        if (data.message === "Token inválido o expirado") {
          setValidToken(false);
        }
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SI EL TOKEN ES INVÁLIDO
  // ============================================
  if (!validToken) {
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
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#ff4444", marginBottom: "1rem" }}>
            ❌ Enlace inválido
          </h2>
          <p style={{ color: "#888" }}>{error}</p>
          <p style={{ color: "#555", marginTop: "1rem" }}>
            El enlace de recuperación ha expirado o no es válido.
          </p>
          <button
            onClick={() => navigate("/admin")}
            style={{
              marginTop: "1.5rem",
              background: "var(--primary)",
              color: "#0a0a0a",
              border: "none",
              padding: "12px 30px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // SI LA CONTRASEÑA SE CAMBIÓ CON ÉXITO
  // ============================================
  if (success) {
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
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "rgba(76, 175, 80, 0.1)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <FaCheck size={40} color="#4CAF50" />
          </div>
          <h2 style={{ color: "#4CAF50", marginBottom: "1rem" }}>
            ✅ ¡Contraseña actualizada!
          </h2>
          <p style={{ color: "#888" }}>
            Tu contraseña ha sido restablecida exitosamente.
          </p>
          <p style={{ color: "#555", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Serás redirigido al login en unos segundos...
          </p>
          <button
            onClick={() => navigate("/admin")}
            style={{
              marginTop: "1.5rem",
              background: "var(--primary)",
              color: "#0a0a0a",
              border: "none",
              padding: "12px 30px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // FORMULARIO DE RESTABLECIMIENTO
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
          <h1 style={{ color: "white", fontSize: "2rem" }}>
            ✂️ <span style={{ color: "#d4a762" }}>Barbería</span>
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Restablecer Contraseña
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

        <form onSubmit={handleSubmit}>
          {/* Nueva contraseña */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                color: "#888",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              <FaLock /> Nueva Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
            <small style={{ color: "#555" }}>Mínimo 6 caracteres</small>
          </div>

          {/* Confirmar contraseña */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                color: "#888",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              <FaLock /> Confirmar Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
            {loading ? "Actualizando..." : "🔓 Restablecer Contraseña"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
              }}
            >
              ← Volver al Login
            </button>
          </div>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "1.5rem",
          }}
        >
          <p style={{ color: "#444", fontSize: "0.8rem" }}>
            Barbería - Estilo y Elegancia
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
