// frontend/src/components/BookingForm.jsx
import React, { useState, useEffect } from "react";
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

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorServices, setErrorServices] = useState("");
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

  // ============================================
  // CARGAR SERVICIOS DESDE LA BASE DE DATOS
  // ============================================
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        setErrorServices("");
        console.log("🔄 Cargando servicios desde:", `${API_URL}/api/prices`);

        const response = await fetch(`${API_URL}/api/prices`);
        const data = await response.json();

        console.log("📦 Respuesta de la API:", data);

        if (data.success) {
          console.log(`✅ ${data.data.length} servicios cargados:`, data.data);
          setServices(data.data);
        } else {
          console.error("❌ Error en la respuesta:", data.message);
          setErrorServices("Error al cargar los servicios: " + data.message);
          // Usar servicios de respaldo si la API falla
          setServices([
            { servicio: "Corte de Cabello", precio: "S/ 40", icono: "✂️" },
            { servicio: "Arreglo de Barba", precio: "S/ 30", icono: "🧔" },
            { servicio: "Combo Completo", precio: "S/ 60", icono: "✨" },
            { servicio: "Teñido", precio: "S/ 80", icono: "🎨" },
            { servicio: "Ceremonia de Afeitado", precio: "S/ 50", icono: "🔥" },
          ]);
        }
      } catch (err) {
        console.error("❌ Error al cargar servicios:", err);
        setErrorServices(
          "Error al conectar con el servidor. Usando servicios de respaldo.",
        );
        // Servicios de respaldo en caso de error de conexión
        setServices([
          { servicio: "Corte de Cabello", precio: "S/ 40", icono: "✂️" },
          { servicio: "Arreglo de Barba", precio: "S/ 30", icono: "🧔" },
          { servicio: "Combo Completo", precio: "S/ 60", icono: "✨" },
          { servicio: "Teñido", precio: "S/ 80", icono: "🎨" },
          { servicio: "Ceremonia de Afeitado", precio: "S/ 50", icono: "🔥" },
        ]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

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

      // 2. Abrir WhatsApp con el mensaje de confirmación
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

        {errorServices && (
          <div
            style={{
              background: "rgba(255, 165, 0, 0.1)",
              border: "1px solid #ffa500",
              color: "#ffa500",
              padding: "10px 15px",
              borderRadius: "10px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            ⚠️ {errorServices}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label style={{ color: "#ccc" }}>
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
            <label style={{ color: "#ccc" }}>
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

          <div className="form-group">
            <label style={{ color: "#ccc" }}>✂️ Servicio *</label>
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
                color: "#ffffff",
                fontSize: "1rem",
                appearance: "auto",
                WebkitAppearance: "auto",
                MozAppearance: "auto",
              }}
            >
              <option value="" style={{ background: "#1a1a1a", color: "#888" }}>
                {loadingServices
                  ? "Cargando servicios..."
                  : "Selecciona un servicio"}
              </option>
              {services.map((service) => (
                <option
                  key={service.id || service._id || service.servicio}
                  value={service.servicio}
                  style={{
                    background: "#1a1a1a",
                    color: "#ffffff",
                    padding: "10px",
                  }}
                >
                  {service.icono || "✂️"} {service.servicio} - {service.precio}
                </option>
              ))}
            </select>
            {loadingServices && (
              <p
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                Cargando servicios disponibles...
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ color: "#ccc" }}>
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
                  color: "#ffffff",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: "#ccc" }}>
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
                  color: "#ffffff",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: "#ccc" }}>
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
                color: "#ffffff",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit",
              }}
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
              boxShadow: "0 5px 25px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
              width: "100%",
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
