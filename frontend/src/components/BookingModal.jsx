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
      // Guardar en la base de datos
      const response = await fetch("http://localhost:5000/api/bookings", {
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

      // Abrir WhatsApp
      const mensajeWhatsApp = `📋 *NUEVA RESERVA - BARBERÍA*

👤 *Nombre:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}
✂️ *Servicio:* ${formData.servicio}
📅 *Fecha:* ${formData.fecha}
🕐 *Hora:* ${formData.hora}
💬 *Mensaje:* ${formData.mensaje || "Sin mensaje adicional"}`;

      window.open(
        `https://wa.me/5351028354?text=${encodeURIComponent(mensajeWhatsApp)}`,
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
          <div className="booking-success">
            <h2>✅ ¡Reserva Enviada!</h2>
            <p>Tu mensaje ha sido enviado a nuestro WhatsApp.</p>
            <button className="btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h2 className="section-title">
          Reserva tu <span>Cita</span>
        </h2>
        <div className="gold-line"></div>

        <form onSubmit={handleSubmit}>
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

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            <FaWhatsapp /> {loading ? "Enviando..." : "Enviar por WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
