// frontend/src/components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaSync,
  FaWhatsapp,
  FaSignOutAlt,
} from "react-icons/fa";
import AdminGallery from "./AdminGallery";

function AdminDashboard({ onLogout }) {
  // ✅ URL definitiva del backend en Render
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [activeTab, setActiveTab] = useState("reservas");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CARGAR RESERVAS
  // ============================================
  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bookings`, {
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

  useEffect(() => {
    loadBookings();
  }, []);

  // ============================================
  // ACTUALIZAR ESTADO
  // ============================================
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (response.ok) {
        loadBookings();
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  // ============================================
  // ELIMINAR RESERVA
  // ============================================
  const deleteBooking = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reserva?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (response.ok) {
        loadBookings();
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // ============================================
  // WHATSAPP
  // ============================================
  const openWhatsApp = (telefono, nombre) => {
    const mensaje = `Hola ${nombre}, soy de la barbería. Te confirmo tu cita.`;
    window.open(
      `https://wa.me/${telefono.replace("+", "")}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
  };

  // ============================================
  // FORMATEAR FECHA
  // ============================================
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================
  // OBTENER COLOR Y TEXTO DEL ESTADO
  // ============================================
  const getStatusColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "#ffa500";
      case "confirmada":
        return "#4CAF50";
      case "completada":
        return "#2196F3";
      case "cancelada":
        return "#f44336";
      default:
        return "#888";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "pendiente":
        return "⏳ Pendiente";
      case "confirmada":
        return "✅ Confirmada";
      case "completada":
        return "📌 Completada";
      case "cancelada":
        return "❌ Cancelada";
      default:
        return estado;
    }
  };

  // ============================================
  // RENDERIZAR RESERVAS
  // ============================================
  const renderBookings = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          Cargando reservas...
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            background: "#ff4444",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <h3>No hay reservas aún</h3>
          <p>Las reservas aparecerán aquí cuando los clientes se registren.</p>
        </div>
      );
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "linear-gradient(145deg, #1a1a1a, #121212)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <thead style={{ background: "var(--primary)", color: "#0a0a0a" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "left" }}>#</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Cliente</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Teléfono</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Servicio</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Hora</th>
              <th style={{ padding: "15px", textAlign: "left" }}>Estado</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => {
              const bookingId = booking.id || booking._id;
              return (
                <tr
                  key={bookingId}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "15px", color: "#888" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "15px", fontWeight: "600" }}>
                    {booking.nombre}
                  </td>
                  <td style={{ padding: "15px", color: "#aaa" }}>
                    {booking.telefono}
                  </td>
                  <td style={{ padding: "15px", color: "#aaa" }}>
                    {booking.servicio}
                  </td>
                  <td style={{ padding: "15px", color: "#aaa" }}>
                    {formatDate(booking.fecha)}
                  </td>
                  <td style={{ padding: "15px", color: "#aaa" }}>
                    {booking.hora}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span
                      style={{
                        background: getStatusColor(booking.estado),
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "50px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      {getStatusText(booking.estado)}
                    </span>
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* WhatsApp */}
                      <button
                        onClick={() =>
                          openWhatsApp(booking.telefono, booking.nombre)
                        }
                        style={{
                          background: "#25D366",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                        title="WhatsApp"
                      >
                        <FaWhatsapp />
                      </button>

                      {/* Confirmar */}
                      {booking.estado === "pendiente" && (
                        <button
                          onClick={() => updateStatus(bookingId, "confirmada")}
                          style={{
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                          title="Confirmar"
                        >
                          <FaCheck />
                        </button>
                      )}

                      {/* Completar */}
                      {booking.estado === "confirmada" && (
                        <button
                          onClick={() => updateStatus(bookingId, "completada")}
                          style={{
                            background: "#2196F3",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                          title="Completar"
                        >
                          ✅
                        </button>
                      )}

                      {/* Cancelar */}
                      {booking.estado !== "cancelada" &&
                        booking.estado !== "completada" && (
                          <button
                            onClick={() => updateStatus(bookingId, "cancelada")}
                            style={{
                              background: "#f44336",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                            }}
                            title="Cancelar"
                          >
                            <FaTimes />
                          </button>
                        )}

                      {/* Eliminar */}
                      <button
                        onClick={() => deleteBooking(bookingId)}
                        style={{
                          background: "#ff4444",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================
  // RENDERIZAR PRINCIPAL
  // ============================================
  return (
    <div>
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
        <p style={{ color: "#888" }}>
          Total: <strong style={{ color: "white" }}>{bookings.length}</strong>{" "}
          reservas
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={loadBookings}
            style={{
              background: "var(--primary)",
              color: "#0a0a0a",
              border: "none",
              padding: "10px 20px",
              borderRadius: "50px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <FaSync /> Actualizar
          </button>
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
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(255,0,0,0.2)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255,0,0,0.1)")
            }
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {renderBookings()}
    </div>
  );
}

export default AdminDashboard;
