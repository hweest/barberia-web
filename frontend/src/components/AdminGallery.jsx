// frontend/src/components/AdminGallery.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaSave } from "react-icons/fa";

function AdminGallery() {
  // ✅ URL del backend
  const API_URL = "https://barberia-backend-jh00.onrender.com";

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orden: 0,
  });

  const getToken = () => localStorage.getItem("token");

  // ============================================
  // CARGAR IMÁGENES
  // ============================================
  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/gallery`);
      const data = await response.json();

      if (data.success) {
        setImages(data.data);
      } else {
        setError("Error al cargar imágenes");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // ============================================
  // MANEJAR SELECCIÓN DE ARCHIVO
  // ============================================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // AGREGAR IMAGEN
  // ============================================
  const handleAddImage = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Por favor, selecciona una imagen");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("image", selectedFile);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      const response = await fetch(`${API_URL}/api/gallery`, {
        method: "POST",
        headers: { Authorization: token },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        await loadImages();
        setShowForm(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({ title: "", description: "", orden: 0 });
        setError("");
        alert("✅ Imagen agregada correctamente");
      } else {
        setError(data.message || "Error al agregar imagen");
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    }
  };

  // ============================================
  // ACTUALIZAR IMAGEN
  // ============================================
  const handleUpdateImage = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("orden", formData.orden);

      const response = await fetch(
        `${API_URL}/api/gallery/${editingImage.id || editingImage._id}`,
        {
          method: "PUT",
          headers: { Authorization: token },
          body: formDataToSend,
        },
      );

      if (response.ok) {
        await loadImages();
        setEditingImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({ title: "", description: "", orden: 0 });
        setError("");
        alert("✅ Imagen actualizada correctamente");
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
  // ✅ ELIMINAR IMAGEN (CORREGIDO)
  // ============================================
  const deleteImage = async (image) => {
    // Obtener el ID correcto (MongoDB usa _id, SQLite usa id)
    const imageId = image.id || image._id;

    if (!imageId) {
      console.error("❌ No se encontró ID de la imagen");
      alert("❌ Error: la imagen no tiene un ID válido");
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar "${image.title}"?`)) return;

    try {
      const token = getToken();
      if (!token) {
        alert("No estás autenticado. Inicia sesión nuevamente.");
        return;
      }

      console.log(`🗑️ Eliminando imagen con ID: ${imageId}`);

      const response = await fetch(`${API_URL}/api/gallery/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      if (response.ok) {
        await loadImages();
        alert("✅ Imagen eliminada correctamente");
      } else if (response.status === 404) {
        alert("❌ La imagen ya no existe");
        await loadImages();
      } else {
        const data = await response.json();
        alert("❌ Error: " + (data.message || "Error desconocido"));
      }
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
      alert("❌ Error al conectar con el servidor");
    }
  };

  // ============================================
  // INICIAR EDICIÓN
  // ============================================
  const startEditing = (image) => {
    console.log("✏️ Editando imagen:", image);
    setEditingImage(image);
    setFormData({
      title: image.title,
      description: image.description || "",
      orden: image.orden || 0,
    });
    setPreviewUrl(`${API_URL}${image.url}`);
    setSelectedFile(null);
    setShowForm(false); // Cerrar formulario de agregar si está abierto
    setError("");
  };

  // ============================================
  // ACTUALIZAR IMAGEN (EDITAR)
  // ============================================
  const handleUpdateImage = async (e) => {
    e.preventDefault();

    if (!editingImage) return;

    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado. Inicia sesión nuevamente.");
        return;
      }

      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("orden", formData.orden);

      const response = await fetch(
        `${API_URL}/api/gallery/${editingImage.id || editingImage._id}`,
        {
          method: "PUT",
          headers: { Authorization: token },
          body: formDataToSend,
        },
      );

      if (response.ok) {
        await loadImages();
        setEditingImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({ title: "", description: "", orden: 0 });
        setError("");
        alert("✅ Imagen actualizada correctamente");
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
  // RENDERIZAR
  // ============================================
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
        Cargando imágenes...
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
          <h3 style={{ color: "white" }}>🖼️ Galería</h3>
          <p style={{ color: "#888" }}>Total: {images.length} imágenes</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingImage(null);
            setFormData({ title: "", description: "", orden: 0 });
            setSelectedFile(null);
            setPreviewUrl(null);
            setError("");
          }}
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
          <FaPlus /> Agregar Imagen
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

      {showForm && (
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
            📷 Agregar Nueva Imagen
          </h4>
          {previewUrl && (
            <div style={{ marginBottom: "1rem", textAlign: "center" }}>
              <img
                src={previewUrl}
                alt="Vista previa"
                style={{
                  maxHeight: "200px",
                  maxWidth: "100%",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
          )}
          <form onSubmit={handleAddImage}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Seleccionar Imagen *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                }}
              />
              <small style={{ color: "#666" }}>
                Formatos: JPG, PNG, GIF, WebP (Máx 5MB)
              </small>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  color: "#888",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Corte Clásico"
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
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Corte moderno con degradado"
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
                <FaSave /> Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setError("");
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

      {images.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          <p>No hay imágenes en la galería</p>
          <p style={{ fontSize: "0.9rem" }}>
            Haz clic en "Agregar Imagen" para comenzar
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {images.map((image) => (
            <div
              key={image.id || image._id}
              style={{
                background: "linear-gradient(145deg, #1a1a1a, #121212)",
                borderRadius: "15px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={`${API_URL}${image.url}`}
                  alt={image.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                />
              </div>
              <div style={{ padding: "1rem" }}>
                <h4 style={{ color: "white", marginBottom: "0.3rem" }}>
                  {image.title}
                </h4>
                {image.description && (
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {image.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => startEditing(image)}
                    style={{
                      background: "rgba(33, 150, 243, 0.2)",
                      color: "#2196F3",
                      border: "1px solid rgba(33,150,243,0.3)",
                      padding: "5px 12px",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      flex: 1,
                    }}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    onClick={() => deleteImage(image)}
                    style={{
                      background: "rgba(244, 67, 54, 0.2)",
                      color: "#f44336",
                      border: "1px solid rgba(244,67,54,0.3)",
                      padding: "5px 12px",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      flex: 1,
                    }}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGallery;
