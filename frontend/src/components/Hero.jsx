// frontend/src/components/Hero.jsx
import React, { useState } from "react";
import { FaCut, FaUser, FaStar, FaWhatsapp } from "react-icons/fa";
import BookingModal from "./BookingModal"; // ← Importar el Modal

function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReservaWhatsApp = () => {
    window.open(
      "https://wa.me/5351028354?text=¡Hola! Quiero agendar una cita en la barbería.",
      "_blank",
    );
  };

  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="highlight">Estilo</span> y <br />
              <span className="highlight">Elegancia</span> para Ti
            </h1>
            <p className="hero-subtitle">
              Cortes de cabello y arreglo de barba con los mejores estilistas.
              Transforma tu look con nosotros.
            </p>
            <div className="hero-buttons">
              {/* BOTÓN QUE ABRE EL MODAL DE RESERVA */}
              <button
                className="btn-primary"
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: "linear-gradient(135deg, #d4a762, #b8923a)",
                }}
              >
                📋 Reservar Cita
              </button>

              {/* BOTÓN QUE VA DIRECTAMENTE A WHATSAPP */}
              <button className="btn-secondary" onClick={handleReservaWhatsApp}>
                <FaWhatsapp /> WhatsApp
              </button>
            </div>
          </div>

          <div className="hero-features">
            <div className="feature-card">
              <FaCut className="feature-icon" />
              <h3>Cortes Modernos</h3>
              <p>Estilos actuales y personalizados</p>
            </div>
            <div className="feature-card">
              <FaUser className="feature-icon" />
              <h3>Arreglo de Barba</h3>
              <p>Diseño y mantenimiento profesional</p>
            </div>
            <div className="feature-card">
              <FaStar className="feature-icon" />
              <h3>Expertos</h3>
              <p>Barberos con años de experiencia</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE RESERVA */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default Hero;
