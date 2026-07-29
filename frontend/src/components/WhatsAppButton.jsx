import React from "react";
import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5351028354?text=¡Hola! Quiero agendar una cita en la barbería."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 999,
        backgroundColor: "#25D366",
        color: "white",
        width: "65px",
        height: "65px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        boxShadow: "0 10px 30px rgba(37, 211, 102, 0.4)",
        transition: "all 0.3s ease",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = "0 15px 40px rgba(37, 211, 102, 0.6)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0 10px 30px rgba(37, 211, 102, 0.4)";
      }}
    >
      <FaWhatsapp size={35} />
    </a>
  );
}

export default WhatsAppButton;
