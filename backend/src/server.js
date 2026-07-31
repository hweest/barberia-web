// backend/src/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Cargar variables de entorno
dotenv.config();

// ============================================
// CONEXIÓN A MONGODB
// ============================================
const {
  connectDB,
  Booking,
  Gallery,
  User,
  Price,
} = require("./config/database");
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static("uploads"));

// ============================================
// CONFIGURACIÓN DE MULTER (Subida de imágenes)
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ============================================
// CONFIGURACIÓN DE CORREO (Nodemailer)
// ============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// 1. LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "✅ Login exitoso",
      token: token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
    });
  }
});

// 2. VERIFICAR TOKEN
app.get("/api/auth/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 3. SOLICITAR RECUPERACIÓN DE CONTRASEÑA
app.post("/api/auth/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es obligatorio",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe una cuenta con ese email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000);

    user.reset_token = resetToken;
    user.reset_token_expires = resetTokenExpires;
    await user.save();

    const resetLink = `https://barberia-frontend-m4s9.onrender.com/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Recuperación de contraseña - Barbería",
      html: `
        <h2>🔐 Recuperación de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetLink}" style="
          background: #d4a762;
          color: #0a0a0a;
          padding: 12px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          display: inline-block;
          margin: 20px 0;
        ">Restablecer contraseña</a>
        <p><small>Este enlace expirará en 1 hora.</small></p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
        <hr>
        <p style="color: #888; font-size: 0.9rem;">
          Barbería - Estilo y Elegancia
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "📧 Se ha enviado un correo con las instrucciones",
    });
  } catch (error) {
    console.error("Error en request-reset:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el correo",
    });
  }
});

// 4. RESTABLECER CONTRASEÑA
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token y nueva contraseña son obligatorios",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({
      success: true,
      message: "✅ Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la contraseña",
    });
  }
});

// 5. CAMBIAR CONTRASEÑA (estando logueado)
app.post("/api/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva son obligatorias",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "✅ Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error en change-password:", error);
    res.status(500).json({
      success: false,
      message: "Error al cambiar la contraseña",
    });
  }
});

// ============================================
// RUTAS DE RESERVAS
// ============================================

// 1. OBTENER TODAS LAS RESERVAS (PROTEGIDA)
app.get("/api/bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ created_at: -1 });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reservas",
    });
  }
});

// ============================================
// 2. CREAR RESERVA (PÚBLICA) - CON WHATSAPP (whatsapp://)
// ============================================
app.post("/api/bookings", async (req, res) => {
  try {
    const { nombre, telefono, servicio, fecha, hora, mensaje } = req.body;

    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    const booking = await Booking.create({
      nombre,
      telefono,
      servicio,
      fecha,
      hora,
      mensaje: mensaje || "",
    });

    const numeroWhatsApp = "5351028354";
    const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const mensajeWhatsApp = `📋 *NUEVA RESERVA - BARBERÍA*

👤 *Cliente:* ${nombre}
📱 *Teléfono:* ${telefono}
✂️ *Servicio:* ${servicio}
📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${hora}
💬 *Mensaje:* ${mensaje || "Sin mensaje adicional"}

📌 *ID Reserva:* ${booking._id}
🕒 *Creado:* ${new Date().toLocaleString("es-ES")}

✅ *Estado:* Pendiente de confirmación

---
*Responde a este mensaje para confirmar la cita*`;

    const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
    // ✅ USAR whatsapp:// EN LUGAR DE https://wa.me
    const urlWhatsApp = `whatsapp://send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`;

    res.status(201).json({
      success: true,
      message: "✅ Reserva creada exitosamente",
      data: booking,
      whatsappUrl: urlWhatsApp,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar la reserva",
    });
  }
});

// 3. OBTENER RESERVA POR ID (PROTEGIDA)
app.get("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reserva",
    });
  }
});

// ============================================
// 4. ACTUALIZAR ESTADO (PROTEGIDA) - CON WHATSAPP (whatsapp://)
// ============================================
app.put("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const { estado } = req.body;
    const id = req.params.id;
    const estadosValidos = [
      "pendiente",
      "confirmada",
      "completada",
      "cancelada",
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }

    booking.estado = estado;
    await booking.save();

    let whatsappUrl = null;
    let mensajeWhatsApp = "";

    // ============================================
    // ENVIAR WHATSAPP SEGÚN EL ESTADO (whatsapp://)
    // ============================================

    // 1. SI SE CONFIRMA
    if (estado === "confirmada") {
      const numeroWhatsApp = booking.telefono.replace(/\+/g, "");
      const nombreCliente = booking.nombre;
      const servicio = booking.servicio;
      const fecha = new Date(booking.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hora = booking.hora;

      mensajeWhatsApp = `✅ *RESERVA CONFIRMADA - BARBERÍA*

Hola ${nombreCliente},

Tu reserva ha sido *CONFIRMADA* exitosamente. ¡Te esperamos!

📋 *Detalles de tu reserva:*
✂️ *Servicio:* ${servicio}
📅 *Fecha:* ${fecha}
🕐 *Hora:* ${hora}

📍 *Dirección:* Quintin Banderas #19, Ranchuelo, Villa Clara, Cuba

📱 *Teléfono de contacto:* +53 51028354

¡Te esperamos con los brazos abiertos! ✨`;

      const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
      // ✅ USAR whatsapp:// EN LUGAR DE https://wa.me
      whatsappUrl = `whatsapp://send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`;

      console.log(`📤 Mensaje de confirmación enviado a ${booking.telefono}`);
    }

    // 2. SI SE CANCELA
    if (estado === "cancelada") {
      const numeroWhatsApp = booking.telefono.replace(/\+/g, "");
      const nombreCliente = booking.nombre;
      const servicio = booking.servicio;
      const fecha = new Date(booking.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hora = booking.hora;

      mensajeWhatsApp = `❌ *CANCELACIÓN DE RESERVA - BARBERÍA*

Hola ${nombreCliente},

Lamentamos informarte que tu reserva ha sido *CANCELADA*.

📋 *Detalles de la reserva cancelada:*
✂️ *Servicio:* ${servicio}
📅 *Fecha:* ${fecha}
🕐 *Hora:* ${hora}

Si deseas reagendar, contáctanos por este mismo medio.

📱 *Teléfono de contacto:* +53 51028354

¡Esperamos verte pronto! ✨`;

      const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
      // ✅ USAR whatsapp:// EN LUGAR DE https://wa.me
      whatsappUrl = `whatsapp://send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`;

      console.log(`📤 Mensaje de cancelación enviado a ${booking.telefono}`);
    }

    // ============================================
    // DEVOLVER RESPUESTA
    // ============================================
    res.json({
      success: true,
      message: "✅ Estado actualizado correctamente",
      data: booking,
      whatsappUrl: whatsappUrl,
      enviarWhatsApp: !!whatsappUrl,
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar: " + error.message,
    });
  }
});

// 5. ELIMINAR RESERVA (PROTEGIDA)
app.delete("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.json({
      success: true,
      message: "✅ Reserva eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar",
    });
  }
});

// ============================================
// RUTAS DE GALERÍA
// ============================================

// 1. OBTENER TODAS LAS IMÁGENES (PÚBLICA)
app.get("/api/gallery", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ orden: 1, created_at: -1 });
    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener imágenes",
    });
  }
});

// 2. SUBIR UNA IMAGEN (PROTEGIDA)
app.post(
  "/api/gallery",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se subió ninguna imagen",
        });
      }

      const { title, description } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "El título es obligatorio",
        });
      }

      const image = await Gallery.create({
        url: imageUrl,
        title,
        description: description || "",
      });

      res.status(201).json({
        success: true,
        message: "✅ Imagen subida exitosamente",
        data: image,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({
        success: false,
        message: "Error al subir la imagen",
      });
    }
  },
);

// 3. ACTUALIZAR UNA IMAGEN (PROTEGIDA)
app.put(
  "/api/gallery/:id",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, orden } = req.body;
      const id = req.params.id;

      const image = await Gallery.findById(id);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        });
      }

      if (req.file) {
        const oldPath = path.join(__dirname, "..", image.url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        image.url = `/uploads/${req.file.filename}`;
      }

      if (title) image.title = title;
      if (description !== undefined) image.description = description;
      if (orden !== undefined) image.orden = orden;

      await image.save();

      res.json({
        success: true,
        message: "✅ Imagen actualizada correctamente",
        data: image,
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar la imagen",
      });
    }
  },
);

// 4. ELIMINAR UNA IMAGEN (PROTEGIDA)
app.delete("/api/gallery/:id", verifyToken, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }

    if (image.url) {
      const filePath = path.join(__dirname, "..", image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await image.deleteOne();

    res.json({
      success: true,
      message: "✅ Imagen eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar",
    });
  }
});

// ============================================
// RUTAS DE PRECIOS
// ============================================

// 1. OBTENER TODOS LOS PRECIOS (PÚBLICA)
app.get("/api/prices", async (req, res) => {
  try {
    const prices = await Price.find().sort({ created_at: 1 });
    res.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error("Error al obtener precios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener precios",
    });
  }
});

// 2. ACTUALIZAR UN PRECIO (PROTEGIDA)
app.put("/api/prices/:id", verifyToken, async (req, res) => {
  try {
    const { precio, descripcion, icono } = req.body;
    const id = req.params.id;

    if (!precio) {
      return res.status(400).json({
        success: false,
        message: "El precio es obligatorio",
      });
    }

    const updatedPrice = await Price.findByIdAndUpdate(
      id,
      {
        precio,
        descripcion: descripcion || "",
        icono: icono || "✂️",
        updated_at: new Date(),
      },
      { new: true },
    );

    if (!updatedPrice) {
      return res.status(404).json({
        success: false,
        message: "Precio no encontrado",
      });
    }

    res.json({
      success: true,
      message: "✅ Precio actualizado correctamente",
      data: updatedPrice,
    });
  } catch (error) {
    console.error("Error al actualizar precio:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar precio",
    });
  }
});

// 3. CREAR UN NUEVO SERVICIO (PROTEGIDA)
app.post("/api/prices", verifyToken, async (req, res) => {
  try {
    const { servicio, precio, descripcion, icono } = req.body;

    if (!servicio || !precio) {
      return res.status(400).json({
        success: false,
        message: "El servicio y el precio son obligatorios",
      });
    }

    const existingPrice = await Price.findOne({ servicio });
    if (existingPrice) {
      return res.status(400).json({
        success: false,
        message: "Este servicio ya existe",
      });
    }

    const newPrice = await Price.create({
      servicio,
      precio,
      descripcion: descripcion || "",
      icono: icono || "✂️",
    });

    res.status(201).json({
      success: true,
      message: "✅ Servicio agregado correctamente",
      data: newPrice,
    });
  } catch (error) {
    console.error("Error al agregar servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar servicio",
    });
  }
});

// 4. ELIMINAR UN SERVICIO (PROTEGIDA)
app.delete("/api/prices/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedPrice = await Price.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    res.json({
      success: true,
      message: "✅ Servicio eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar servicio",
    });
  }
});

// 5. RESTABLECER PRECIOS POR DEFECTO (PROTEGIDA)
app.post("/api/prices/reset", verifyToken, async (req, res) => {
  try {
    const defaultPrices = [
      {
        servicio: "Corte de Cabello",
        precio: "S/ 40",
        descripcion: "Corte moderno y personalizado según tu estilo.",
        icono: "✂️",
      },
      {
        servicio: "Arreglo de Barba",
        precio: "S/ 30",
        descripcion: "Diseño y mantenimiento profesional de barba.",
        icono: "🧔",
      },
      {
        servicio: "Combo Completo",
        precio: "S/ 60",
        descripcion: "Corte + Barba + Lavado de cabello.",
        icono: "✨",
      },
      {
        servicio: "Teñido",
        precio: "S/ 80",
        descripcion: "Coloración profesional con productos de calidad.",
        icono: "🎨",
      },
      {
        servicio: "Ceremonia de Afeitado",
        precio: "S/ 50",
        descripcion: "Experiencia premium con toallas calientes.",
        icono: "🔥",
      },
    ];

    for (const p of defaultPrices) {
      await Price.findOneAndUpdate(
        { servicio: p.servicio },
        {
          precio: p.precio,
          descripcion: p.descripcion,
          icono: p.icono,
          updated_at: new Date(),
        },
        { upsert: true, new: true },
      );
    }

    const prices = await Price.find().sort({ created_at: 1 });

    res.json({
      success: true,
      message: "✅ Precios restablecidos correctamente",
      data: prices,
    });
  } catch (error) {
    console.error("Error al restablecer precios:", error);
    res.status(500).json({
      success: false,
      message: "Error al restablecer precios",
    });
  }
});

// ============================================
// RUTA DE PRUEBA
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Barbería funcionando con MongoDB",
    version: "1.0.0",
  });
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: MongoDB Atlas`);
});
