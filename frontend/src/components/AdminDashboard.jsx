// frontend/src/components/AdminDashboard.jsx
import React, { useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import AdminGallery from "./AdminGallery";

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("reservas");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar reservas
  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError("Error al cargar las reservas");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadBookings();
  }, []);

  // ... (el resto del código de reservas que ya tenías)

  return (
    <section
      style={{
        padding: "120px 20px 80px",
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            Panel de <span>Administración</span>
          </h2>
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,0,0,0.1)",
              color: "#ff4444",
              border: "1px solid rgba(255,0,0,0.2)",
              padding: "10px 20px",
              borderRadius: "50px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("reservas")}
            style={{
              background:
                activeTab === "reservas" ? "var(--primary)" : "transparent",
              color: activeTab === "reservas" ? "#0a0a0a" : "#888",
              border: "none",
              padding: "10px 25px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: activeTab === "reservas" ? "600" : "400",
            }}
          >
            📋 Reservas
          </button>
          <button
            onClick={() => setActiveTab("galeria")}
            style={{
              background:
                activeTab === "galeria" ? "var(--primary)" : "transparent",
              color: activeTab === "galeria" ? "#0a0a0a" : "#888",
              border: "none",
              padding: "10px 25px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: activeTab === "galeria" ? "600" : "400",
            }}
          >
            🖼️ Galería
          </button>
        </div>

        {/* Contenido */}
        {activeTab === "reservas" && (
          <div>
            {/* Aquí va el código de la tabla de reservas */}
            <p style={{ color: "#888" }}>Total: {bookings.length} reservas</p>
            {/* ... resto del código de reservas */}
          </div>
        )}

        {activeTab === "galeria" && <AdminGallery />}
      </div>
    </section>
  );
}

export default AdminDashboard;
