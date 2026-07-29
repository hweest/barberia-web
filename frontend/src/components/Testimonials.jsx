// src/components/Testimonials.jsx
import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
} from "react-icons/fa";

const testimonialsData = [
  {
    name: "Carlos Rodríguez",
    role: "Cliente Frecuente",
    text: "Excelente servicio, siempre salgo satisfecho con mi corte. Los barberos son muy profesionales.",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Miguel Ángel",
    role: "Cliente Frecuente",
    text: "La mejor barbería de la ciudad. Ambiente agradable y atención de primera.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Javier Fernández",
    role: "Nuevo Cliente",
    text: "Mi primera vez y quedé encantado. Me hicieron un corte espectacular.",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length,
    );
  };

  const handleReserva = () => {
    window.open(
      "https://wa.me/5351028354?text=¡Hola! Quiero agendar una cita en la barbería.",
      "_blank",
    );
  };

  return (
    <section id="testimonios" className="testimonials">
      <div className="container">
        <h2 className="section-title">
          Lo que dicen <span>nuestros clientes</span>
        </h2>
        <div className="gold-line"></div>

        <div className="testimonial-slider">
          <button className="slider-btn prev" onClick={prevTestimonial}>
            <FaChevronLeft />
          </button>

          <div className="testimonial-card card-glow card-3d scroll-animate">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <p className="testimonial-text">
              "{testimonialsData[currentIndex].text}"
            </p>
            <div className="testimonial-author">
              <img
                src={testimonialsData[currentIndex].avatar}
                alt={testimonialsData[currentIndex].name}
              />
              <div>
                <h4>{testimonialsData[currentIndex].name}</h4>
                <span>{testimonialsData[currentIndex].role}</span>
              </div>
            </div>
          </div>

          <button className="slider-btn next" onClick={nextTestimonial}>
            <FaChevronRight />
          </button>
        </div>

        <div className="slider-dots">
          {testimonialsData.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button
            className="btn-primary"
            onClick={handleReserva}
            style={{ background: "linear-gradient(135deg, #25D366, #1da851)" }}
          >
            <FaWhatsapp /> Reservar tu Cita
          </button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
