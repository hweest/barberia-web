// frontend/src/components/BookingModal.jsx
import React, { useState } from "react";
import { FaWhatsapp, FaUser, FaPhone, FaTimes } from "react-icons/fa";

function BookingModal({ isOpen, onClose, servicio, onSuccess }) {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================
  // ENVIAR RESERVA CON WHATSAPP
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!servicio || !servicio.servicio) {
      setError("Error: Servicio no válido");
      setLoading(false);
      return;
    }

    if (!formData.nombre || !formData.telefono) {
      setError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const fecha = now.toISOString().split("T")[0];
      const hora = now.toTimeString().slice(0, 5);

      const reservaData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        servicio: servicio.servicio.trim(),
        fecha: fecha,
        hora: hora,
        mensaje: `Reserva desde el botón de WhatsApp para: ${servicio.servicio}`,
      };

      console.log("📤 Enviando reserva:", reservaData);

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservaData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Error ${response.status}: ${response.statusText}`,
        );
      }

      console.log("✅ Reserva creada:", data);

      // ✅ USAR LA URL DE WHATSAPP QUE DEVUELVE EL BACKEND
      if (data.whatsappUrl) {
        window.location.href = data.whatsappUrl;
      } else {
        // Fallback
        const mensajeWhatsApp = `📋 *NUEVA RESERVA - BARBERÍA*

👤 *Cliente:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}
✂️ *Servicio:* ${servicio.servicio}
📅 *Fecha:* ${new Date().toLocaleDateString("es-ES")}
🕐 *Hora:* ${hora}
💬 *Mensaje:* Reserva desde el botón de WhatsApp

¡Esperamos tu confirmación! ✨`;

        window.open(
          `https://wa.me/5351028354?text=${encodeURIComponent(mensajeWhatsApp)}`,
          "_blank",
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Error al enviar la reserva");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #121212)",
          padding: "2.5rem",
          borderRadius: "25px",
          maxWidth: "450px",
          width: "100%",
          border: "1px solid rgba(212,167,98,0.2)",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "2rem",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.target.style.color = "#888")}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            {servicio?.icono || "✂️"}
          </div>
          <h3 style={{ color: "white", marginBottom: "0.3rem" }}>
            {servicio?.servicio || "Servicio"}
          </h3>
          <p
            style={{ color: "#d4a762", fontSize: "1.2rem", fontWeight: "600" }}
          >
            {servicio?.precio || "S/ 0"}
          </p>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            {servicio?.descripcion || "Sin descripción"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              style={{
                color: "#ccc",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              <FaUser /> Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            />
          </div>

          <div className="form-group">
            <label
              style={{
                color: "#ccc",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              <FaPhone /> Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="+53 51028354"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "#ffffff",
                fontSize: "1rem",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255,0,0,0.1)",
                border: "1px solid #ff4444",
                color: "#ff4444",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #25D366, #1da851)",
              border: "none",
              borderRadius: "50px",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 5px 25px rgba(37, 211, 102, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px) scale(1.02)";
                e.target.style.boxShadow =
                  "0 10px 40px rgba(37, 211, 102, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 5px 25px rgba(37, 211, 102, 0.3)";
            }}
          >
            <FaWhatsapp size={20} />
            {loading ? "Enviando..." : "Reservar por WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
