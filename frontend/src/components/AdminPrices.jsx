// frontend/src/components/AdminPrices.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaUndo, FaEdit } from "react-icons/fa";

function AdminPrices() {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" });

  const getToken = () => localStorage.getItem("token");

  // ============================================
  // CARGAR PRECIOS
  // ============================================
  const loadPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/prices`);
      const data = await response.json();

      if (data.success) {
        setPrices(data.data);
      } else {
        setError("Error al cargar precios");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  // ============================================
  // ACTUALIZAR PRECIO
  // ============================================
  const handleUpdatePrice = async (id) => {
    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/prices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadPrices();
        setEditingId(null);
        setEditForm({ precio: "", descripcion: "" });
        alert("✅ Precio actualizado correctamente");
      } else {
        const data = await response.json();
        setError(data.message || "Error al actualizar");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    }
  };

  // ============================================
  // RESTABLECER PRECIOS POR DEFECTO
  // ============================================
  const handleResetPrices = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de restablecer todos los precios a los valores predeterminados?",
      )
    )
      return;

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/prices/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (response.ok) {
        await loadPrices();
        alert("✅ Precios restablecidos correctamente");
      } else {
        const data = await response.json();
        setError(data.message || "Error al restablecer");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    }
  };

  // ============================================
  // INICIAR EDICIÓN
  // ============================================
  const startEditing = (price) => {
    setEditingId(price.id || price._id);
    setEditForm({
      precio: price.precio,
      descripcion: price.descripcion || "",
    });
  };

  // ============================================
  // CANCELAR EDICIÓN
  // ============================================
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ precio: "", descripcion: "" });
  };

  // ============================================
  // RENDERIZAR
  // ============================================
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
        Cargando precios...
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 0" }}>
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
          <h3 style={{ color: "white" }}>💰 Administrar Precios</h3>
          <p style={{ color: "#888" }}>Gestiona los precios de los servicios</p>
        </div>
        <button
          onClick={handleResetPrices}
          style={{
            background: "rgba(255, 165, 0, 0.2)",
            color: "#ffa500",
            border: "1px solid rgba(255, 165, 0, 0.3)",
            padding: "10px 20px",
            borderRadius: "50px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
          }}
        >
          <FaUndo /> Restablecer predeterminados
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#ff4444",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "1rem",
          }}
        >
          ❌ {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {prices.map((price) => {
          const isEditing = editingId === (price.id || price._id);
          return (
            <div
              key={price.id || price._id}
              style={{
                background: "linear-gradient(145deg, #1a1a1a, #121212)",
                padding: "1.5rem",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "2rem" }}>{price.icono || "✂️"}</span>
                <h4 style={{ color: "white", margin: 0 }}>{price.servicio}</h4>
              </div>

              {isEditing ? (
                // Formulario de edición
                <div>
                  <div style={{ marginBottom: "0.8rem" }}>
                    <label
                      style={{
                        color: "#888",
                        fontSize: "0.85rem",
                        display: "block",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Precio
                    </label>
                    <input
                      type="text"
                      value={editForm.precio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, precio: e.target.value })
                      }
                      placeholder="S/ 40"
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "0.8rem" }}>
                    <label
                      style={{
                        color: "#888",
                        fontSize: "0.85rem",
                        display: "block",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={editForm.descripcion}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          descripcion: e.target.value,
                        })
                      }
                      placeholder="Descripción del servicio"
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleUpdatePrice(price.id || price._id)}
                      style={{
                        background: "var(--primary)",
                        color: "#0a0a0a",
                        border: "none",
                        padding: "8px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      <FaSave /> Guardar
                    </button>
                    <button
                      onClick={cancelEditing}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#888",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "8px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Vista normal
                <div>
                  <p
                    style={{
                      color: "#d4a762",
                      fontSize: "1.8rem",
                      fontWeight: "700",
                      margin: "0.5rem 0",
                    }}
                  >
                    {price.precio}
                  </p>
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.9rem",
                      margin: "0.3rem 0 1rem 0",
                    }}
                  >
                    {price.descripcion || "Sin descripción"}
                  </p>
                  <button
                    onClick={() => startEditing(price)}
                    style={{
                      background: "rgba(33, 150, 243, 0.2)",
                      color: "#2196F3",
                      border: "1px solid rgba(33,150,243,0.3)",
                      padding: "6px 16px",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaEdit /> Editar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminPrices;
