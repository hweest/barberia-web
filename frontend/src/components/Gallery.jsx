// frontend/src/components/Gallery.jsx
import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // ============================================
  // CARGAR IMÁGENES DE LA BASE DE DATOS
  // ============================================
  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/gallery");
      const data = await response.json();

      if (data.success) {
        setImages(data.data);
      } else {
        setError("Error al cargar imágenes");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const openModal = (image) => setSelectedImage(image);
  const closeModal = () => setSelectedImage(null);

  const handleReserva = () => {
    window.open(
      "https://wa.me/5351028354?text=¡Hola! Me interesa ver más información sobre la galería de la barbería.",
      "_blank",
    );
  };

  // ============================================
  // RENDERIZAR
  // ============================================
  if (loading) {
    return (
      <section id="galeria" className="gallery">
        <div className="container">
          <h2 className="section-title">
            Nuestra <span>Galería</span>
          </h2>
          <div className="gold-line"></div>
          <p style={{ textAlign: "center", color: "#888" }}>
            Cargando imágenes...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="gallery">
      <div className="container">
        <h2 className="section-title">
          Nuestra <span>Galería</span>
        </h2>
        <div className="gold-line"></div>
        <p className="section-subtitle">
          Mira algunos de nuestros mejores trabajos
        </p>

        {error && (
          <div
            style={{
              background: "#ff4444",
              color: "white",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {images.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "linear-gradient(145deg, #1a1a1a, #121212)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p style={{ color: "#888", fontSize: "1.2rem" }}>
              🖼️ No hay imágenes en la galería de Momento
            </p>
            <p style={{ color: "#555", marginTop: "0.5rem" }}>
              Por ahora no hay imagenes
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((image) => (
              <div
                key={image.id}
                className="gallery-item"
                onClick={() => openModal(image)}
              >
                <img
                  src={`http://localhost:5000${image.url}`}
                  alt={image.title}
                />
                <div className="gallery-overlay">
                  <p>{image.title}</p>
                  {image.description && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        opacity: 0.7,
                        marginTop: "5px",
                      }}
                    >
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button
            className="btn-primary"
            onClick={handleReserva}
            style={{ background: "linear-gradient(135deg, #25D366, #1da851)" }}
          >
            <FaWhatsapp /> Consultar por WhatsApp
          </button>
        </div>

        {selectedImage && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="modal-close" onClick={closeModal}>
                &times;
              </span>
              <img
                src={`http://localhost:5000${selectedImage.url}`}
                alt={selectedImage.title}
              />
              <p>{selectedImage.title}</p>
              {selectedImage.description && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#888",
                    marginTop: "5px",
                  }}
                >
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
