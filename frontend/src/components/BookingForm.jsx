// frontend/src/components/BookingForm.jsx
import React, { useState } from "react";
import {
  FaWhatsapp,
  FaUser,
  FaPhone,
  FaCalendar,
  FaClock,
  FaComments,
} from "react-icons/fa";

function BookingForm() {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Guardar la reserva en la base de datos
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar la reserva");
      }

      // 2. Abrir WhatsApp con el mensaje de confirmación (para el cliente)
      const mensajeCliente = `📋 *NUEVA RESERVA - BARBERÍA*

👤 *Nombre:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}
✂️ *Servicio:* ${formData.servicio}
📅 *Fecha:* ${formData.fecha}
🕐 *Hora:* ${formData.hora}
💬 *Mensaje:* ${formData.mensaje || "Sin mensaje adicional"}

¡Esperamos tu confirmación! ✨`;

      window.open(
        `https://wa.me/5351028354?text=${encodeURIComponent(mensajeCliente)}`,
        "_blank",
      );

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="booking-success">
        <h2>✅ ¡Reserva Enviada!</h2>
        <p>Tu mensaje ha sido enviado a nuestro WhatsApp.</p>
        <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "1rem" }}>
          Te contactaremos en breve para confirmar tu cita.
        </p>
        <a href="/" className="btn-primary">
          Volver al Inicio
        </a>
      </div>
    );
  }

  return (
    <section id="reservar" className="booking-form">
      <div className="container">
        <h2 className="section-title">
          Reserva tu <span>Cita</span>
        </h2>
        <div className="gold-line"></div>
        <p style={{ textAlign: "center", marginBottom: "2rem", color: "#888" }}>
          Completa el formulario y te contactaremos por WhatsApp
        </p>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>
              <FaUser /> Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="+53 51028354"
            />
          </div>

          <div className="form-group">
            <label>✂️ Servicio *</label>
            <select
              name="servicio"
              value={formData.servicio}
              onChange={handleChange}
              required
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

          <div className="form-row">
            <div className="form-group">
              <label>
                <FaCalendar /> Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label>
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
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaComments /> Mensaje Adicional (Opcional)
            </label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="3"
              placeholder="Comentarios o requerimientos especiales..."
            />
          </div>

          {error && (
            <div
              style={{
                background: "#ff4444",
                color: "white",
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
            className="btn-primary btn-full"
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
              boxShadow: "0 5px 25px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
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
            <FaWhatsapp size={24} />{" "}
            {loading ? "Enviando..." : "Enviar por WhatsApp"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.85rem",
              color: "#555",
            }}
          >
            Al enviar, serás redirigido a WhatsApp para confirmar tu cita
          </p>
        </form>
      </div>
    </section>
  );
}

export default BookingForm;
