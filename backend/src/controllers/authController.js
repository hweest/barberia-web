// backend/src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../config/database");

// ============================================
// SECRETO PARA JWT
// ============================================
const JWT_SECRET = "tu_secreto_super_seguro_cambia_esto";

// ============================================
// CONFIGURACIÓN DE CORREO
// ============================================
// NOTA: Para Gmail necesitas usar una "Contraseña de aplicación"
// Ve a: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hectorpedraza624@gmail.com",
    pass: "TU_CONTRASEÑA_DE_APLICACION", // ← ¡CAMBIA ESTO!
  },
});

// ============================================
// 1. LOGIN
// ============================================
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son obligatorios",
    });
  }

  // Buscar usuario
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error al buscar usuario",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Verificar contraseña
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Crear token JWT
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
};

// ============================================
// 2. VERIFICAR TOKEN (Middleware)
// ============================================
exports.verifyToken = (req, res, next) => {
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
// 3. SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================
exports.requestPasswordReset = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El email es obligatorio",
    });
  }

  // Buscar usuario
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        success: false,
        message: "No existe una cuenta con ese email",
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
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

        // Enviar correo
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
};

// ============================================
// 4. RESTABLECER CONTRASEÑA
// ============================================
exports.resetPassword = (req, res) => {
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

  // Buscar usuario con token válido
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

      // Encriptar nueva contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // Actualizar contraseña
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
};

// ============================================
// 5. CAMBIAR CONTRASEÑA (Estando logueado)
// ============================================
exports.changePassword = (req, res) => {
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

  // Buscar usuario
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }

    // Encriptar nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Actualizar
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
};
