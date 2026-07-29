import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <h3>Barbería</h3>
            <p>
              Transformamos tu estilo con cortes modernos y arreglo de barba
              profesional. Calidad y elegancia en cada servicio.
            </p>
            <div className="footer-social">
              <a href="#">
                <FaFacebook />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li>
                <a href="#servicios">Servicios</a>
              </li>
              <li>
                <a href="#galeria">Galería</a>
              </li>
              <li>
                <a href="#testimonios">Testimonios</a>
              </li>
              <li>
                <a href="#reservar">Reservar Cita</a>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contacto</h4>
            <p>
              <FaMapMarkerAlt /> Quintin Banderas #19 , Ranchuelo , Villa Clara
              , Cuba
            </p>
            <p>
              <FaWhatsapp /> +53 51028354
            </p>
            <p>
              <FaEnvelope /> info@barberia.com
            </p>
          </div>

          <div className="footer-hours">
            <h4>Horario</h4>
            <p>
              <FaClock /> Lunes - Viernes: 9:00 - 20:00
            </p>
            <p>
              <FaClock /> Sábados: 9:00 - 18:00
            </p>
            <p>
              <FaClock /> Domingos: Cerrado
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Barbería. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
