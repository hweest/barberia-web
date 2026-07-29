// src/components/Services.jsx
import React, { useEffect } from "react";
import {
  FaCut,
  FaUser,
  FaBrush,
  FaMagic,
  FaFire,
  FaWhatsapp,
} from "react-icons/fa";

const servicesData = [
  {
    title: "Corte de Cabello",
    description: "Corte moderno y personalizado según tu estilo.",
    price: "200 CUP ",
    icon: <FaCut />,
    border: "border-gold", // ← Borde dorado
  },
  {
    title: "Arreglo de Barba",
    description: "Diseño y mantenimiento profesional de barba.",
    price: "100 CUP ",
    icon: <FaUser />,
    border: "border-silver", // ← Borde plateado
  },
  {
    title: "Corte a Domicilio",
    description: "Corte a la Orden.",
    price: "500 CUP ",
    icon: <FaMagic />,
    border: "border-fire", // ← Borde fuego
  },
];

function Services() {
  const handleReserva = (servicio) => {
    window.open(
      `https://wa.me/5351028354?text=Hola, quiero reservar una cita para: ${servicio}`,
      "_blank",
    );
  };

  // Efecto para animación al scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

        <div className="services-grid">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className={`service-card card-3d card-shine scroll-animate animate-delay-${(index % 5) + 1} ${service.border}`}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-price">{service.price}</span>
              <button
                className="btn-service"
                onClick={() => handleReserva(service.title)}
              >
                <FaWhatsapp /> Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
