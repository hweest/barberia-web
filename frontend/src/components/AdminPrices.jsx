// frontend/src/components/AdminPrices.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaUndo, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

function AdminPrices() {
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    servicio: "",
    precio: "",
    descripcion: "",
    icono: "✂️",
  });

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
  // ELIMINAR SERVICIO
  // ============================================
  const handleDeleteService = async (id, servicio) => {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${servicio}"?`))
      return;

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/prices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        await loadPrices();
        alert("✅ Servicio eliminado correctamente");
      } else {
        const data = await response.json();
        setError(data.message || "Error al eliminar");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    }
  };

  // ============================================
  // AGREGAR NUEVO SERVICIO
  // ============================================
  const handleAddService = async (e) => {
    e.preventDefault();

    if (!newService.servicio || !newService.precio) {
      setError("El servicio y el precio son obligatorios");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        await loadPrices();
        setShowAddForm(false);
        setNewService({
          servicio: "",
          precio: "",
          descripcion: "",
          icono: "✂️",
        });
        alert("✅ Servicio agregado correctamente");
      } else {
        const data = await response.json();
        setError(data.message || "Error al agregar");
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
          <p style={{ color: "#888" }}>
            Gestiona los precios y servicios disponibles
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
            }}
          >
            <FaPlus /> Agregar Servicio
          </button>
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
            <FaUndo /> Restablecer
          </button>
        </div>
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

      {/* ============================================
          FORMULARIO PARA AGREGAR NUEVO SERVICIO
          ============================================ */}
      {showAddForm && (
        <div
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #121212)",
            padding: "2rem",
            borderRadius: "20px",
            marginBottom: "2rem",
            border: "1px solid rgba(212,167,98,0.1)",
          }}
        >
          <h4 style={{ color: "white", marginBottom: "1rem" }}>
            ➕ Agregar Nuevo Servicio
          </h4>
          <form onSubmit={handleAddService}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    color: "#888",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={newService.servicio}
                  onChange={(e) =>
                    setNewService({ ...newService, servicio: e.target.value })
                  }
                  placeholder="Corte de Cabello"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    color: "#888",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Precio *
                </label>
                <input
                  type="text"
                  value={newService.precio}
                  onChange={(e) =>
                    setNewService({ ...newService, precio: e.target.value })
                  }
                  placeholder="S/ 40"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    color: "white",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Descripción
              </label>
              <input
                type="text"
                value={newService.descripcion}
                onChange={(e) =>
                  setNewService({ ...newService, descripcion: e.target.value })
                }
                placeholder="Descripción del servicio"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Icono (emoji)
              </label>
              <input
                type="text"
                value={newService.icono}
                onChange={(e) =>
                  setNewService({ ...newService, icono: e.target.value })
                }
                placeholder="✂️"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                style={{
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  border: "none",
                  padding: "10px 30px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaSave /> Agregar Servicio
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewService({
                    servicio: "",
                    precio: "",
                    descripcion: "",
                    icono: "✂️",
                  });
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#888",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 30px",
                  borderRadius: "50px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================
          LISTA DE PRECIOS
          ============================================ */}
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
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span style={{ fontSize: "2rem" }}>
                    {price.icono || "✂️"}
                  </span>
                  <h4 style={{ color: "white", margin: 0 }}>
                    {price.servicio}
                  </h4>
                </div>
                <button
                  onClick={() =>
                    handleDeleteService(price.id || price._id, price.servicio)
                  }
                  style={{
                    background: "rgba(244, 67, 54, 0.2)",
                    color: "#f44336",
                    border: "1px solid rgba(244,67,54,0.3)",
                    padding: "5px 10px",
                    borderRadius: "50px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FaTrash size={12} /> Eliminar
                </button>
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
