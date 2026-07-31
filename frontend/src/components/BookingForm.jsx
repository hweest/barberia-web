// frontend/src/components/BookingForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaWhatsapp,
  FaUser,
  FaPhone,
  FaCalendar,
  FaClock,
  FaComments,
  FaChevronDown,
} from "react-icons/fa";

function BookingForm() {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const dropdownRef = useRef(null);

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
        console.log("🔄 Cargando servicios...");
        const response = await fetch(`${API_URL}/api/prices`);
        const data = await response.json();

        console.log("📦 Servicios recibidos:", data);

        if (data.success) {
          setServices(data.data);
          console.log(`✅ ${data.data.length} servicios cargados`);
        } else {
          console.error("❌ Error:", data.message);
        }
      } catch (err) {
        console.error("❌ Error al cargar servicios:", err);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // ============================================
  // CERRAR DROPDOWN AL HACER CLICK FUERA
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (service) => {
    setSelectedService(service.servicio);
    setFormData({
      ...formData,
      servicio: service.servicio,
    });
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================
  // ENVIAR RESERVA CON WHATSAPP (CON CONFIRMACIÓN)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("📤 Enviando reserva:", formData);

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

      console.log("✅ Reserva creada:", data);

      // ✅ PREGUNTAR ANTES DE ABRIR WHATSAPP
      let whatsappUrl = null;

      if (data.whatsappUrl) {
        whatsappUrl = data.whatsappUrl;
      } else {
        // Fallback: construir mensaje manualmente
        const mensajeCliente = `📋 *NUEVA RESERVA - BARBERÍA*

👤 *Nombre:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}
✂️ *Servicio:* ${formData.servicio}
📅 *Fecha:* ${formData.fecha}
🕐 *Hora:* ${formData.hora}
💬 *Mensaje:* ${formData.mensaje || "Sin mensaje adicional"}

¡Esperamos tu confirmación! ✨`;

        whatsappUrl = `https://wa.me/5351028354?text=${encodeURIComponent(mensajeCliente)}`;
      }

      // ✅ PREGUNTAR SI QUIERE ENVIAR NOTIFICACIÓN POR WHATSAPP
      if (window.confirm("¿Deseas enviar la reserva por WhatsApp?")) {
        window.location.href = whatsappUrl;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("❌ Error al enviar reserva:", err);
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

          {/* ============================================
          SELECTOR PERSONALIZADO DE SERVICIOS
          ============================================ */}
          <div className="form-group" ref={dropdownRef}>
            <label style={{ color: "#ccc" }}>✂️ Servicio *</label>
            <div
              style={{
                position: "relative",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  color: selectedService ? "#ffffff" : "#888",
                  fontSize: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none",
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212, 167, 98, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <span>
                  {loadingServices
                    ? "Cargando servicios..."
                    : selectedService || "Selecciona un servicio"}
                </span>
                <FaChevronDown
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    color: "#888",
                  }}
                />
              </div>

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 5px)",
                    left: 0,
                    right: 0,
                    maxHeight: "250px",
                    overflowY: "auto",
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    zIndex: 100,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {loadingServices ? (
                    <div
                      style={{
                        padding: "12px 16px",
                        color: "#888",
                        textAlign: "center",
                      }}
                    >
                      Cargando servicios...
                    </div>
                  ) : services.length === 0 ? (
                    <div
                      style={{
                        padding: "12px 16px",
                        color: "#ffa500",
                        textAlign: "center",
                      }}
                    >
                      No hay servicios disponibles
                    </div>
                  ) : (
                    services.map((service) => (
                      <div
                        key={service._id || service.id || service.servicio}
                        onClick={() => handleSelect(service)}
                        style={{
                          padding: "12px 16px",
                          color: "#ffffff",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(212, 167, 98, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span>
                          {service.icono || "✂️"} {service.servicio}
                        </span>
                        <span style={{ color: "#d4a762", fontWeight: "600" }}>
                          {service.precio}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {!loadingServices && services.length === 0 && (
              <p
                style={{
                  color: "#ffa500",
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                ⚠️ No hay servicios disponibles. Agrega servicios desde el panel
                de administración.
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
