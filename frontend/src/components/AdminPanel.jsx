// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaSync,
  FaWhatsapp,
  FaSignOutAlt,
} from "react-icons/fa";
import AdminLogin from "./AdminLogin";
import AdminGallery from "./AdminGallery";
import AdminPrices from "./AdminPrices";

function AdminPanel() {
  // ✅ URL del backend (hardcodeada temporalmente para pruebas)
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reservas");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsAuthenticated(true);
            loadBookings();
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: { Authorization: token },
      });
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError("Error al cargar las reservas");
        if (data.message === "Token inválido o expirado") {
          handleLogout();
        }
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    loadBookings();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setBookings([]);
  };

  // ============================================
  // ACTUALIZAR ESTADO DE UNA RESERVA (CON WHATSAPP)
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

      const data = await response.json();

      if (response.ok) {
        loadBookings();

        // Si es cancelación y hay URL de WhatsApp, abrirla
        if (data.cancelacion && data.whatsappUrl) {
          if (
            window.confirm(
              "¿Deseas enviar una notificación de cancelación al cliente por WhatsApp?",
            )
          ) {
            window.open(data.whatsappUrl, "_blank");
          }
        }
      } else {
        console.error("Error al actualizar:", data.message);
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

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

  const openWhatsApp = (telefono, nombre) => {
    const mensaje = `Hola ${nombre}, soy de la barbería. Te confirmo tu cita.`;
    window.open(
      `https://wa.me/${telefono.replace("+", "")}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  const renderBookings = () => {
    if (bookingsLoading) {
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "white",
        }}
      >
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

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
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
              Panel de <span>Administración</span>
            </h2>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              👤{" "}
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")).email
                : "Administrador"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,0,0,0.1)",
              color: "#ff4444",
              border: "1px solid rgba(255,0,0,0.2)",
              padding: "10px 25px",
              borderRadius: "50px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
            }}
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>

        {/* ============================================
            TABS (CON PRECIOS)
            ============================================ */}
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
              transition: "all 0.3s ease",
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
              transition: "all 0.3s ease",
            }}
          >
            🖼️ Galería
          </button>
          <button
            onClick={() => setActiveTab("precios")}
            style={{
              background:
                activeTab === "precios" ? "var(--primary)" : "transparent",
              color: activeTab === "precios" ? "#0a0a0a" : "#888",
              border: "none",
              padding: "10px 25px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: activeTab === "precios" ? "600" : "400",
              transition: "all 0.3s ease",
            }}
          >
            💰 Precios
          </button>
        </div>

        {/* ============================================
            CONTENIDO DE LAS PESTAÑAS
            ============================================ */}
        {activeTab === "reservas" && (
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
                Total:{" "}
                <strong style={{ color: "white" }}>{bookings.length}</strong>{" "}
                reservas
              </p>
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
              >
                <FaSync /> Actualizar
              </button>
            </div>
            {renderBookings()}
          </div>
        )}

        {activeTab === "galeria" && <AdminGallery />}
        {activeTab === "precios" && <AdminPrices />}
      </div>
    </section>
  );
}

export default AdminPanel;
