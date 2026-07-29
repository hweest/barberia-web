// backend/src/server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = 5000;

// ============================================
// SECRETO PARA JWT
// ============================================
const JWT_SECRET = "tu_secreto_super_seguro_cambia_esto_en_produccion";

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (las imágenes subidas)
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
// CONFIGURACIÓN DE CORREO (CON TU CONTRASEÑA)
// ============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hectorpedraza624@gmail.com",
    pass: "onoe vkxp mlyq pgfc", // ← TU CONTRASEÑA DE APLICACIÓN
  },
});

// ============================================
// CONEXIÓN A SQLITE
// ============================================
const dbPath = path.join(__dirname, "../barberia.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error al conectar con SQLite:", err.message);
  } else {
    console.log("✅ Conectado a SQLite (barberia.db)");
  }
});

// ============================================
// CREAR TABLAS
// ============================================

// 1. Tabla de reservas
db.run(
  `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    servicio TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    mensaje TEXT,
    estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla bookings:", err.message);
    } else {
      console.log('✅ Tabla "bookings" lista');
    }
  },
);

// 2. Tabla de galería
db.run(
  `
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    orden INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla gallery:", err.message);
    } else {
      console.log('✅ Tabla "gallery" lista');
    }
  },
);

// 3. Tabla de usuarios (autenticación)
db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla users:", err.message);
    } else {
      console.log('✅ Tabla "users" lista');

      // Crear usuario por defecto (solo si no existe)
      const defaultEmail = "hectorpedraza624@gmail.com";
      const defaultPassword = "Admin123!";

      db.get(
        "SELECT * FROM users WHERE email = ?",
        [defaultEmail],
        (err, row) => {
          if (err) {
            console.error("❌ Error al verificar usuario:", err);
            return;
          }

          if (!row) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(defaultPassword, salt);

            db.run(
              "INSERT INTO users (email, password) VALUES (?, ?)",
              [defaultEmail, hashedPassword],
              (err) => {
                if (err) {
                  console.error("❌ Error al crear usuario por defecto:", err);
                } else {
                  console.log("✅ Usuario por defecto creado:");
                  console.log(`   📧 Email: ${defaultEmail}`);
                  console.log(`   🔑 Contraseña: ${defaultPassword}`);
                }
              },
            );
          }
        },
      );
    }
  },
);

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN (Verify Token)
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
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son obligatorios",
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "✅ Login exitoso",
      token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
});

// 2. VERIFICAR TOKEN
app.get("/api/auth/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 3. SOLICITAR RECUPERACIÓN DE CONTRASEÑA
app.post("/api/auth/request-reset", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El email es obligatorio",
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        success: false,
        message: "No existe una cuenta con ese email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000);

    db.run(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, resetTokenExpires.toISOString(), user.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al guardar token",
          });
        }

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
        const mailOptions = {
          from: "hectorpedraza624@gmail.com",
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

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("❌ Error al enviar correo:", error);
            return res.status(500).json({
              success: false,
              message: "Error al enviar el correo",
            });
          }

          res.json({
            success: true,
            message: "📧 Se ha enviado un correo con las instrucciones",
          });
        });
      },
    );
  });
});

// 4. RESTABLECER CONTRASEÑA
app.post("/api/auth/reset-password", (req, res) => {
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

  db.get(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")',
    [token],
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          success: false,
          message: "Token inválido o expirado",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      db.run(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
        [hashedPassword, user.id],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error al actualizar contraseña",
            });
          }

          res.json({
            success: true,
            message: "✅ Contraseña actualizada correctamente",
          });
        },
      );
    },
  );
});

// 5. CAMBIAR CONTRASEÑA (estando logueado)
app.post("/api/auth/change-password", verifyToken, (req, res) => {
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

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al cambiar contraseña",
          });
        }

        res.json({
          success: true,
          message: "✅ Contraseña actualizada correctamente",
        });
      },
    );
  });
});

// ============================================
// RUTAS DE RESERVAS (PROTEGIDAS)
// ============================================

// 1. OBTENER TODAS LAS RESERVAS
app.get("/api/bookings", verifyToken, (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener reservas",
      });
    }
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  });
});

// 2. CREAR RESERVA (pública - no requiere autenticación)
app.post("/api/bookings", (req, res) => {
  const { nombre, telefono, servicio, fecha, hora, mensaje } = req.body;

  if (!nombre || !telefono || !servicio || !fecha || !hora) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios",
    });
  }

  const query = `
    INSERT INTO bookings (nombre, telefono, servicio, fecha, hora, mensaje)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nombre, telefono, servicio, fecha, hora, mensaje || ""],
    function (err) {
      if (err) {
        console.error("❌ Error al guardar:", err);
        return res.status(500).json({
          success: false,
          message: "Error al guardar la reserva",
        });
      }

      res.status(201).json({
        success: true,
        message: "✅ Reserva creada exitosamente",
        data: { id: this.lastID },
      });
    },
  );
});

// 3. OBTENER RESERVA POR ID
app.get("/api/bookings/:id", verifyToken, (req, res) => {
  db.get("SELECT * FROM bookings WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener reserva",
      });
    }
    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.json({ success: true, data: row });
  });
});

// 4. ACTUALIZAR ESTADO
app.put("/api/bookings/:id", verifyToken, (req, res) => {
  const { estado } = req.body;

  const estadosValidos = ["pendiente", "confirmada", "completada", "cancelada"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      success: false,
      message: "Estado no válido",
    });
  }

  db.run(
    "UPDATE bookings SET estado = ? WHERE id = ?",
    [estado, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar",
        });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Reserva no encontrada",
        });
      }
      res.json({
        success: true,
        message: "✅ Estado actualizado correctamente",
      });
    },
  );
});

// 5. ELIMINAR RESERVA
app.delete("/api/bookings/:id", verifyToken, (req, res) => {
  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar",
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.json({
      success: true,
      message: "✅ Reserva eliminada correctamente",
    });
  });
});

// ============================================
// RUTAS DE GALERÍA (PROTEGIDAS)
// ============================================

// 1. OBTENER TODAS LAS IMÁGENES (pública)
app.get("/api/gallery", (req, res) => {
  db.all(
    "SELECT * FROM gallery ORDER BY orden ASC, created_at DESC",
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al obtener imágenes",
        });
      }
      res.json({
        success: true,
        data: rows,
      });
    },
  );
});

// 2. SUBIR UNA IMAGEN
app.post("/api/gallery", verifyToken, upload.single("image"), (req, res) => {
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

    const query = `
      INSERT INTO gallery (url, title, description)
      VALUES (?, ?, ?)
    `;

    db.run(query, [imageUrl, title, description || ""], function (err) {
      if (err) {
        console.error("❌ Error al guardar imagen:", err);
        return res.status(500).json({
          success: false,
          message: "Error al guardar la imagen",
        });
      }

      res.status(201).json({
        success: true,
        message: "✅ Imagen subida exitosamente",
        data: {
          id: this.lastID,
          url: imageUrl,
          title: title,
          description: description || "",
        },
      });
    });
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
    });
  }
});

// 3. ACTUALIZAR UNA IMAGEN
app.put("/api/gallery/:id", verifyToken, upload.single("image"), (req, res) => {
  try {
    const { title, description, orden } = req.body;
    const id = req.params.id;
    let imageUrl = null;

    if (req.file) {
      db.get("SELECT url FROM gallery WHERE id = ?", [id], (err, row) => {
        if (row && row.url) {
          const oldPath = path.join(__dirname, "..", row.url);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      });
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let query = "UPDATE gallery SET ";
    const params = [];
    const updates = [];

    if (imageUrl) {
      updates.push("url = ?");
      params.push(imageUrl);
    }
    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (orden !== undefined) {
      updates.push("orden = ?");
      params.push(orden);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay datos para actualizar",
      });
    }

    query += updates.join(", ");
    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar",
        });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        });
      }
      res.json({
        success: true,
        message: "✅ Imagen actualizada correctamente",
      });
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la imagen",
    });
  }
});

// 4. ELIMINAR UNA IMAGEN
app.delete("/api/gallery/:id", verifyToken, (req, res) => {
  db.get(
    "SELECT url FROM gallery WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({
          success: false,
          message: "Imagen no encontrada",
        });
      }

      if (row.url) {
        const filePath = path.join(__dirname, "..", row.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      db.run(
        "DELETE FROM gallery WHERE id = ?",
        [req.params.id],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error al eliminar",
            });
          }
          res.json({
            success: true,
            message: "✅ Imagen eliminada correctamente",
          });
        },
      );
    },
  );
});

// ============================================
// RUTA DE PRUEBA
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Barbería funcionando correctamente",
    version: "1.0.0",
    rutas: {
      auth: {
        login: "POST /api/auth/login",
        verify: "GET /api/auth/verify",
        requestReset: "POST /api/auth/request-reset",
        resetPassword: "POST /api/auth/reset-password",
        changePassword: "POST /api/auth/change-password",
      },
      bookings: {
        getAll: "GET /api/bookings (protegida)",
        create: "POST /api/bookings (pública)",
        getOne: "GET /api/bookings/:id (protegida)",
        update: "PUT /api/bookings/:id (protegida)",
        delete: "DELETE /api/bookings/:id (protegida)",
      },
      gallery: {
        getAll: "GET /api/gallery (pública)",
        create: "POST /api/gallery (protegida)",
        update: "PUT /api/gallery/:id (protegida)",
        delete: "DELETE /api/gallery/:id (protegida)",
      },
    },
  });
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: barberia.db`);
  console.log(`📁 Imágenes guardadas en: uploads/`);
  console.log(``);
  console.log(`📋 CREDENCIALES POR DEFECTO:`);
  console.log(`   📧 Email: hectorpedraza624@gmail.com`);
  console.log(`   🔑 Contraseña: Admin123!`);
  console.log(``);
  console.log(`📋 RUTAS DISPONIBLES:`);
  console.log(`   🔐 Autenticación:`);
  console.log(`      POST /api/auth/login`);
  console.log(`      POST /api/auth/request-reset`);
  console.log(`      POST /api/auth/reset-password`);
  console.log(`   📋 Reservas:`);
  console.log(`      GET  /api/bookings (protegida)`);
  console.log(`      POST /api/bookings (pública)`);
  console.log(`   🖼️ Galería:`);
  console.log(`      GET  /api/gallery (pública)`);
  console.log(`      POST /api/gallery (protegida)`);
});
