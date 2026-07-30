// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaCut } from "react-icons/fa";

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

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaCut className="logo-icon" />
          <span>Barbería</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              Inicio
            </Link>
          </li>
          <li className="nav-item">
            <a
              href="#servicios"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Servicios
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#galeria"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Galería
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#testimonios"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Testimonios
            </a>
          </li>
          {/* ❌ ELIMINADO: Botón "Reservar Cita" */}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
