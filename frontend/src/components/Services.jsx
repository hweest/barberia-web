// frontend/src/components/Services.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

function Services() {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CARGAR SERVICIOS DESDE LA BASE DE DATOS
  // ============================================
  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/prices`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      } else {
        setError("Error al cargar servicios");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleReservaWhatsApp = (servicio) => {
    window.open(
      `https://wa.me/5351028354?text=Hola, quiero reservar una cita para: ${servicio}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <section id="servicios" className="services">
        <div className="container">
          <h2 className="section-title">
            Nuestros <span>Servicios</span>
          </h2>
          <div className="gold-line"></div>
          <p style={{ textAlign: "center", color: "#888" }}>
            Cargando servicios...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="services">
      <div className="container">
        <h2 className="section-title">
          Nuestros <span>Servicios</span>
        </h2>
        <div className="gold-line"></div>
        <p className="section-subtitle">
          Ofrecemos servicios de primera calidad para realzar tu estilo
        </p>

        {error && (
          <div
            style={{
              background: "#ff4444",
              color: "white",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id || service._id} className="service-card">
              <div className="service-icon" style={{ fontSize: "3rem" }}>
                {service.icono || "✂️"}
              </div>
              <h3>{service.servicio}</h3>
              <p>{service.descripcion || "Sin descripción"}</p>
              <span className="service-price">{service.precio}</span>
              <button
                className="btn-service"
                onClick={() => handleReservaWhatsApp(service.servicio)}
                style={{
                  background: "linear-gradient(135deg, #25D366, #1da851)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: "0.95rem",
                  padding: "12px 35px",
                  borderRadius: "50px",
                  color: "white",
                  fontWeight: "600",
                  boxShadow: "0 5px 20px rgba(37, 211, 102, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px) scale(1.02)";
                  e.target.style.boxShadow =
                    "0 10px 30px rgba(37, 211, 102, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow =
                    "0 5px 20px rgba(37, 211, 102, 0.2)";
                }}
              >
                <FaWhatsapp size={18} /> Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
