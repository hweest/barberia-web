// frontend/src/components/BookingModal.jsx
import React, { useState } from "react";
import {
  FaTimes,
  FaWhatsapp,
  FaUser,
  FaPhone,
  FaCalendar,
  FaClock,
  FaComments,
} from "react-icons/fa";

function BookingModal({ isOpen, onClose }) {
  // ✅ URL del backend (hardcodeada temporalmente para pruebas)
  const API_URL = "https://barberia-backend-jh00.onrender.com";
  // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    servicio: "",
    fecha: "",
    hora: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al guardar");

      const mensaje = `📋 *NUEVA RESERVA - BARBERÍA*\n\n👤 *Nombre:* ${formData.nombre}\n📱 *Teléfono:* ${formData.telefono}\n✂️ *Servicio:* ${formData.servicio}\n📅 *Fecha:* ${formData.fecha}\n🕐 *Hora:* ${formData.hora}\n💬 *Mensaje:* ${formData.mensaje || "Sin mensaje"}`;

      window.open(
        `https://wa.me/5351028354?text=${encodeURIComponent(mensaje)}`,
        "_blank",
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          animation: "modalFadeIn 0.3s ease",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #121212)",
            padding: "3rem",
            borderRadius: "25px",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid rgba(212,167,98,0.2)",
            textAlign: "center",
            position: "relative",
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
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <h2 style={{ color: "#d4a762", fontSize: "2rem" }}>
            ✅ ¡Reserva Enviada!
          </h2>
          <p style={{ color: "#888", margin: "1rem 0" }}>
            Tu mensaje ha sido enviado a nuestro WhatsApp.
          </p>
          <button
            onClick={onClose}
            style={{
              background: "#d4a762",
              color: "#0a0a0a",
              padding: "12px 40px",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

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
        zIndex: 99999,
        padding: "20px",
        animation: "modalFadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #121212)",
          padding: "2.5rem",
          borderRadius: "25px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid rgba(212,167,98,0.2)",
          position: "relative",
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
            color: "white",
            fontSize: "2rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            textAlign: "center",
            color: "white",
            marginBottom: "0.5rem",
          }}
        >
          Reserva tu <span style={{ color: "#d4a762" }}>Cita</span>
        </h2>
        <div
          style={{
            width: "80px",
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #d4a762, transparent)",
            margin: "15px auto 30px",
            borderRadius: "2px",
          }}
        ></div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#ccc",
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
                color: "white",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#ccc",
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
                color: "white",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#ccc",
              }}
            >
              ✂️ Servicio *
            </label>
            <select
              name="servicio"
              value={formData.servicio}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "white",
                fontSize: "1rem",
              }}
            >
              <option value="">Selecciona un servicio</option>
              <option value="Corte de Cabello">Corte de Cabello</option>
              <option value="Arreglo de Barba">Arreglo de Barba</option>
              <option value="Combo Completo">Combo Completo</option>
              <option value="Teñido">Teñido</option>
              <option value="Ceremonia de Afeitado">
                Ceremonia de Afeitado
              </option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#ccc",
                }}
              >
                <FaCalendar /> Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#ccc",
                }}
              >
                <FaClock /> Hora *
              </label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
                min="09:00"
                max="20:00"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#ccc",
              }}
            >
              <FaComments /> Mensaje Adicional (Opcional)
            </label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="3"
              placeholder="Comentarios o requerimientos especiales..."
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                color: "white",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255,0,0,0.1)",
                border: "1px solid #ff4444",
                color: "#ff4444",
                padding: "10px 15px",
                borderRadius: "10px",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #25D366, #1da851)",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontSize: "1.1rem",
              padding: "16px",
              borderRadius: "50px",
              color: "white",
              fontWeight: "600",
              boxShadow: "0 5px 25px rgba(37,211,102,0.3)",
              transition: "all 0.3s ease",
              width: "100%",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            <FaWhatsapp size={24} />{" "}
            {loading ? "Enviando..." : "Enviar por WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
