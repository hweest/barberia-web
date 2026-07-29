import React, { useState, useEffect } from "react";
import { FaCut, FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleReserva = () => {
    window.open(
      "https://wa.me/5351028354?text=¡Hola! Quiero agendar una cita en la barbería.",
      "_blank",
    );
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <FaCut className="logo-icon" />
          <span>Barbería</span>
        </a>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
          <li>
            <a href="#" className="nav-link" onClick={() => setIsOpen(false)}>
              Inicio
            </a>
          </li>
          <li>
            <a
              href="#servicios"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Servicios
            </a>
          </li>
          <li>
            <a
              href="#galeria"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Galería
            </a>
          </li>
          <li>
            <a
              href="#testimonios"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Testimonios
            </a>
          </li>
          <li>
            <button className="nav-link btn-reservar" onClick={handleReserva}>
              <FaWhatsapp /> Reservar Cita
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
